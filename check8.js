import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function checkFix() {
  const link = 'https://www.hankyung.com/article/2026051472811';
  const res = await fetch(link, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(10000)
  });
  const text = await res.text();
  const $ = cheerio.load(text);
  
  let resultDate = null;

  // Try to find "수정" text in Hankyung
  if (link.includes('hankyung.com')) {
     const dtHtml = $('.datetime').html() || '';
     const match = dtHtml.match(/수정.*?<span class="txt-date">([^<]+)<\/span>/);
     if (match && match[1]) {
        console.log('Found modified time in Hankyung html:', match[1]);
        resultDate = match[1];
     }
  }

  if (resultDate) {
      let dtStr = resultDate.replace(/\./g, '-');
      if (dtStr.length === 16) dtStr += ':00'; // Add seconds
      if (!dtStr.includes('+') && !dtStr.endsWith('Z')) dtStr += '+09:00';
      console.log('Result ISO:', new Date(dtStr).toISOString());
  }
}
checkFix();
