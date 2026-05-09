async function test() {
  const res = await fetch('https://www.bing.com/news/search?q=%22%EC%82%AC%EC%84%A4%22&cc=kr&format=rss');
  const text = await res.text();
  console.log(text.substring(0, 1000));
}
test();
