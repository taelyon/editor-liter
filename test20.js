async function test() {
  const feeds = [
    { name: 'KBS', url: 'https://news.kbs.co.kr/rss/xml/news_1002.xml' }, // Opinion?
    { name: 'SBS', url: 'https://news.sbs.co.kr/news/SectionRssFeed.do?sectionId=14' }, // Opinion
    { name: 'Joongang', url: 'https://rss.joins.com/joins_homenews_list.xml' },
    { name: 'Chosun RSS', url: 'https://www.chosun.com/arc/outboundfeeds/rss/category/opinion/?outputType=xml' },
  ];

  for (const f of feeds) {
    try {
      const res = await fetch(f.url, {
         headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
         }
      });
      const text = await res.text();
      console.log(f.name, res.status, text.length > 100);
    } catch (e) {}
  }
}
test();
