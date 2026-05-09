import Parser from 'rss-parser';

async function test() {
  const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }
  });

  try {
    const res = await parser.parseURL('https://www.bing.com/news/search?q=%22%EC%82%AC%EC%84%A4%22&cc=kr&format=rss');
    for(let i=0; i<3; i++) {
        console.log("Title: ", res.items[i]?.title);
        console.log("Desc: ", res.items[i]?.contentSnippet);
        console.log("---");
    }
  } catch (e) {
    console.error('Bing failed:', e);
  }
}
test();
