import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function verifyTime() {
  const link = 'https://www.hankyung.com/article/2026051472811';
  const res = await fetch(link, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(10000)
  });
  const text = await res.text();
  const $ = cheerio.load(text);
  
  const modMatch = text.match(/article:modified_time["']?\s*content=["']([^"']+)["']/i);
  const pubMatch = text.match(/article:published_time["']?\s*content=["']([^"']+)["']/i);
  
  console.log('modMatch:', modMatch ? modMatch[1] : null);
  console.log('pubMatch:', pubMatch ? pubMatch[1] : null);
  
  const dateInfo = $('.txt-date').text().trim();
  const dateInfo2 = $('.date-info').text().trim();
  
  console.log('display time string (txt-date):', dateInfo);
  console.log('display time string (date-info):', dateInfo2);
}
verifyTime();
