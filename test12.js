import Parser from 'rss-parser';
async function test() {
  const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
      const res = await parser.parseURL(f.url);
      console.log(`Success ${f.name}! Items: ${res.items.length}`);
    } catch(e) {
      console.log(`Failed ${f.name}:`, e.message);
    }
  }
}
test();
