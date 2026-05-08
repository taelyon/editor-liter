import express from 'express';
import Parser from 'rss-parser';
import { GoogleDecoder } from 'google-news-url-decoder';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import iconv from 'iconv-lite';

const app = express();

const parser = new Parser({
  customFields: {
    item: ['media:content', 'description', 'source']
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});

const decoder = new GoogleDecoder();

// Default Vercel serverless functions usually don't have body-parsing middleware attached by default if it's top-level express, so we can add or leave it out if we don't need body, here we only use query.

app.get(['/api/health', '/health'], (req, res) => {
  res.json({ status: 'ok' });
});

app.get(['/api/article', '/article'], async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }

    let targetUrl = url;
    if (url.includes('news.google.com')) {
      // First try standard decoding
      const decoded = await decoder.decode(url).catch(() => ({ status: false }));
      if (decoded && decoded.status && decoded.decoded_url) {
        targetUrl = decoded.decoded_url;
      } else {
        // Fallback: extract base64 segment and decode url
        const match = url.match(/\/articles\/([a-zA-Z0-9_\-\=]+)/);
        if (match && match[1]) {
          try {
            const base64Str = match[1];
            // Sometimes it's base64url, so replace - with + and _ with /
            const normalizedBase64 = base64Str.replace(/-/g, '+').replace(/_/g, '/');
            const decodedStr = Buffer.from(normalizedBase64, 'base64').toString('utf-8');
            const extracted = decodedStr.match(/https?:\/\/[a-zA-Z0-9_\-\.\/\?\=\&\%]+/)?.[0];
            if (extracted) {
              targetUrl = extracted;
              console.log('Fallback extracted URL:', targetUrl);
            } else {
              console.log('Fallback extract failed string:', decodedStr);
            }
          } catch (e) {
            console.error('Fallback URL extract failed', e);
          }
        } else {
          console.log('Regex match failed for URLs:', url);
        }
      }
    }
    console.log('Fetching target URL:', targetUrl);

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Determine charset
    const contentType = response.headers.get('content-type') || '';
    let charsetMatch = contentType.match(/charset=([^;]+)/i);
    let charset = charsetMatch ? charsetMatch[1].toLowerCase() : 'utf-8';
    
    let html = iconv.decode(buffer, charset);
    
    // Check for charset in meta tags if it's not explicitly in headers or might be wrong
    if (html.includes('charset=euc-kr') || html.includes('charset="euc-kr"') || html.includes('charset=EUC-KR') || html.includes('EUC-KR')) {
      if (charset !== 'euc-kr' && charset !== 'cp949') {
        html = iconv.decode(buffer, 'euc-kr');
      }
    } else if (html.includes('charset=ks_c_5601-1987')) {
       html = iconv.decode(buffer, 'cp949');
    }

    const doc = new JSDOM(html, { url: targetUrl, runScripts: 'dangerously' });
    const document = doc.window.document;

    // Fix images BEFORE Readability: swap lazy loading attributes
    document.querySelectorAll('img, [data-src], [data-original], [org-src]').forEach(el => {
      const img = el as HTMLImageElement;
      const isImg = el.tagName === 'IMG';
      
      const lazyAttrs = ['data-src', 'data-original', 'org-src', 'data-lazy-src', 'data-actual-src', 'data-alt-src', 'data-actualsrc', 'file', 'data-file', 'data-url'];
      
      let foundSrc = '';
      for (const attr of lazyAttrs) {
        const val = el.getAttribute(attr);
        if (val && (val.startsWith('http') || val.startsWith('//') || val.includes('.jpg') || val.includes('.png') || val.includes('.jpeg') || val.includes('.webp'))) {
          foundSrc = val;
          break;
        }
      }

      if (foundSrc) {
        if (isImg) {
          if (!img.src || img.src.startsWith('data:') || img.src.includes('about:blank') || img.getAttribute('width') === '1' || img.getAttribute('height') === '1') {
            img.src = foundSrc;
          }
        } else {
          // If it's a div/span with data-src, and it doesn't have an img child, maybe it's meant to be one?
          if (el.children.length === 0) {
             const newImg = document.createElement('img');
             newImg.src = foundSrc;
             el.appendChild(newImg);
          }
        }
      }
      
      if (isImg) {
        // Ensure absolute URL
        try {
          if (img.src && !img.src.startsWith('http') && !img.src.startsWith('data:')) {
            const absoluteUrl = new URL(img.src, targetUrl).href;
            img.src = absoluteUrl;
          }
        } catch (e) {}

        img.setAttribute('referrerpolicy', 'no-referrer');
        img.removeAttribute('loading');
        img.removeAttribute('srcset');
        if (img.getAttribute('width') === '1') img.removeAttribute('width');
        if (img.getAttribute('height') === '1') img.removeAttribute('height');
        img.style.display = 'block';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
      }
    });

    const reader = new Readability(document);
    let article = reader.parse();

    // Specific Chosun Ilbo handling: Often Readability parses it incorrectly if it's an editorial
    if (targetUrl.includes('chosun.com')) {
      console.log('Chosun Ilbo detected, prioritizing custom extraction');
      article = null; // Forces fallback
    }

    // Fallback if Readability fails
    if (!article) {
      console.log('Readability failed, attempting fallback for:', targetUrl);
      
      // DEBUG: Log a sample of the document structure if Readability fails
      const bodyElements = Array.from(document.querySelectorAll('body *'));
      const sampleTags = bodyElements.slice(0, 50).map(el => el.tagName).join(', ');
      console.log('DEBUG: Document body sample tags:', sampleTags);
      
      const title = document.title || document.querySelector('h1')?.textContent || '제목 없음';
      
      // Look for common article containers in Korean news sites
      const selectors = [
        'article', '.article_body', '#articleBody', '#articleBodyContents', 
        '.article-body', '.view_con', '.news_body', '#news_body', 
        '.content_area', '#content_area', '[itemprop="articleBody"]',
        '.art_body', '.article_view', '.v_appp', '#article-body', '#article_body',
        '.news_article', '.story-card', 'main', 'section.article-body',
        '.article-content', '#article_content', '.par', '.article_txt', '.article_body',
        'div.article_body'
      ];
      
      let mainContent = '';
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        // Exclude headers, navs, footers from being chosen as main content
        if (el && el.textContent && el.textContent.length > 300) {
          const tagName = el.tagName.toLowerCase();
          if (['nav', 'header', 'footer'].includes(tagName)) continue;
          mainContent = el.innerHTML;
          break;
        }
      }
      
      // If still nothing, try largest div/section/main with significant text density
      if (!mainContent) {
        let maxScore = 0;
        document.querySelectorAll('div, section, main').forEach(el => {
          // Skip utility elements
          if (el.matches('header, footer, nav, aside, .sidebar, .comments')) return;

          const pCount = el.querySelectorAll('p').length;
          const brCount = el.querySelectorAll('br').length;
          const textLen = (el.textContent || '').trim().length;
          
          // Heuristic score: length + bonus for paragraphs and line breaks
          const score = (textLen * 0.1) + (pCount * 50) + (brCount * 10);
          
          if (score > maxScore && textLen > 100) {
            maxScore = score;
            mainContent = el.innerHTML;
          }
        });
      }
      
      // Check for JSON-LD as a ultra-deep fallback
      if (!mainContent) {
          const scripts = document.querySelectorAll('script[type="application/ld+json"]');
          for (const script of scripts) {
              try {
                  const data = JSON.parse(script.textContent || '');
                  // Handle both single object and array of objects
                  const items = Array.isArray(data) ? data : [data];
                  for (const item of items) {
                      if (item['@type'] === 'NewsArticle' || item['@type'] === 'Article') {
                          if (item.articleBody) {
                              mainContent = item.articleBody.split('\n').map((p: string) => `<p>${p}</p>`).join('');
                              break;
                          }
                      }
                  }
                  if (mainContent) break;
              } catch (e) {
                  // ignore parse errors
              }
          }
      }
      
      if (mainContent && mainContent.length > 100) {
        article = {
          title,
          content: mainContent,
          textContent: title, // placeholder
          byline: '',
          length: mainContent.length,
          excerpt: '',
          siteName: '',
          dir: 'ltr',
          lang: 'ko'
        };
      }
    }

    if (!article) {
      console.error('Final parse failure for:', targetUrl);
      const title = document.title;
      const bodyText = document.body.textContent || '';
      console.log('DEBUG: Document title:', title);
      console.log('DEBUG: Document body text length:', bodyText.length);
      console.log('DEBUG: Document body snippet:', bodyText.substring(0, 500));
      
      const bodyElements = Array.from(document.querySelectorAll('body *'));
      const sampleTags = bodyElements.slice(0, 50).map(el => el.tagName).join(', ');
      
      return res.status(404).json({ 
        error: 'Could not parse article', 
        details: `Readability and custom fallbacks failed. Title: ${title}, Body text length: ${bodyText.length}, Sample tags: ${sampleTags}`,
        snippet: html.substring(0, 500)
      });
    }

    const cleanDoc = new JSDOM(article.content);
    const cleanDocument = cleanDoc.window.document;

    const boilerplates = [
      '뉴스 듣기', '뉴스듣기', 
      '글자 크기', '글자크기', '글자 크기 설정', 
      '보통', '크게', '아주 크게', 
      '북마크', '다크모드', '프린트', 
      '네이버 채널구독', '다음 채널구독',
      '이 기사를 추천합니다.', '이 기사를 추천합니다', '기사 추천',
      '읽기모드', '폰트크기', '기사반응', '시리즈', '이슈NOW', '관련기사', '관련 기사', '추천기사', '추천 기사', '기사 더보기', '기사더보기',
      '추천해요', '좋아요', '감동이에요', '화나요', '슬퍼요', '슬퍼요0',
      '관련기사', '관련 기사', '추천기사', '추천 기사', '인기기사', '인기 기사',
      '기사 더보기', '기사더보기', '뉴스 더보기', '뉴스더보기',
      '다른 기사', '최신 뉴스', '주요 뉴스', '헤드라인',
      '바로가기', '클릭', '보러가기', '독자들의 PICK!', '독자들의 PICK',
      '돈이 보이는 리얼타임 뉴스',
      '이미지 확대', '이미지 확대 보기', '닫기'
    ];

    const cleanTitle = (article.title || '').replace(/\s+/g, '').replace(/['"“”‘’]/g, '').replace(/[·∙・\-,]/g, '');

    cleanDocument.querySelectorAll('*').forEach(el => {
      if (el.matches('img, iframe, video, audio, figure, picture, svg') || el.querySelector('img, iframe, video, audio, figure, picture, svg')) {
        return;
      }

      const textContent = el.textContent || '';
      const t = textContent.trim();
      
      if (t.length > 0 && t.length < 200) {
        const cleanT = t.replace(/\s+/g, '').replace(/['"“”‘’]/g, '').replace(/[·∙・\-,]/g, '');
        
        const isTitleMatch = cleanTitle.length > 8 && cleanT.length > 8 && 
                             (cleanTitle.includes(cleanT) || cleanT.includes(cleanTitle)) &&
                             cleanT.length <= cleanTitle.length + 50 &&
                             (cleanT.length >= cleanTitle.length * 0.4);
                             
        const isDateMatch = /^입력\s*20\d{2}/.test(t) ||
                            /^수정\s*20\d{2}/.test(t) ||
                            /^승인\s*20\d{2}/.test(t) ||
                            /^등록\s*20\d{2}/.test(t) ||
                            /^기사승인\s*20\d{2}/.test(t) ||
                            /^지면\s*\d+면/.test(t) ||
                            /^\d{4}-\d{2}-\d{2}\s*\d+면/.test(t) ||
                            /^\[.*?\]\s*20\d{2}/.test(t);
                            
        const isCopyright = t.includes('ⓒ') || t.includes('Copyright') || t.includes('무단 전재') || t.includes('무단전재') || t.includes('재배포 금지') || t.includes('재배포금지') || t.includes('AI학습') || t.includes('저작권자');
        
        const isBoilerplateMatch = boilerplates.some(b => cleanT.includes(b.replace(/\s+/g, ''))) || 
                                   t === '가' || 
                                   cleanT.includes('가보통가크게') ||
                                   cleanT.includes('채널구독') ||
                                   cleanT.includes('이기사를추천합니다');
        
        // Remove numeric strings that look like counts
        const isNumericCount = /^\d+$/.test(t) && t.length < 6;

        // More aggressive pattern for related/external links
        const isJournalismPunctuation = t.includes('“') || t.includes('‘') || t.includes('”') || t.includes('’') || t.includes('…') || t.includes('...');
        const hasNewsActionKeywords = (t.includes('기사') || t.includes('뉴스')) && (t.includes('더보기') || t.includes('목록') || t.includes('추천') || t.includes('관련'));
        
        const isRelatedSection = t.includes('[사설]') || 
                                 t.includes('사설]') || 
                                 t.startsWith('#') || 
                                 (t.includes('#') && t.length < 25) ||
                                 t.startsWith('이슈') ||
                                 hasNewsActionKeywords ||
                                 (el.tagName === 'A' && (
                                   t.includes('속보') || t.includes('발생') || t.includes('실종') || t.includes('전망') || t.includes('포착') ||
                                   (isJournalismPunctuation && t.length > 10) ||
                                   (t.length > 12 && (t.includes('...') || t.includes('…'))) ||
                                   /^[‘“'"\[]/.test(t)
                                 ));

        if (isTitleMatch || isDateMatch || isCopyright || isBoilerplateMatch || isNumericCount || isRelatedSection) {
          el.remove();
        }
      }
    });

    // Aggressive deduplication for repeated captions or paragraphs
    const seenTexts = new Set<string>();
    cleanDocument.querySelectorAll('p, div, span, figcaption, em').forEach(el => {
      // Only check elements that are mostly text and non-empty
      if (el.children.length > 0 && !Array.from(el.childNodes).every(n => n.nodeType === 3 || (n.nodeType === 1 && ['BR', 'EM', 'SPAN', 'STRONG'].includes((n as Element).tagName)))) return;
      
      const t = (el.textContent || '').trim();
      if (t.length < 5) return;

      const cleanT = t.replace(/\s+/g, '').replace(/['"“”‘’]/g, '');
      
      // If we've seen this exact text (ignoring whitespace) before, remove it
      if (seenTexts.has(cleanT)) {
        el.remove();
        return;
      }
      
      // Check for fuzzy match with recently seen texts
      for (const seen of seenTexts) {
          // If current text is a subset of a previously seen larger text, or vice-versa
          if (seen.length > 10 && cleanT.length > 10) {
              if (seen.includes(cleanT) || cleanT.includes(seen)) {
                  el.remove();
                  return;
              }
          }
          
          if (seen.length > 20 && Math.abs(cleanT.length - seen.length) < 30) {
              // Simple similarity check: if they share a large common prefix or suffix
              if (cleanT.startsWith(seen.substring(0, 15)) || cleanT.endsWith(seen.substring(seen.length - 15))) {
                  el.remove();
                  return;
              }
          }
      }

      seenTexts.add(cleanT);
    });
    
    for (let i = 0; i < 3; i++) {
      cleanDocument.querySelectorAll('*').forEach(el => {
        if (el.children.length === 0 && (!el.textContent || el.textContent.trim() === '') && !['IMG', 'BR', 'HR', 'IFRAME', 'VIDEO'].includes(el.tagName)) {
          el.remove();
        }
      });
    }

    res.json({
      title: article.title,
      content: cleanDocument.body.innerHTML,
      textContent: article.textContent,
      byline: article.byline,
      originalUrl: targetUrl
    });
  } catch (err: any) {
    console.error('Article Fetch Error:', err);
    res.status(500).json({ error: 'Failed to fetch article', details: err.message });
  }
});

app.get(['/api/editorials', '/editorials'], async (req, res) => {
  try {
    let allItems: any[] = [];
    const url = 'https://news.google.com/rss/search?q=intitle:%22%EC%82%AC%EC%84%A4%22+when:1d&hl=ko&gl=KR&ceid=KR:ko';
    
    try {
      const fetchedInfo = await parser.parseURL(url);
      
      const excludedSources = ['daum.net', 'v.daum.net', 'nate.com', 'naver.com', 'msn.com', 'zum.com', '네이트', '다음', '네이버', '연합뉴스', '뉴시스', '뉴스1'];

      const centralMedia = [
        '조선일보', '중앙일보', '동아일보', '한겨레', '경향신문', 
        '한국일보', '서울신문', '세계일보', '국민일보', '문화일보', 
        '매일경제', '한국경제', '서울경제', '헤럴드경제', '아시아경제', 
        '파이낸셜뉴스', '머니투데이', '이데일리', '전자신문', '디지털타임스',
        'KBS', 'MBC', 'SBS', 'YTN', 'JTBC', 'MBN', 'TV조선', '채널A',
        '오마이뉴스', '노컷뉴스', '프레시안', '미디어오늘', '기자협회보'
      ];

      allItems = fetchedInfo.items
        .filter(item => {
          const source = (item.source || '').toLowerCase();
          const notExcluded = !excludedSources.some(excluded => source.includes(excluded.toLowerCase()));
          const isCentral = centralMedia.some(media => source.includes(media));
          
          const nowKst = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
          const pubKst = new Date(new Date(item.pubDate || '').getTime() + 9 * 60 * 60 * 1000);
          
          // 최근 24시간 이내의 기사만 허용 (날짜가 바뀌더라도 최신 기사 표시)
          const isRecent = nowKst.getTime() - pubKst.getTime() <= 24 * 60 * 60 * 1000;
          
          return notExcluded && isCentral && isRecent;
        })
        .map(item => {
        let publisher = item.source || '종합 일간지';
        let title = item.title || '';
        
        if (item.source && title.endsWith(` - ${item.source}`)) {
            title = title.substring(0, title.lastIndexOf(` - ${item.source}`)).trim();
        }
        
        let snippet = item.contentSnippet || item.content || item.description || '';
        snippet = snippet.replace(/<[^>]+>/g, '').trim();
        
        if (snippet.includes(title) || snippet.includes(item.title)) {
          snippet = '';
        }
        else if (snippet.length > 200) {
          snippet = snippet.substring(0, 200) + '...';
        }

        const isCentral = centralMedia.some(media => publisher.includes(media));
        
        return {
          id: item.guid || item.link,
          publisher: publisher,
          title: title,
          link: item.link,
          pubDate: item.pubDate,
          contentSnippet: snippet,
          mediaType: isCentral ? 'central' : 'local'
        };
      });
    } catch (feedError) {
      console.error(`Failed to fetch RSS:`, feedError);
    }

    allItems.sort((a, b) => {
      if (a.publisher < b.publisher) return -1;
      if (a.publisher > b.publisher) return 1;
      return new Date(a.pubDate).getTime() - new Date(b.pubDate).getTime();
    });

    res.json(allItems);
  } catch (error: any) {
    console.error('RSS Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch editorials', details: error.message });
  }
});

export default app;
