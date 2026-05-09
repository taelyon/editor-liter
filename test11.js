import Parser from 'rss-parser';

async function test() {
  const parser = new Parser({
    customFields: {
      item: ['description', 'pubDate', 'title', 'link']
    }
  });

  const feeds = [
    { name: '경향신문', url: 'https://www.khan.co.kr/rss/rssdata/opinion.xml' },
    { name: '한겨레', url: 'https://www.hani.co.kr/rss/opinion/' },
    { name: '매일경제', url: 'https://www.mk.co.kr/rss/30200030/' },
    { name: '한국경제', url: 'https://rss.hankyung.com/feed/opinion.xml' }
  ];

  for (const f of feeds) {
    try {
      console.log(`Fetching ${f.name}...`);
      const res = await parser.parseURL(f.url);
      console.log(`Success ${f.name}! Items: ${res.items.length}. First title: ${res.items[0]?.title}`);
    } catch (e) {
      console.error(`Failed ${f.name}:`, e.message);
    }
  }
}
test();
