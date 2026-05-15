import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

async function checkHK() {
  const url = 'https://www.hankyung.com/opinion';
  try {
     const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
     const text = await res.text();
     const $ = cheerio.load(text);
     
     const navs = [];
     $('a').each((i, el) => {
        const href = $(el).attr('href');
        const classStr = $(el).attr('class');
        if (href && href.includes('opinion')) {
           console.log($(el).text().trim(), href, classStr || '');
        }
     });

  } catch (e) {
     console.error(e);
  }
}
checkHK();
