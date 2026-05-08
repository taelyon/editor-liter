import express from 'express';
import { GoogleDecoder } from 'google-news-url-decoder';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

const app = express();
const decoder = new GoogleDecoder();

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
            }
          } catch (e) {
            console.error('Fallback URL extract failed', e);
          }
        }
      }
    }

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
      }
    });
    
    const html = await response.text();
    const doc = new JSDOM(html, { url: targetUrl });
    
    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    if (!article) {
      return res.status(404).json({ error: 'Could not parse article' });
    }

    const cleanDoc = new JSDOM(article.content);
    const cleanDocument = cleanDoc.window.document;
    
    const boilerplates = [
      '뉴스 듣기', '뉴스듣기', 
      '글자 크기', '글자크기', '글자 크기 설정', 
      '보통', '크게', '아주 크게', 
      '북마크', '다크모드', '프린트', 
      '네이버 채널구독', '다음 채널구독',
      '이 기사를 추천합니다.', '이 기사를 추천합니다', '기사 추천'
    ];

    const cleanTitle = (article.title || '').replace(/\s+/g, '').replace(/['"“”‘’]/g, '').replace(/[·∙・\-,]/g, '');

    cleanDocument.querySelectorAll('*').forEach(el => {
      if (el.querySelector('img, iframe, video, audio, figure, picture')) {
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
                            /^\[.*?\]\s*20\d{2}/.test(t);
                            
        const isCopyright = t.includes('ⓒ') || t.includes('Copyright') || t.includes('무단 전재') || t.includes('재배포 금지') || t.includes('재배포금지');
        
        const isExactBoilerplate = boilerplates.includes(t) || 
                                   t === '가' || 
                                   cleanT.includes('뉴스듣기') || 
                                   cleanT.includes('글자크기') ||
                                   cleanT.includes('가보통가크게') ||
                                   cleanT.includes('채널구독') ||
                                   cleanT.includes('이기사를추천합니다');
                                   
        if (isTitleMatch || isDateMatch || isCopyright || isExactBoilerplate) {
          el.remove();
        }
      }
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

export default app;
