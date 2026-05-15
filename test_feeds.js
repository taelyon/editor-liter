import fetch from 'node-fetch';

const urls = [
  'https://rss.mt.co.kr/mt_news_opinion.xml',
  'https://rss.mt.co.kr/mt_opinion.xml',
  'https://rss.mt.co.kr/mtnews_opinion.xml',
  'https://rss.mt.co.kr/mt_news.xml',
  'http://rss.edaily.co.kr/opinion.xml',
  'http://rss.edaily.co.kr/edaily_opinion.xml',
  'http://rss.edaily.co.kr/edaily_news.xml',
  'https://www.fnnews.com/rss/new/fn_opinion.xml',
  'https://www.fnnews.com/rss/fn_opinion.xml',
  'https://www.fnnews.com/rss/xml/fn_opinion.xml',
  'https://www.fnnews.com/rss/new/fn_08.xml',
  'http://rss.edaily.co.kr/opinion_news.xml',
  'https://rss.mt.co.kr/mtnews_05.xml'
];

async function checkUrl(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (res.ok) {
      console.log('OK:', url);
    } else {
      console.log('Fail:', url, res.status);
    }
  } catch (e) {
    console.log('Error:', url, e.message);
  }
}

for (const url of urls) {
  await checkUrl(url);
}
