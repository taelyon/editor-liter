import fetch from 'node-fetch';
import iconv from 'iconv-lite';

async function checkRSS(publisher, url) {
  try {
     const res = await fetch(url);
     const buf = await res.arrayBuffer();
     let text = iconv.decode(Buffer.from(buf), 'utf-8');
     const localRegex = /<title>([\s\S]*?)<\/title>/gi;
     let match;
     while ((match = localRegex.exec(text)) !== null) {
       let title = match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/i, '$1');
       if (title.includes('사설') && title.includes(publisher)) console.log(`Found [${publisher}]:`, title);
     }
  } catch (e) {
     console.error(e);
  }
}

async function run() {
  await checkRSS('머니투데이', 'https://news.google.com/rss/search?q=%EC%8A%A4%EC%84%A4+site:mt.co.kr&hl=ko&gl=KR&ceid=KR:ko');
  await checkRSS('이데일리', 'https://news.google.com/rss/search?q=%EC%8A%A4%EC%84%A4+site:edaily.co.kr&hl=ko&gl=KR&ceid=KR:ko');
  await checkRSS('파이낸셜뉴스', 'https://news.google.com/rss/search?q=%EC%8A%A4%EC%84%A4+site:fnnews.com&hl=ko&gl=KR&ceid=KR:ko');
}
run();
