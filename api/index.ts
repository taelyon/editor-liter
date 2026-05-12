import express from 'express';
import Parser from 'rss-parser';
import { GoogleDecoder } from 'google-news-url-decoder';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import iconv from 'iconv-lite';
import { GoogleGenAI } from '@google/genai';

const fallbackClassicsData = [
  {
    id: 1,
    category: "동양",
    title: "논어",
    author: "공자",
    quote: "배우고 때로 익히면 또한 기쁘지 아니한가. (학이시습지 불역열호)",
    content: "배움의 즐거움을 강조하며, 끊임없는 자기 수양을 통해 군자가 되는 길을 제시합니다.",
    fullText: "자왈(子曰): 학이시습지(學而時習之)면 불역열호(不亦說乎)아.\n유붕(有朋)이 자원방래(自遠方來)면 불역락호(不亦樂乎)아.\n인부지이불온(人不知而不慍)이면 불역군자호(不亦君子乎)아.\n\n공자께서 말씀하셨다.\n\"배우고 때때로 그것을 익히면 또한 기쁘지 않은가?\n벗이 먼 곳에서 찾아오면 또한 즐겁지 않은가?\n남이 나를 알아주지 않아도 성내지 않는다면 또한 군자답지 않은가?\""
  },
  {
    id: 2,
    category: "동양",
    title: "도덕경",
    author: "노자",
    quote: "가장 좋은 것은 물과 같다. (상선약수)",
    content: "만물에 이로움을 주면서도 다투지 않는 물의 성질을 본받아 순리에 따르는 삶을 이야기합니다.",
    fullText: "상선약수(上善若水). 수선리만물(水善利萬物) 이부쟁(而不爭),\n처중인지소오(處衆人之所惡), 고기가어도(故幾於道).\n\n최상의 선은 물과 같다.\n물은 만물을 이롭게 하는 데 뛰어나지만 결코 다투지 않고,\n뭇사람들이 싫어하는 낮은 곳에 머문다.\n그러므로 도(道)에 가깝다."
  },
  {
    id: 3,
    category: "서양",
    title: "명상록",
    author: "마르쿠스 아우렐리우스",
    quote: "우주에 일어나는 일은 우주에 이롭다.",
    content: "스토아 철학의 정수로, 외부 환경에 흔들리지 않는 내면의 평화와 이성적 삶을 기록했습니다.",
    fullText: "너의 내면을 들여다보라. 그곳에 선의 샘이 있다. 네가 계속 파고만 든다면, 그 샘은 계속 솟아오를 것이다.\n\n우리는 서로 돕기 위해 태어났다. 이것은 아래윗니, 두 손, 두 발, 두 눈의 관계와 같다.\n따라서 서로 대적하는 것은 본성에 어긋난다. 서로 분노하고 등을 돌리는 것은 곧 서로 대적하는 일이다."
  },
  {
    id: 4,
    category: "서양",
    title: "군주론",
    author: "니콜로 마키아벨리",
    quote: "사랑받는 것보다 두려움의 대상이 되는 것이 더 안전하다.",
    content: "이상적인 정치가 아닌 현실 정치의 냉혹함을 분석하며 국가를 유지하기 위한 권력의 속성을 다룹니다.",
    fullText: "인간이란 은혜를 모르고 변덕스러우며 위선적인 데다 기만에 능하며 위험을 피하려고 하고 이익에 어두운 존재이다.\n네가 그들에게 은혜를 베푸는 동안 그들은 전적으로 너의 사람이다. 그러나 위험이 닥치면 그들은 등을 돌린다.\n\n따라서 군주는 사랑받기보다는 두려움의 대상이 되는 편이 훨씬 더 안전하다."
  },
  {
    id: 5,
    category: "동양",
    title: "장자",
    author: "장자",
    quote: "쓸모없음의 쓸모 (무용지용)",
    content: "눈앞의 이익이나 세속적인 가치 기준에서 벗어나 자유로운 정신의 경지를 추구합니다.",
    fullText: "사람들은 모두 유용(有用)의 쓰임은 알지만, 무용(無用)의 쓰임은 알지 못한다.\n\n산에 있는 나무는 쓸모가 있기 때문에 도끼로 찍혀 베어지고, 기름은 자신을 태워 불을 밝힌다.\n쓸모 있는 것은 그 쓸모 때문에 스스로를 갉아먹지만, 쓸모없는 것은 천수를 누릴 수 있다. 이것이 무용지용(無用之用)이다."
  },
  {
    id: 6,
    category: "서양",
    title: "차라투스트라는 이렇게 말했다",
    author: "프리드리히 니체",
    quote: "너의 운명을 사랑하라. (Amor Fati)",
    content: "초인 사상과 영원회귀를 통해 인간 내면의 강력한 의지와 삶의 긍정을 부르짖습니다.",
    fullText: "인간은 짐승과 초인 사이에 매어진 밧줄이다. 심연 위에 매어진 밧줄이다.\n저편으로 건너가는 것도 위험하고, 건너가는 과정도 위험하며, 뒤돌아보는 것도 위험하고, 벌벌 떨며 멈춰 서 있는 것도 위험하다.\n\n인간에게 위대한 점이 있다면 그것은 인간이 다리일 뿐, 목적이 아니라는 것이다.\n나는 자신의 파멸을 바라는 자 외에는 누구도 사랑하지 않는다. 왜냐하면 그는 저편으로 건너가는 자이기 때문이다."
  }
];

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
    const { url, title: providedTitle } = req.query;
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
    
    // Convert Donga AMP URLs to generic article URLs as AMP is discontinued/broken for some articles
    if (targetUrl.includes('donga.com/news/amp/')) {
      targetUrl = targetUrl.replace('/amp/', '/article/');
    }
    
    // Use AMP for Hankook Ilbo as it is easier to parse and often contains full text where the main site doesn't
    if (targetUrl.includes('hankookilbo.com/News/Read/')) {
      targetUrl = targetUrl.replace('/News/Read/', '/news/article/amp/');
    } else if (targetUrl.includes('hankookilbo.com/news/article/') && !targetUrl.includes('/amp/')) {
      targetUrl = targetUrl.replace('/news/article/', '/news/article/amp/');
    }
    
    // Hardcoded fix for a known broken DongA Ilbo editorial URL mapping
    if (targetUrl.includes('133895023/2')) {
      targetUrl = targetUrl.replace('133895023/2', '133895383/1');
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
    const headContents = html.substring(0, 4000);
    const hasEucKrMeta = /<meta[^>]+(?:charset=["']?|content=["'][^"']*charset=)(euc-kr|cp949|ks_c_5601-1987)/i.test(headContents);

    if (hasEucKrMeta && charset !== 'euc-kr' && charset !== 'cp949') {
      html = iconv.decode(buffer, 'cp949');
    }

    const doc = new JSDOM(html, { url: targetUrl });
    const document = doc.window.document;

    // Clean up unwanted DOM elements before Readability parsing
    const removeSelectors = [
      '[data-layer-type="keypoint"]', // MK AI summary
      '[data-layer-type="commentary"]', // MK AI insight
      '[data-hide-in-app=""]', // MK MAI agent floating banner
      '.news_read_end', // Chosun end of article
      'div:has(> p > a[href*="mai.mk.co.kr"])', // MK MAI Agent fallback
      'div:has(> p > span > img[alt="마이에이전트"])', // MK MAI Agent
      'ul:has(> li[data-video-url])', // MK Shorts video list
      // Also MK Shorts header if any
      'h3:has(> img[alt="MK_Shorts"])',
      // HanKyoReh Elements
      'div[class*="AudioPlayer"]', // Audio player
      'div[class*="BaseAd"]', // Advertisement
      'div[class*="adWrap"]', // Advertisement wrapper
      // DongA Ilbo trackers and subscriptions
      '.subscribe_wrap',
      '.subscribe_recom',
      '.recom_head',
      'img[src*="contentsfeed.com"]',
      'img[src*="RealMedia"]',
      'img[src*="adstream"]',
      'button[class*="btn_subscribe"]',
      // Additional Ads
      '[id^="ad_"]',
      '[class*="ad_center"]',
      '[class*="ad_wrap"]',
      '[id*="div-gpt-ad"]',
      '[class*="banner-article"]',
      '[id^="ads"]'
    ];

    removeSelectors.forEach(selector => {
      try {
        const els = document.querySelectorAll(selector);
        els.forEach(el => el.remove());
      } catch (e) {
        // Ignore invalid selectors
      }
    });

    // Also remove MK "Shorts" text if it's there
    document.querySelectorAll('h3, h4, h2').forEach(el => {
      if (el.textContent?.trim() === 'Shorts' || el.textContent?.trim() === 'MK_Shorts') {
        el.remove();
      }
    });
    
    document.querySelectorAll('audio, video').forEach(el => el.remove());

    // Remove width and height attributes from images to prevent huge gaps
    document.querySelectorAll('img').forEach(el => {
      el.removeAttribute('width');
      el.removeAttribute('height');
      el.removeAttribute('style'); // Strip inline styles on images too
    });

    // Also strip inline styles from any div wrapping an image, as some sites use padding/aspect-ratio on wrappers
    document.querySelectorAll('div, figure, picture, span').forEach(el => {
       if (el.querySelector('img')) {
          el.removeAttribute('style');
       }
    });

    // MK Member Login barrier text cleanup
    document.querySelectorAll('.mem_service, .stock_story').forEach(el => el.remove());

    document.querySelectorAll('div, p, span, strong, em').forEach(el => {
       const text = el.textContent?.trim() || '';
       if (text.length < 200) {
         if (text.includes('매일경제 회원전용') && text.includes('서비스 입니다')) {
            el.remove();
         } else if (text.includes('기존 회원은 로그인 해주시고') || text.includes('무료 회원 가입')) {
            el.remove();
         } else if (text === '기사를 읽어드립니다' || text === '0:00' || text === '광고') {
            el.remove();
         }
       }
    });

    // If there is an itemprop="articleBody", let's move it to standard <article> to help Readability
    let preExtractedBody = '';
    const articleBody = document.querySelector('[itemprop="articleBody"]');
    if (articleBody) {
      preExtractedBody = articleBody.innerHTML;
    }

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

    // Remove tracking ads and known leftover texts
    document.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src') || '';
      if (src.includes('contentsfeed.com') || src.includes('RealMedia') || src.includes('adstream') || src.includes('ads')) {
        img.remove();
      }
    });

    document.querySelectorAll('*').forEach(el => {
      // Find Donga's text-only subscription remainders
      if (el.children.length === 0) {
        const txt = el.textContent?.trim() || '';
        if (txt === '구독' || txt === '기고' || txt.includes('의 음식처방') || txt.includes('내가 만난 명문장') || txt.includes('100세 시대 건강법')) {
          el.remove();
        }
      }
    });

    // Strip out hamburger menu and nav elements that Readability might accidentally parse
    document.querySelectorAll('nav, header, footer, .hamburger, [data-section*="hamburger"]').forEach(el => el.remove());

    // Add extract variables for updated time
    let articleUpdatedAt = '';
    const metaMod = document.querySelector('meta[property="article:modified_time"]') || 
                    document.querySelector('meta[name="article:modified_time"]') ||
                    document.querySelector('meta[itemprop="dateModified"]');
    if (metaMod) {
       articleUpdatedAt = metaMod.getAttribute('content') || '';
    } else {
       // Fallback for Hankyoreh and others that use "수정 <span>date</span>"
       const textMatch = html.match(/수정\s*<span[^>]*>([^<]+)<\/span>/);
       if (textMatch && textMatch[1]) {
           articleUpdatedAt = textMatch[1].trim(); // Usually "YYYY-MM-DD HH:mm"
       }
    }

    // Check for Arc XP / Fusion global content (Chosun, etc. browser-side render)
    // Inject it into DOM before Readability parsing
    const scripts = document.querySelectorAll('script');
    for (const s of scripts) {
      const content = s.textContent || '';
      if (content.includes('Fusion.globalContent=')) {
        try {
          let jsonStr = content.split('Fusion.globalContent=')[1];
          let endIdx = jsonStr.indexOf(';Fusion.');
          if (endIdx === -1) endIdx = jsonStr.indexOf(';');
          if (endIdx !== -1) jsonStr = jsonStr.substring(0, endIdx);
          const fusionData = JSON.parse(jsonStr);
          
          if (fusionData && fusionData.last_updated_date) {
             articleUpdatedAt = fusionData.last_updated_date;
          }

          if (fusionData && fusionData.content_elements) {
            const elements: string[] = [];
            fusionData.content_elements.forEach((el: any) => {
              if (el.type === 'text') {
                elements.push(`<p>${el.content}</p>`);
              } else if (el.type === 'header') {
                elements.push(`<h2>${el.content}</h2>`);
              } else if (el.type === 'image' && el.url) {
                elements.push(`<img src="${el.url}" alt="${el.caption || ''}" />`);
              } else if (el.content && typeof el.content === 'string') {
                elements.push(`<p>${el.content}</p>`);
              }
            });
            if (elements.length > 0) {
              const articleDiv = document.createElement('article');
              articleDiv.className = 'fusion-article-content';
              articleDiv.innerHTML = elements.join('');
              document.body.prepend(articleDiv);
              break;
            }
          }
        } catch (e) {}
      }
    }

    const documentClone = document.cloneNode(true);
    let article: any = null;
    
    // First try the pre-extracted structured body
    if (preExtractedBody && preExtractedBody.length > 200) {
       article = {
         title: document.title || document.querySelector('h1')?.textContent || '제목 없음',
         content: preExtractedBody,
         textContent: preExtractedBody.replace(/<[^>]+>/g, ''), // rough text content
         byline: '',
         length: preExtractedBody.length,
       };
    } else {
      const reader = new Readability(documentClone as Document);
      article = reader.parse();
    }

    // Fallback if Readability fails
    if (!article) {
      const title = document.title || document.querySelector('h1')?.textContent || '제목 없음';
      
      // Look for common article containers in Korean news sites
      const selectors = [
        'article', 'main', 'section[class*="article"]', 'div[class*="article"]',
        '.article_body', '#articleBody', '#articleBodyContents', '#articleText', '#articleContents',
        '.article-body', '.view_con', '.news_body', '#news_body', 
        '.content_area', '#content_area', '[itemprop="articleBody"]',
        '.art_body', '.article_view', '.v_appp', '#article-body', '#article_body',
        '.news_article', '.story-card', 'section.article-body',
        '.article-content', '#article_content', '.par', '.article_txt', '.article_body',
        'div.article_body', '.article-copy', '.art_txt', '.art_con', '.entry-content',
        '.post-content', '.news-article', '#content', '#main-content', '.premium_content'
      ];
      
      let mainContent = '';
      let bestFallback = { content: '', score: 0 };
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (!el.textContent) return;
          const tagName = el.tagName.toLowerCase();
          if (['nav', 'header', 'footer', 'aside'].includes(tagName)) return;
          
          const textLen = el.textContent.trim().length;
          const pCount = el.querySelectorAll('p').length;
          const brCount = el.querySelectorAll('br').length;
          const score = textLen + (pCount * 50) + (brCount * 20);
          
          if (score > bestFallback.score && textLen > 200) {
            bestFallback = { content: el.innerHTML, score: score };
          }
        });
      }
      
      mainContent = bestFallback.content;
      
      // If still nothing, try largest div/section/main/article with significant text density
      if (!mainContent) {
        let maxScore = 0;
        document.querySelectorAll('div, section, main, article').forEach(el => {
          // Skip utility elements
          if (el.matches('header, footer, nav, aside, .sidebar, .comments, .ad-unit')) return;

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
          lang: 'ko',
          publishedTime: ''
        };
      } else {
        console.error('Custom fallback also failed to extract significant content for:', targetUrl);
      }
    }

    if (article && article.textContent && article.textContent.includes('요청하신 페이지를 찾을 수 없습니다') && targetUrl.includes('donga.com')) {
      article = null;
      console.log('DongA 404 detected, skipping to final parse failure.');
      return res.status(404).json({
        error: '원문이 삭제되었거나 주소가 변경되었습니다.',
        details: 'Donga Ilbo article not found.',
        snippet: ''
      });
    }

    if (!article) {
      console.error('Final parse failure for:', targetUrl);
      
      return res.status(404).json({ 
        error: 'Could not parse article', 
        details: `Readability and custom fallbacks failed.`,
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
    
    cleanDocument.querySelectorAll('amp-img').forEach(el => {
      const img = cleanDocument.createElement('img');
      const src = el.getAttribute('src');
      if (src) {
        img.src = src;
        img.alt = el.getAttribute('alt') || '';
        if (el.className) img.className = el.className;
        img.setAttribute('referrerpolicy', 'no-referrer');
        el.replaceWith(img);
      }
    });

    for (let i = 0; i < 3; i++) {
      cleanDocument.querySelectorAll('*').forEach(el => {
        if (el.tagName === 'BODY' || el.tagName === 'HTML' || el.tagName === 'HEAD') return;
        if (el.children.length === 0 && (!el.textContent || el.textContent.trim() === '') && !['IMG', 'BR', 'HR', 'IFRAME', 'VIDEO'].includes(el.tagName)) {
          el.remove();
        }
      });
    }
    
    // Remove scripts and style elements explicitly
    cleanDocument.querySelectorAll('script, style, link, meta, noscript').forEach(el => el.remove());

    cleanDocument.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src');
        if (!src || src.trim() === '') {
            img.remove();
        } else {
            img.setAttribute('referrerpolicy', 'no-referrer');
        }
    });

    // Remove Seoul Shinmun imgModals and other hidden elements that might cause duplicate text
    cleanDocument.querySelectorAll('div[id^="imgModal_"]').forEach(el => el.remove());
    cleanDocument.querySelectorAll('a[href*="spotlight.seoul.co.kr"]').forEach(el => {
        const adContainer = el.closest('div') || el;
        adContainer.remove();
    });
    
    // Explicitly identify and tag image captions
    cleanDocument.querySelectorAll('img').forEach(img => {
        const isCaption = (text: string) => {
           if (!text) return false;
           text = text.trim();
           // Remove quotes to check actual sentence structure
           const cleanTextForCheck = text.replace(/['"“”‘’]/g, '');
           if (text.length === 0 || text.length > 200) return false; // Captions shouldn't be too long
           
           // Journalism picture sources
           if (text.includes('제공') || text.includes('사진=') || text.includes('사진 =') || 
               text.includes('출처') || text.includes('캡처') || text.includes('포토뉴스') || 
               text.includes('연합뉴스') || text.includes('뉴시스') || text.includes('뉴스1') ||
               text.includes('게티이미지') || text.includes('기자 =') || text.includes('기자=') ||
               /사진\s*픽사베이/.test(text) || /사진\s*로이터/.test(text) || /사진\s*AP/.test(text)) {
               return true;
           }
           
           // If it's short and doesn't end formally like an editorial paragraph does, it's likely a caption
           if (text.length < 90 && !cleanTextForCheck.endsWith('다.') && !cleanTextForCheck.endsWith('다')) {
               return true;
           }
           return false;
        };

        // Check direct siblings
        let next = img.nextElementSibling;
        while (next && ['BR'].includes(next.tagName)) {
           next = next.nextElementSibling;
        }
        if (next && ['P', 'DIV', 'SPAN', 'FIGCAPTION', 'EM'].includes(next.tagName)) {
            if (isCaption(next.textContent || '')) {
                next.classList.add('custom-photo-caption');
            }
        }
        
        // Check wrapper siblings
        const parent = img.parentElement;
        if (parent && ['PICTURE', 'DIV', 'FIGURE', 'SPAN', 'P'].includes(parent.tagName)) {
            // For some wrappers like FIGURE, the figcaption is inside
            if (parent.tagName === 'FIGURE') {
                const figcap = parent.querySelector('figcaption');
                if (figcap) figcap.classList.add('custom-photo-caption');
            }

            let pNext = parent.nextElementSibling;
            while (pNext && ['BR'].includes(pNext.tagName)) {
               pNext = pNext.nextElementSibling;
            }
            if (pNext && ['P', 'DIV', 'SPAN', 'FIGCAPTION', 'EM'].includes(pNext.tagName)) {
                if (isCaption(pNext.textContent || '')) {
                    pNext.classList.add('custom-photo-caption');
                }
            }
        }
    });
    
    let finalContent = cleanDocument.body?.innerHTML || article.content;
    
    // Explicitly remove specific copyright text patterns (including HTML tags inside)
    finalContent = finalContent.replace(/GoodNews paper ⓒ[\s\S]*?AI학습 이용 금지/gi, '');
    
    // Clean up excessive BR tags and spaces after block elements
    finalContent = finalContent.replace(/(<br\s*\/?>\s*){2,}/gi, '<br>');
    finalContent = finalContent.replace(/(<\/(div|figure|picture|figcaption|p|h[1-6])>)\s*(<br\s*\/?>\s*)+/gi, '$1');
    finalContent = finalContent.replace(/<!--[\s\S]*?-->/g, ''); // strip HTML comments
    finalContent = finalContent.replace(/>\s+</g, '><'); // strip whitespace between tags

    res.json({
      title: article.title,
      content: finalContent,
      textContent: article.textContent,
      byline: article.byline,
      originalUrl: targetUrl,
      updatedAt: articleUpdatedAt
    });
  } catch (err: any) {
    console.error('Article Fetch Error:', err);
    res.status(500).json({ error: 'Failed to fetch article', details: err.message });
  }
});

function cleanUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove common tracking parameters
    const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'rss', '_s', 'sn', 'service', 'kakao_from'];
    paramsToRemove.forEach(p => parsed.searchParams.delete(p));
    
    // Specific cleanup for Google News redirected URLs
    if (parsed.hostname === 'news.google.com' && parsed.searchParams.has('oc')) {
      parsed.searchParams.delete('oc');
    }
    
    return parsed.toString();
  } catch (e) {
    return url;
  }
}

app.get(['/api/editorials', '/editorials'], async (req, res) => {
  try {
    let allItems: any[] = [];
    const seenLinks = new Set<string>();
    const seenTitles = new Set<string>();
    
    const centralMedia = [
      '조선일보', '중앙일보', '동아일보', '한겨레', '경향신문', 
      '한국일보', '서울신문', '세계일보', '국민일보', '문화일보', 
      '매일경제', '한국경제', '서울경제', '헤럴드경제', '아시아경제', 
      '파이낸셜뉴스', '머니투데이', '이데일리', '전자신문', '디지털타임스',
      'KBS', 'MBC', 'SBS', 'YTN', 'JTBC', 'MBN', 'TV조선', '채널A',
      '오마이뉴스', '노컷뉴스', '프레시안', '미디어오늘', '기자협회보'
    ];
    
    // Direct feeds using regex to avoid XML parsing errors
    const directFeeds = [
      { publisher: '조선일보', url: 'https://www.chosun.com/arc/outboundfeeds/rss/category/opinion/?outputType=xml' },
      { publisher: '한겨레', url: 'https://www.hani.co.kr/rss/opinion/' },
      { publisher: '경향신문', url: 'https://www.khan.co.kr/rss/rssdata/opinion.xml' },
      { publisher: '서울신문', url: 'https://www.seoul.co.kr/news/newsInfo.php?rss=4' },
      { publisher: '동아일보', url: 'https://rss.donga.com/opinion.xml' },
      { publisher: '문화일보', url: 'http://www.munhwa.com/news/rss/opinion.xml' }
    ];

    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    
    // Fetch all direct feeds and bing news in parallel
    const feedPromises = directFeeds.map(async (f) => {
      const items: any[] = [];
      try {
        const response = await fetch(f.url, {
           headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
           signal: AbortSignal.timeout(7000)
        });
        const buffer = await response.arrayBuffer();
        
        let text = iconv.decode(Buffer.from(buffer), 'utf-8');
        if (text.includes('euc-kr') || text.includes('EUC-KR')) {
           text = iconv.decode(Buffer.from(buffer), 'euc-kr');
        }
        
        const localRegex = /<item>([\s\S]*?)<\/item>/gi;
        let match;
        while ((match = localRegex.exec(text)) !== null) {
           const itemXml = match[1];
           const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || itemXml.match(/<title>([\s\S]*?)<\/title>/i);
           const linkMatch = itemXml.match(/<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>/i) || itemXml.match(/<link>([\s\S]*?)<\/link>/i);
           const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
           const dcDateMatch = itemXml.match(/<dc:date>([\s\S]*?)<\/dc:date>/i);
           let descMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) || itemXml.match(/<description>([\s\S]*?)<\/description>/i);
           if (!descMatch) descMatch = itemXml.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/i) || itemXml.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i);
           
           const rawLink = linkMatch ? linkMatch[1].trim() : '';
           const link = cleanUrl(rawLink);
           let title = titleMatch ? titleMatch[1].trim() : '';
           
           // Clean title if it's from a search feed (like Google News)
           if (title.endsWith(' - ' + f.publisher)) {
               title = title.substring(0, title.length - (' - ' + f.publisher).length);
           }
           
           if (!link || !title || seenLinks.has(link) || seenTitles.has(title.replace(/\s+/g, ''))) {
               continue;
           }
           
           let pubDate = pubDateMatch ? pubDateMatch[1].trim() : (dcDateMatch ? dcDateMatch[1].trim() : '');
           if (!pubDate && f.publisher === '한겨레') {
               const dateMatch = rawLink.match(/\/(202\d)\/(0[1-9]|1[0-2])([0-3][0-9])\//);
               if (dateMatch) {
                   pubDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T00:00:00Z`;
               }
           }
           if (!pubDate) pubDate = new Date().toISOString();
           
           let description = descMatch ? descMatch[1].trim() : '';
           description = description
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&apos;/g, "'")
             .replace(/&amp;/g, '&')
             .replace(/&nbsp;/g, ' ');
           description = description.replace(/<[^>]+>/g, '').trim();
           
           const isEditorial = title.includes('[사설]') || 
                               (title.includes('사설') && !title.includes('사설 구급차') && !title.includes('사설 도박') && !title.includes('사설 업체') && !title.includes('사설 학원'));
           
           if (isEditorial) {
               if (link === 'https://www.hani.co.kr/arti/opinion' || link === 'https://www.hani.co.kr/arti/opinion/') {
                   continue; // Skip section top-level pages
               }
               
               seenLinks.add(link);
               seenTitles.add(title.replace(/\s+/g, ''));
               
               items.push({
                   id: link,
                   publisher: f.publisher,
                   title,
                   link,
                   pubDate,
                   contentSnippet: description.length > 200 ? description.substring(0, 200) + '...' : description,
                   mediaType: centralMedia.includes(f.publisher) ? 'central' : 'local'
               });
           }
        }
      } catch (err) {
        console.error(`Failed to fetch direct RSS from ${f.publisher}:`, err);
      }
      return items;
    });

    const hankookilboPromise = (async () => {
      const items: any[] = [];
      try {
        const response = await fetch('https://www.hankookilbo.com/news/opinion/editorial', {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          signal: AbortSignal.timeout(7000)
        });
        const html = await response.text();
        // Match JSON blobs that look like article objects - improved regex to handle potential nested structures better
        const matches = html.match(/\{"articleId":"([^"]+)"[\s\S]*?\}\}(?=[,\]]|$)/g) || 
                        html.match(/\{"articleId":"([^"]+)"[^\}]+\}/g) || [];
        
        for (const match of matches) {
           if (!match.includes('[사설]') && !match.includes('"bundleTitle":"사설"')) continue;
           if (match.includes('"ranking":')) continue; // Skip popular/ranking items which might be old
           
           const idMatch = match.match(/\"articleId\":\"([^\"]+)\"/);
           const titleMatch = match.match(/\"title\":\"([^\"]+)\"/);
           if (idMatch && titleMatch) {
              const id = idMatch[1];
              let title = titleMatch[1];
              
              // unicode decode
              title = title.replace(/\\u([0-9a-fA-F]{4})/g, (m, c) => String.fromCharCode(parseInt(c, 16)));
              const link = `https://www.hankookilbo.com/News/Read/${id}`;
              
              if (seenLinks.has(link) || seenTitles.has(title.replace(/\s+/g, ''))) continue;
              
              let pubDate = new Date().toISOString();
              const deployDtMatch = match.match(/\"deployDt\":\"([^\"]+)\"/);
              if (deployDtMatch) {
                 // The date string like "2026.05.12 00:10" or "2026-05-12 00:10:00" is in KST (UTC+9)
                 let dtStr = deployDtMatch[1].replace(/\./g, '-').replace(' ', 'T');
                 if (dtStr.length === 16) dtStr += ':00'; // add seconds if missing
                 
                 // If it's already got an offset or Z, use as is, otherwise add +09:00
                 if (!dtStr.includes('+') && !dtStr.endsWith('Z')) {
                    dtStr += '+09:00';
                 }
                 
                 // Directly use the ISO string with offset for consistency
                 pubDate = new Date(dtStr).toISOString();
              } else {
                 const dateMatch = id.match(/^A(202\d{5})/);
                 if (dateMatch) {
                    const dStr = dateMatch[1];
                    // Assume midnight KST for ID-based dates
                    pubDate = new Date(`${dStr.substring(0,4)}-${dStr.substring(4,6)}-${dStr.substring(6,8)}T00:00:00+09:00`).toISOString();
                 }
              }
              
              seenLinks.add(link);
              seenTitles.add(title.replace(/\s+/g, ''));
              
              items.push({
                 id: link,
                 publisher: '한국일보',
                 title,
                 link,
                 pubDate,
                 contentSnippet: '',
                 mediaType: 'central'
              });
           }
        }
      } catch(err) {
        console.error('Failed to fetch Hankookilbo:', err);
      }
      return items;
    })();

    const joongangPromise = (async () => {
      const items: any[] = [];
      try {
        const response = await fetch('https://www.joongang.co.kr/opinion/editorial', {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          signal: AbortSignal.timeout(7000)
        });
        const html = await response.text();
        const cards = html.split('<li class="card"').slice(1);
        for (const card of cards) {
           const linkMatch = card.match(/href=\"([^\"]+)\"/i);
           const titleMatch = card.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i);
           const dateMatch = card.match(/<p class=\"date\">([^<]+)<\/p>/i);
           
           if (linkMatch && titleMatch) {
              let link = linkMatch[1].trim();
              let title = titleMatch[1].trim().replace(/&#91;/g, '[').replace(/&#93;/g, ']').replace(/<[^>]+>/g, '').trim();
              
              if (!link.startsWith('http')) link = 'https://www.joongang.co.kr' + link;
              
              if (seenLinks.has(link) || seenTitles.has(title.replace(/\s+/g, ''))) continue;
              
              seenLinks.add(link);
              seenTitles.add(title.replace(/\s+/g, ''));
              
              let pubDate = new Date().toISOString();
              if (dateMatch) {
                 const rawDate = dateMatch[1].trim();
                 // rawDate is usually "YYYY.MM.DD HH:mm"
                 let dtStr = rawDate.replace(/\./g, '-').replace(' ', 'T');
                 if (dtStr.length === 16) dtStr += ':00';
                 if (!dtStr.includes('+') && !dtStr.endsWith('Z')) {
                    dtStr += '+09:00';
                 }
                 pubDate = new Date(dtStr).toISOString();
              }
              
              items.push({
                 id: link,
                 publisher: '중앙일보',
                 title,
                 link,
                 pubDate,
                 contentSnippet: '',
                 mediaType: 'central'
              });
           }
        }
      } catch(err) {
        console.error('Failed to fetch Joongang:', err);
      }
      return items;
    })();

    const bingPromise = (async () => {
      const items: any[] = [];
      try {
        const bingUrl = 'https://news.google.com/rss/search?q=%EC%82%AC%EC%84%A4+when:3d&hl=ko&gl=KR&ceid=KR:ko';
        const bingResponse = await fetch(bingUrl, {
           headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
           signal: AbortSignal.timeout(5000)
        });
        const text = await bingResponse.text();
        
        const localRegex = /<item>([\s\S]*?)<\/item>/gi;
        let match;
        while ((match = localRegex.exec(text)) !== null) {
           const itemXml = match[1];
           const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || itemXml.match(/<title>([\s\S]*?)<\/title>/i);
           const linkMatch = itemXml.match(/<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>/i) || itemXml.match(/<link>([\s\S]*?)<\/link>/i);
           const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
           const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
           let descMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) || itemXml.match(/<description>([\s\S]*?)<\/description>/i);
           
           let title = titleMatch ? titleMatch[1].trim() : '';
           title = title
              .replace(/&#183;/g, '·')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&apos;/g, "'")
              .replace(/&amp;/g, '&');
              
           let publisherNameInner = sourceMatch ? sourceMatch[1].trim() : '';
           if (publisherNameInner && title.endsWith(' - ' + publisherNameInner)) {
               title = title.substring(0, title.length - (' - ' + publisherNameInner).length);
           }
           
           let trackingLink = linkMatch ? linkMatch[1].trim() : '';
           trackingLink = trackingLink.replace(/&amp;/g, '&');
           const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();
           let description = descMatch ? descMatch[1].trim() : '';
           description = description
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&apos;/g, "'")
             .replace(/&amp;/g, '&')
             .replace(/&nbsp;/g, ' ');
           description = description.replace(/<[^>]+>/g, '').trim();
           
           let link = trackingLink;
           let publisher = sourceMatch ? sourceMatch[1].trim() : '종합 일간지';
           
           // If publisher needs normalization
           if (publisher === 'MK') publisher = '매일경제';
           else if (publisher === '조선일보') publisher = '조선일보';
           else if (publisher === '한겨레') publisher = '한겨레';
           else if (publisher === '경향신문') publisher = '경향신문';
           else if (publisher === '동아일보') publisher = '동아일보';
           else if (publisher === '중앙일보') publisher = '중앙일보';
           else if (publisher === '한국경제') publisher = '한국경제';
           else if (publisher === '매일경제') publisher = '매일경제';
           else if (publisher === '서울경제') publisher = '서울경제';
           else if (publisher === '한국일보') publisher = '한국일보';
           else if (publisher === '서울신문') publisher = '서울신문';
           else if (publisher === '세계일보') publisher = '세계일보';
           else if (publisher === '국민일보') publisher = '국민일보';
           else if (publisher === '문화일보') publisher = '문화일보';
           else if (publisher === '파이낸셜뉴스') publisher = '파이낸셜뉴스';
           else if (publisher === '머니투데이') publisher = '머니투데이';
           else if (publisher === '이데일리') publisher = '이데일리';
           else if (publisher === '아시아경제') publisher = '아시아경제';

           const isEditorial = title.includes('[사설]') || 
                               (title.includes('사설') && !title.includes('사설 구급차') && !title.includes('사설 도박') && !title.includes('사설 업체') && !title.includes('사설 학원'));
           
           if (isEditorial) {
               items.push({
                   id: link,
                   publisher,
                   title,
                   link,
                   pubDate,
                   contentSnippet: description.length > 200 ? description.substring(0, 200) + '...' : description,
                   mediaType: centralMedia.includes(publisher) ? 'central' : 'local'
               });
           }
        }
      } catch (err) {
        console.error('Failed to fetch Bing News RSS:', err);
      }
      return items;
    })();

    const results = await Promise.all([...feedPromises, hankookilboPromise, joongangPromise, bingPromise]);
    
    // Flatten and deduplicate
    const finalSeenLinks = new Set<string>();
    const finalSeenTitles = new Set<string>(); // composite: publisher + title
    
    for (const items of results) {
       for (const item of items) {
           const cleanedLink = cleanUrl(item.link);
           const cleanTitleKey = `${item.publisher}:${item.title.replace(/\s+/g, '')}`;
           
           if (!finalSeenLinks.has(cleanedLink) && !finalSeenTitles.has(cleanTitleKey)) {
               item.link = cleanedLink;
               item.id = cleanedLink;
               allItems.push(item);
               finalSeenLinks.add(cleanedLink);
               finalSeenTitles.add(cleanTitleKey);
           }
       }
    }

    // Attempt to fetch actual pubDate for 한겨레 articles if needed
    const haniItemsToFix = allItems.filter(item => item.publisher === '한겨레');
    if (haniItemsToFix.length > 0) {
        await Promise.allSettled(haniItemsToFix.map(async (item) => {
            try {
                const res = await fetch(item.link);
                const text = await res.text();
                const match = text.match(/article:published_time["']?\s*content=["']([^"']+)["']/i);
                if (match && match[1]) {
                    item.pubDate = match[1];
                }
            } catch (e: any) {
                console.error('Failed to fetch HanKyoReh original date:', e.message);
            }
        }));
    }

    const now = new Date();
    
    // Filter out old news (older than 3-4 days) and problematic redirects
    const excludedSources = ['daum.net', 'v.daum.net', 'nate.com', 'msn.com', 'zum.com'];
    
    allItems = allItems.filter(item => {
      const source = (item.publisher || '').toLowerCase();
      // Only exclude naver.com if the publisher is unknown or it's clearly a portal-only item
      // Many publishers today use Naver as their primary search result target
      const isExcludedLink = excludedSources.some(excluded => item.link.includes(excluded));
      
      const pubDate = new Date(item.pubDate || '');
      const isRecent = now.getTime() - pubDate.getTime() <= 96 * 60 * 60 * 1000; // 4 days (slightly wider)
      
      return !isExcludedLink && isRecent && item.mediaType === 'central';
    });

    allItems.sort((a, b) => {
      if (a.publisher < b.publisher) return -1;
      if (a.publisher > b.publisher) return 1;
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(); // Newest first for same publisher
    });

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=86400');
    res.json(allItems);
  } catch (error: any) {
    console.error('RSS Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch editorials', details: error.message });
  }
});

let cachedClassics: any = null;
let lastClassicsDate: string = '';

app.get(['/api/classics', '/classics'], async (req, res) => {
  try {
    // Generate new quotes once a day
    const today = new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
    if (cachedClassics && lastClassicsDate === today) {
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate');
      return res.json(cachedClassics);
    }
    
    if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `당신은 동양과 서양 고전에 정통한 매우 뛰어난 큐레이터입니다.
매일 새로운 영감을 주는 고전 명언을 사람들에게 소개합니다.
오늘을 위한 명언 6개(동양 고전 3개, 서양 고전 3개)를 무작위로 전혀 뻔하지 않고 새롭고 다양한 문헌에서 발췌해 주세요. (예: 논어, 군주론 외에도 한비자, 맹자, 채근담, 세네카, 플라톤, 셰익스피어, 에픽테토스 등 다양한 고전 활용)
현재 시간: ${new Date().getTime()}
정확히 아래 JSON 배열 형식으로만 응답해야 합니다.
[
  {
    "id": 1,
    "category": "동양" 또는 "서양",
    "title": "책이나 문헌 이름 (예: 논어, 군주론)",
    "author": "저자 이름",
    "quote": "유명한 짧은 명언",
    "content": "이 명언이 주는 핵심 교훈이나 통찰 (1~2문장)",
    "fullText": "이 명언이 포함된 맥락을 알 수 있는 원문 번역 또는 전체 문구 (동양 고전의 경우 한자 원문 병기 권장)"
  }
]`,
          config: {
              responseMimeType: "application/json",
              temperature: 0.9,
          }
      });

      const text = response.text;
      if (text) {
          const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
          if (Array.isArray(parsed) && parsed.length > 0) {
              // Add stable IDs
              const dataWithIds = parsed.map((item, index) => ({
                ...item,
                id: index + 1
              }));
              cachedClassics = dataWithIds;
              lastClassicsDate = today;
              res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate');
              return res.json(dataWithIds);
          }
      }
    }
    
    // Fallback if no API Key or Gemini fails
    throw new Error('Gemini API Error or No API Key');
  } catch (error: any) {
    const isApiKeyError = error.message?.includes('API key') || error.message?.includes('API_KEY_INVALID') || error.message?.includes('Gemini API Error or No API Key');
    if (isApiKeyError) {
      console.log('Classics Fetch: Fallback to static data (Gemini API Key missing or invalid).');
    } else {
      console.error('Classics Fetch Error:', error.message);
    }
    if (cachedClassics) {
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate');
      return res.json(cachedClassics);
    }
    // Static fallback
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate');
    res.json(fallbackClassicsData);
  }
});

export default app;
