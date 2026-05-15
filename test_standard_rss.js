import fetch from 'node-fetch';
import iconv from 'iconv-lite';

async function check(url) {
  try {
     const res = await fetch(url);
     const buf = await res.arrayBuffer();
     let text = iconv.decode(Buffer.from(buf), 'utf-8');
     if (text.includes('euc-kr') || text.includes('EUC-KR')) {
        text = iconv.decode(Buffer.from(buf), 'euc-kr');
     }
     const regex = /<title><!\[CDATA\[(.*?)\]\]><\/title>/gi;
     let match;
     while ((match = regex.exec(text)) !== null) {
       if (match[1].includes('사설')) console.log('Found:', match[1], url);
     }
     const regex2 = /<title>(.*?)<\/title>/gi;
     while ((match = regex2.exec(text)) !== null) {
       if (match[1].includes('사설')) console.log('Found2:', match[1], url);
     }
  } catch(e) {}
}

async function run() {
  await check('https://rss.mt.co.kr/mt_news.xml');
  await check('http://rss.edaily.co.kr/edaily_news.xml');
  await check('https://www.fnnews.com/rss/new/fn_realnews_all.xml');
}
run();
