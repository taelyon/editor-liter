const cheerio = require('cheerio');

async function test() {
  const mkRes = await fetch('https://www.mk.co.kr/opinion/editorial/');
  const mkText = await mkRes.text();
  const $ = cheerio.load(mkText);
  let links = [];
  $('a[href*=\'mk.co.kr\']').each((i, el) => {
    links.push($(el).attr('href'));
  });
  const link = links.find(l => l.includes('/article/'));
  if (link) {
    console.log('MK Link:', link);
    const res = await fetch(link, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }});
    const text = await res.text();
    console.log('MK modification time found:', text.includes('article:modified_time'));
    console.log('MK specific regex:', text.match(/<dl class="registration">.*?<dd>([^<]+)<\/dd>/s)?.[1]);
    console.log('MK another regex:', text.match(/<div class="time_area">.*?<span class="time">([^<]+)<\/span>/s)?.[0]);
  }
}
test();
