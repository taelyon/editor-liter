import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function testFnNews() {
  const url = 'https://www.fnnews.com/opinion/editorial';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const $ = cheerio.load(html);
  $('a').each((i, el) => {
    let title = $(el).text().trim();
    let link = $(el).attr('href');
    if (title && link) console.log(title, link);
  });
}
testFnNews();
