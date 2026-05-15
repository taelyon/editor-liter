import fetch from 'node-fetch';

async function checkJoong() {
  const rs = await fetch('https://www.joongang.co.kr/article/25249561');
  const d = await rs.text();
  const updateP = d.match(/<[^>]+update[^>]*>.*?<\/.*?>/gi);
  console.log('Update P tags:', updateP);
  const jsonDate = d.match(/"dateModified":\s*"([^"]+)"/);
  console.log('JSON DateModified:', jsonDate ? jsonDate[1] : null);
}
checkJoong();
