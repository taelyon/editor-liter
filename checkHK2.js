import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

async function checkHKEditorial() {
  const url = 'https://www.hankyung.com/opinion/0001';
  try {
     const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
     const text = await res.text();
     const $ = cheerio.load(text);
     
     $('a').each((i, el) => {
        const title = $(el).text().trim();
        const href = $(el).attr('href');
        if (title.includes('사설')) {
           console.log(title, href);
        }
     });

  } catch (e) {
     console.error(e);
  }
}
checkHKEditorial();
