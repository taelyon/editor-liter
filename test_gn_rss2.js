import fetch from 'node-fetch';
import iconv from 'iconv-lite';

async function checkRSS(url) {
  try {
     const res = await fetch(url);
     const buf = await res.arrayBuffer();
     let text = iconv.decode(Buffer.from(buf), 'utf-8');
     const localRegex = /<title>([\s\S]*?)<\/title>/gi;
     let match;
     let i = 0;
     while ((match = localRegex.exec(text)) !== null && i++ < 5) {
       console.log(match[1]);
     }
  } catch (e) {
     console.error(e);
  }
}

async function run() {
  await checkRSS('https://news.google.com/rss/search?q=%EC%8A%A4%EC%84%A4+site:mt.co.kr&hl=ko&gl=KR&ceid=KR:ko');
  await checkRSS('https://news.google.com/rss/search?q=%EC%8A%A4%EC%84%A4+site:edaily.co.kr&hl=ko&gl=KR&ceid=KR:ko');
}
run();
