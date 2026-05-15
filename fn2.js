import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function checkFn() {
  const res = await fetch('https://www.fnnews.com/opinion/editorial', { headers: { 'User-Agent': 'Mozilla/5.0' }});
  const text = await res.text();
  const $ = cheerio.load(text);
  const results = [];
  $('a').each((i, el) => {
     let title = $(el).text().trim();
     let link = $(el).attr('href');
     if (title.length > 5) {
        if (!results.includes(title + ' ' + link)) {
           results.push(title + ' ' + link);
        }
     }
  });
  console.log('FnNews:', results.slice(0, 10));
}
checkFn();
