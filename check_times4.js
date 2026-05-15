import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';

async function checkRealUrls() {
  const rssUrls = [
     { publisher: '조선일보', url: 'https://www.chosun.com/arc/outboundfeeds/rss/category/opinion/editorial/?outputType=xml' },
     { publisher: '중앙일보', url: 'https://www.joongang.co.kr/rss/editorial.xml' }
  ];
  
  for (const feed of rssUrls) {
      console.log('Fetching', feed.publisher);
      const res = await fetch(feed.url);
      const buffer = await res.arrayBuffer();
      let text = iconv.decode(Buffer.from(buffer), 'utf-8');
      
      const localRegex = /<link><!\[CDATA\[([^\]]+)\]\]><\/link>/gi;
      let match = localRegex.exec(text);
      if (!match) {
         const localRegex2 = /<link>([^<]+)<\/link>/gi;
         match = localRegex2.exec(text); // skip first root element link
         match = localRegex2.exec(text); // first item link
      }
      
      if (match && match[1]) {
          const url = match[1].trim();
          console.log('Got URL:', url);
          const res2 = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }});
          const html = await res2.text();
          
          const modMatch = html.match(/article:modified_time["']?\s*content=["']([^"']+)["']/i);
          const pubMatch = html.match(/article:published_time["']?\s*content=["']([^"']+)["']/i);
          const jsonDate = html.match(/"dateModified":\s*"([^"]+)"/);
          
          console.log('  modMatch:', modMatch ? modMatch[1] : null);
          console.log('  pubMatch:', pubMatch ? pubMatch[1] : null);
          console.log('  jsonDate:', jsonDate ? jsonDate[1] : null);
          
          if (feed.publisher === '조선일보') {
             const dtTextMatch = html.match(/업데이트\s+(\d{4}\.\d{2}\.\d{2}\.\s+\d{2}:\d{2})/);
             console.log('  조선 업데이트텍스트:', dtTextMatch ? dtTextMatch[1] : null);
             const inputMatch = html.match(/입력\s+(\d{4}\.\d{2}\.\d{2}\.\s+\d{2}:\d{2})/);
             console.log('  조선 입력텍스트:', inputMatch ? inputMatch[1] : null);
          }
          if (feed.publisher === '중앙일보') {
             const textModify = html.match(/업데이트\s+(\d{4}\.\d{2}\.\d{2}\s\d{2}:\d{2})/);
             console.log('  중앙 업데이트텍스트:', textModify ? textModify[1] : null);
             const $ = cheerio.load(html);
             console.log('  중앙 time:', $('.time').text().replace(/\s+/g,' '));
             console.log('  중앙 date:', $('.date').text().replace(/\s+/g,' '));
          }
      }
  }
}
checkRealUrls();
