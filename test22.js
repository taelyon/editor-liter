import iconv from 'iconv-lite';

async function test() {
  const feeds = [
    { publisher: '조선일보', url: 'https://www.chosun.com/arc/outboundfeeds/rss/category/opinion/?outputType=xml' },
    { publisher: '중앙일보', url: 'https://rss.joins.com/joins_homenews_list.xml' },
    { publisher: '동아일보', url: 'https://rss.donga.com/editorial.xml' }, // Might be empty
    { publisher: '경향신문', url: 'https://www.khan.co.kr/rss/rssdata/opinion.xml' },
    { publisher: '한겨레', url: 'https://www.hani.co.kr/rss/opinion/' },
    { publisher: '매일경제', url: 'https://www.mk.co.kr/rss/30200030/' },
    { publisher: '한국경제', url: 'https://rss.hankyung.com/feed/opinion.xml' },
    { publisher: '서울경제', url: 'https://www.sedaily.com/News/RSS/Opinion' }
  ];

  let allItems = [];

  for (const f of feeds) {
    try {
      const res = await fetch(f.url, {
         headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
         }
      });
      const buffer = await res.arrayBuffer();
      
      const contentType = res.headers.get('content-type') || '';
      let charsetMatch = contentType.match(/charset=([^;]+)/i);
      let charset = charsetMatch ? charsetMatch[1].toLowerCase() : 'utf-8';
      
      let text = iconv.decode(Buffer.from(buffer), charset === 'utf-8' ? 'utf-8' : charset);
      
      if (!charsetMatch) {
          if (text.includes('euc-kr') || text.includes('EUC-KR')) {
             text = iconv.decode(Buffer.from(buffer), 'euc-kr');
          }
      }
      
      const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
      let match;
      let count = 0;
      let editorials = 0;
      while ((match = itemRegex.exec(text)) !== null) {
         count++;
         const itemXml = match[1];
         
         const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || itemXml.match(/<title>([\s\S]*?)<\/title>/i);
         const linkMatch = itemXml.match(/<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>/i) || itemXml.match(/<link>([\s\S]*?)<\/link>/i);
         const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
         let descMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) || itemXml.match(/<description>([\s\S]*?)<\/description>/i);
         if (!descMatch) descMatch = itemXml.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/i) || itemXml.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i);
         
         const title = titleMatch ? titleMatch[1].trim() : '';
         const link = linkMatch ? linkMatch[1].trim() : '';
         const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toUTCString();
         let description = descMatch ? descMatch[1].trim() : '';
         description = description.replace(/<[^>]+>/g, '').trim();
         
         if (title.includes('사설') || f.publisher === '동아일보') {
             editorials++;
             allItems.push({
                 publisher: f.publisher,
                 title,
                 link,
                 pubDate,
                 contentSnippet: description
             });
         }
      }
      
      console.log(`Success ${f.publisher}! Fetched ${count}, Editorials: ${editorials}`);
    } catch (e) {
      console.error(`Failed ${f.publisher}:`, e.message);
    }
  }
  
  console.log('Total editorials:', allItems.length);
  if (allItems.length > 0) {
      console.log(allItems[0]);
  }
}
test();
