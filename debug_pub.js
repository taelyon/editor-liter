import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';

async function printHeadlines(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return;
    const html = await res.text();
    const $ = cheerio.load(html);
    const ls = [];
    $('a').each((i, el) => {
      let title = $(el).text().trim();
      let link = $(el).attr('href');
      if (title.length > 10 && !ls.includes(title)) {
         ls.push(title);
         console.log(title, link);
      }
    });
  } catch(e) {}
}

async function run() {
  console.log('--- Edaily ---');
  await printHeadlines('https://www.edaily.co.kr/opinion/editorial');
  console.log('--- FnNews ---');
  await printHeadlines('https://www.fnnews.com/opinion/editorial');
}
run();
