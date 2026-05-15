import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function testFetch() {
  const link = 'https://www.chosun.com/opinion/editorial/2026/05/14/N6OOFZ3CHRG7VBNB6RYAEYZ2OA/';
  try {
      const res = await fetch(link, {
           headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
           signal: AbortSignal.timeout(10000)
       });
       console.log('Status:', res.status, res.url);
       const text = await res.text();
       
       const dtTextMatch = text.match(/업데이트\s+(\d{4}\.\d{2}\.\d{2}\.\s+\d{2}:\d{2})/);
       if (dtTextMatch && dtTextMatch[1]) {
           let dtStr = dtTextMatch[1].replace(/\.\s+/g, 'T').replace(/\./g, '-');
           if (dtStr.length === 16) dtStr += ':00';
           if (!dtStr.includes('+') && !dtStr.endsWith('Z')) dtStr += '+09:00';
           const pubDate = new Date(dtStr).toISOString();
           console.log('Matched Text Update:', pubDate);
           return;
       }
       const jsonDate = text.match(/"dateModified":\s*"([^"]+)"/);
       if (jsonDate && jsonDate[1]) {
           const pubDate = new Date(jsonDate[1]).toISOString();
           console.log('Matched JSON Update:', pubDate);
           return;
       }
       console.log('No matches found for Chosun');

  } catch (e) {
      console.error(e);
  }
}
testFetch();
