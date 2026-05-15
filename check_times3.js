import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function checkDate(publisher, url) {
  try {
     const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
     const text = await res.text();
     const $ = cheerio.load(text);
     
     console.log(publisher, url);
     const modMatch = text.match(/article:modified_time["']?\s*content=["']([^"']+)["']/i);
     const pubMatch = text.match(/article:published_time["']?\s*content=["']([^"']+)["']/i);
     
     console.log('  modMatch:', modMatch ? modMatch[1] : null);
     console.log('  pubMatch:', pubMatch ? pubMatch[1] : null);
     
     const match2 = text.match(/"dateModified":\s*"([^"]+)"/);
     console.log('  Date modified Match 2 (json-ld):', match2 ? match2[1] : null);
     
     const dtHtml1 = $('div.date, div.time, span.date, span.time').text();
     const updateHtml = text.match(/수정(?:일)?\s*[:\s]*(\d{4}[-.\/]\d{2}[-.\/]\d{2}[\s\d:]*)/);
     
     console.log('  Text update date:', updateHtml ? updateHtml[1] : 'not found');
     
  } catch(e) {
     console.error(e);
  }
}
async function run() {
    await checkDate('조선일보', 'https://www.chosun.com/opinion/editorial/2026/05/14/N6OOFZ3CHRG7VBNB6RYAEYZ2OA/');
    await checkDate('중앙일보', 'https://www.joongang.co.kr/article/25249561');
}
run();
