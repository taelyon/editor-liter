import Parser from 'rss-parser';
import iconv from 'iconv-lite';

async function test() {
  const parser = new Parser({
    customFields: {
      item: ['description', 'pubDate', 'title', 'link']
    }
  });

  const feeds = [
    { name: '조선일보', url: 'https://www.chosun.com/arc/outboundfeeds/rss/category/opinion/editorial/?outputType=xml' },
    { name: '동아일보', url: 'https://rss.donga.com/editorial.xml' },
    { name: '경향신문', url: 'https://www.khan.co.kr/rss/rssdata/opinion.xml' },
    { name: '한겨레', url: 'https://www.hani.co.kr/rss/opinion/' },
    { name: '매일경제', url: 'https://www.mk.co.kr/rss/30200030/' },
    { name: '한국경제', url: 'https://rss.hankyung.com/feed/opinion.xml' }
  ];

  for (const f of feeds) {
    try {
      console.log(`Fetching ${f.name}...`);
      const res = await fetch(f.url, {
         headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/rss+xml, application/rdf+xml;q=0.8, application/atom+xml;q=0.6, application/xml;q=0.4, text/xml;q=0.4'
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
      
      const parsed = await parser.parseString(text);
      console.log(`Success ${f.name}! Items: ${parsed.items.length}. First title: ${parsed.items[0]?.title}`);
    } catch (e) {
      console.error(`Failed ${f.name}:`, e.message);
    }
  }
}
test();
