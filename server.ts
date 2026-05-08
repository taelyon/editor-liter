import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Parser from 'rss-parser';
import { GoogleDecoder } from 'google-news-url-decoder';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parser = new Parser({
  customFields: {
    item: ['media:content', 'description', 'source']
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});

const decoder = new GoogleDecoder();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/article', async (req, res) => {
    try {
      const { url } = req.query;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required' });
      }

      let targetUrl = url;
      if (url.includes('news.google.com')) {
        const decoded = await decoder.decode(url);
        if (decoded.status && decoded.decoded_url) {
          targetUrl = decoded.decoded_url;
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
      
      // Purify HTML isn't strictly necessary on server, but good practice. We'll do it on the client typically.
      const reader = new Readability(doc.window.document);
      const article = reader.parse();

      if (!article) {
        return res.status(404).json({ error: 'Could not parse article' });
      }

      res.json({
        title: article.title,
        content: article.content,
        textContent: article.textContent,
        byline: article.byline,
        originalUrl: targetUrl
      });
    } catch (err) {
      console.error('Article Fetch Error:', err);
      res.status(500).json({ error: 'Failed to fetch article' });
    }
  });

  app.get('/api/editorials', async (req, res) => {
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
            
            // Filter by today's date in KST
            const nowKst = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
            const pubKst = new Date(new Date(item.pubDate || '').getTime() + 9 * 60 * 60 * 1000);
            
            const isToday = nowKst.getUTCFullYear() === pubKst.getUTCFullYear() &&
                            nowKst.getUTCMonth() === pubKst.getUTCMonth() &&
                            nowKst.getUTCDate() === pubKst.getUTCDate();
            
            return notExcluded && isCentral && isToday;
          })
          .map(item => {
          let publisher = item.source || '종합 일간지';
          let title = item.title || '';
          
          if (item.source && title.endsWith(` - ${item.source}`)) {
              title = title.substring(0, title.lastIndexOf(` - ${item.source}`)).trim();
          }
          
          let snippet = item.contentSnippet || item.content || item.description || '';
          snippet = snippet.replace(/<[^>]+>/g, '').trim();
          
          // Google News RSS puts title and source in descriptions. We should clear it to avoid duplication.
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

      // Sort by publisher, then by date ascending (older first)
      allItems.sort((a, b) => {
        if (a.publisher < b.publisher) return -1;
        if (a.publisher > b.publisher) return 1;
        return new Date(a.pubDate).getTime() - new Date(b.pubDate).getTime();
      });

      res.json(allItems);
    } catch (error) {
      console.error('RSS Fetch Error:', error);
      res.status(500).json({ error: 'Failed to fetch editorials' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve static files from dist
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
