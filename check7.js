import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function verifyTime2() {
  const link = 'https://www.hankyung.com/article/2026051472811';
  const res = await fetch(link, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(10000)
  });
  const text = await res.text();
  const $ = cheerio.load(text);
  
  $('.txt-date, .txt-date2').parent().each((i, el) => {
      console.log($(el).html());
  });
  
  // also check other elements
  $('[class*="date"]').each((i, el) => {
     console.log('Class:', $(el).attr('class'), 'Text:', $(el).text().trim());
  });
}
verifyTime2();
