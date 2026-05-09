import Parser from 'rss-parser';

async function test() {
  const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }
  });

  try {
    const res = await parser.parseURL('https://www.bing.com/news/search?q=%EC%82%AC%EC%84%A4&format=rss');
    console.log(`Success Bing! Items: ${res.items.length}`);
    for(let i=0; i<3; i++) console.log(res.items[i]?.title);
  } catch (e) {
    console.error('Bing failed:', e);
  }
}
test();
