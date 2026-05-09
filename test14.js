import Parser from 'rss-parser';
import iconv from 'iconv-lite';

async function test() {
  const feeds = [
    { name: '조선일보', url: 'https://www.chosun.com/arc/outboundfeeds/rss/category/opinion/editorial/?outputType=xml' },
    { name: '동아일보', url: 'https://rss.donga.com/editorial.xml' },
    { name: '경향신문', url: 'https://www.khan.co.kr/rss/rssdata/opinion.xml' },
    { name: '한국경제', url: 'https://rss.hankyung.com/feed/opinion.xml' }
  ];

  for (const f of feeds) {
    try {
      console.log(`\n=== Fetching ${f.name} ===`);
      const res = await fetch(f.url, {
         headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
         }
      });
      const buffer = await res.arrayBuffer();
      
      let text = iconv.decode(Buffer.from(buffer), 'utf-8');
      if (text.includes('euc-kr') || text.includes('EUC-KR')) {
        text = iconv.decode(Buffer.from(buffer), 'euc-kr');
      }
      console.log('Snippet:', text.substring(0, 150));
    } catch (e) {}
  }
}
test();
