import Parser from 'rss-parser';
import iconv from 'iconv-lite';

const parser = new Parser({
  customFields: {
    item: ['description', 'pubDate', 'title', 'link']
  }
});

async function test() {
  const feeds = [
    { publisher: '조선일보', url: 'https://www.chosun.com/arc/outboundfeeds/rss/category/opinion/?outputType=xml' },
    // { publisher: '동아일보', url: 'https://rss.donga.com/editorial.xml' }, // Empty
    { publisher: '중앙일보', url: 'https://rss.joins.com/joins_homenews_list.xml' },
    { publisher: '경향신문', url: 'https://www.khan.co.kr/rss/rssdata/opinion.xml' },
    { publisher: '한겨레', url: 'https://www.hani.co.kr/rss/opinion/' },
    { publisher: '매일경제', url: 'https://www.mk.co.kr/rss/30200030/' },
    { publisher: '한국경제', url: 'https://rss.hankyung.com/feed/opinion.xml' },
    { publisher: '서울경제', url: 'https://www.sedaily.com/News/RSS/Opinion' },
    { publisher: 'SBS', url: 'https://news.sbs.co.kr/news/SectionRssFeed.do?sectionId=14' }
  ];

  let allItems = [];

  for (const f of feeds) {
    try {
      const res = await fetch(f.url, {
         headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
         }
      });
      const buffer = await res.arrayBuffer();
      
      const contentType = res.headers.get('content-type') || '';
      let charsetMatch = contentType.match(/charset=([^;]+)/i);
      let charset = charsetMatch ? charsetMatch[1].toLowerCase() : 'utf-8';
      
      let text = iconv.decode(Buffer.from(buffer), charset === 'utf-8' ? 'utf-8' : charset);
      
      if (!charsetMatch) {
          if (text.includes('euc-kr') || text.includes('EUC-KR')) {
             text = iconv.decode(Buffer.from(buffer), 'euc-kr');
          }
      }
      
      // Fix for khan, hankook trailing attributes
      if (text.includes('</image>')) {
          text = text.replace(/<image[^>]*>.*?<\/image>/is, ''); // remove image tag to prevent parsing errors
      }
      
      text = text.replace(/&(?!(?:apos|quot|[a-zA-Z0-9]+|#[0-9]+|#x[0-9a-fA-F]+);)/g, '&amp;'); // Quick fix for unescaped ampersands
      
      const parsed = await parser.parseString(text);
      
      const editorialItems = parsed.items.filter(item => {
        return item.title?.includes('사설');
      }).map(item => {
        let title = item.title || '';
        let snippet = item.contentSnippet || item.content || item.description || '';
        snippet = snippet.replace(/<[^>]+>/g, '').trim();
        return {
          publisher: f.publisher,
          title,
          link: item.link
        }
      });
      
      console.log(`Success ${f.publisher}! Fetched ${parsed.items.length}, Editorials: ${editorialItems.length}`);
      allItems.push(...editorialItems);
    } catch (e) {
      console.error(`Failed ${f.publisher}:`, e.message);
    }
  }
  
  console.log('Total editorials:', allItems.length);
}
test();
