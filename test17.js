import Parser from 'rss-parser';

async function test() {
  const parser = new Parser({
    customFields: {
      item: ['source']
    },
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }
  });

  try {
    const res = await parser.parseURL('https://www.bing.com/news/search?q=%22%EC%82%AC%EC%84%A4%22&cc=kr&format=rss');
    console.log(`Success Bing "사설"! Items: ${res.items.length}`);
    for(let i=0; i<res.items.length; i++) console.log(res.items[i]?.title, res.items[i]?.source);
  } catch (e) {
    console.error('Bing failed:', e);
  }
}
test();
