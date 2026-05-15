import fetch from 'node-fetch';

async function checkFix() {
  const link = 'https://www.hankyung.com/article/2026051472811';
  let pubDate = '';
  try {
     const res = await fetch(link, {
         headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
         signal: AbortSignal.timeout(10000)
     });
     const text = await res.text();
     const modMatch = text.match(/article:modified_time["']?\s*content=["']([^"']+)["']/i);
     const pubMatch = text.match(/article:published_time["']?\s*content=["']([^"']+)["']/i);
     
     const dateRegex = /202[0-9][-.\/][0-1][0-9][-.\/][0-3][0-9][\sT][0-2][0-9]:[0-5][0-9]/;
     
     if (modMatch && modMatch[1]) {
         pubDate = new Date(modMatch[1]).toISOString();
     } else if (pubMatch && pubMatch[1]) {
         pubDate = new Date(pubMatch[1]).toISOString();
     } else {
         const fallbackMatch = text.match(dateRegex);
         if (fallbackMatch && fallbackMatch[0]) {
             let parsedDate = fallbackMatch[0].replace(/[-.\/]/g, '-').replace(' ', 'T');
             if (parsedDate.length === 16) parsedDate += ':00'; // Add seconds
             if (!parsedDate.includes('+') && !parsedDate.endsWith('Z')) parsedDate += '+09:00';
             pubDate = new Date(parsedDate).toISOString();
         }
     }
     console.log('Final pubdate:', pubDate);
     console.log('Date object:', new Date(pubDate));
  } catch(e) {
     console.log(e);
  }
}
checkFix();
