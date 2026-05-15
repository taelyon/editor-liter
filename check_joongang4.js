import fetch from 'node-fetch';

async function checkJoongLatest() {
  const rs = await fetch('https://www.joongang.co.kr/article/25428523');
  const d = await rs.text();
  const updateP = d.match(/<p class=\"update\">.*?<\/p>/gi);
  console.log('Update P tags:', updateP);
  const jsonDate = d.match(/"dateModified":\s*"([^"]+)"/);
  console.log('JSON DateModified:', jsonDate ? jsonDate[1] : null);
}
checkJoongLatest();
