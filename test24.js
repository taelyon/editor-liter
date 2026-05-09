async function test() {
  const feeds = [
    { name: '중앙', url:'https://rss.joins.com/joins_homenews_list.xml' },
    { name: '한국', url:'https://rss.hankyung.com/feed/opinion.xml' },
    { name: '동아', url:'https://rss.donga.com/editorial.xml' }
  ];
  for (const f of feeds) {
     const res=await fetch(f.url);
     const text=await res.text();
     console.log(f.name, text.substring(0, 200));
  }
}
test();
