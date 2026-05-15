import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function checkRealUrls() {
  const response = await fetch('https://www.joongang.co.kr/opinion/editorial', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    signal: AbortSignal.timeout(25000)
  });
  const html = await response.text();
  const cards = html.split('<li class="card"').slice(1);
  for (const card of cards.slice(0, 3)) {
     const linkMatch = card.match(/href=\"([^\"]+)\"/i);
     const dateMatch = card.match(/<p class=\"date\">([^<]+)<\/p>/i);
     console.log('Li element contents preview:', card.substring(0, 800));
  }
}
checkRealUrls();
