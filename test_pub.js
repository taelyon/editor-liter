import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function testUrl(publisher, url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) {
       console.log('X', publisher, url, res.status);
       return;
    }
    const html = await res.text();
    const $ = cheerio.load(html);
    let count = 0;
    $('a').each((i, el) => {
      let title = $(el).text().trim() || $(el).attr('title')?.trim() || '';
      if (title.includes('사설')) {
        count++;
      }
    });
    console.log('O', publisher, url, '-', count, 'matches');
  } catch(e) {
    console.log('! Error', publisher, url);
  }
}

async function run() {
  await testUrl('MT', 'https://news.mt.co.kr/newsList.html?pDepth1=opinion&pDepth2=Oedito');
  await testUrl('MT', 'https://news.mt.co.kr/opinion/editorial.html');
  await testUrl('MT', 'https://www.mt.co.kr/opinion/editorial.html');
  await testUrl('Edaily', 'https://www.edaily.co.kr/news/opinion/editorial');
  await testUrl('Edaily', 'https://www.edaily.co.kr/opinion/editorial');
  await testUrl('FnNews', 'https://www.fnnews.com/news/editorial');
  await testUrl('FnNews', 'https://www.fnnews.com/opinion/editorial');
  await testUrl('FnNews', 'https://www.fnnews.com/newsList/editorial');
}
run();
