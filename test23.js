async function test() {
  const res = await fetch('https://www.khan.co.kr/rss/rssdata/opinion.xml');
  const text = await res.text();
  console.log('KHAN starts with: ', text.substring(0, 500));
}
test();
