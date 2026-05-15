import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function checkRealUrls() {
  const response = await fetch('https://www.joongang.co.kr/opinion/editorial', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    signal: AbortSignal.timeout(25000)
  });
  const html = await response.text();
  const $ = cheerio.load(html);
  
  $('li.card').slice(0, 3).each((i, el) => {
     console.log('HTML of card:', $(el).html());
  });
}
checkRealUrls();
