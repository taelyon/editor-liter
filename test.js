const jsdom = require('jsdom');
const { JSDOM } = jsdom;

async function run() {
  const res = await fetch('https://www.chosun.com/opinion/editorial/2026/05/08/3QKNZGCETNEEHKVBKEOGUBWAFY/', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const text = await res.text();
  const dom = new JSDOM(text);
  const doc = dom.window.document;
  
  const selectors = ['article', 'main', 'section[class*="article"]', 'div[class*="article"]', '.article-body', '.article_body', '.story-card'];
  for (const s of selectors) {
    const el = doc.querySelector(s);
    if (el) {
      console.log(`Found ${s}: text length ${el.textContent.length}`);
    } else {
      console.log(`Not found ${s}`);
    }
  }

  // Also query elements with many paragraphs
  let maxScore = 0;
  let bestEl = null;
  doc.querySelectorAll('div, section, main, article').forEach(el => {
    let pCount = el.querySelectorAll('p').length;
    let textLen = (el.textContent || '').trim().length;
    let score = textLen + pCount * 100;
    if (score > maxScore && textLen > 200) {
      maxScore = score;
      bestEl = el;
    }
  });

  if (bestEl) {
    console.log(`Best element tag: ${bestEl.tagName}, class: ${bestEl.className}, pCount: ${bestEl.querySelectorAll('p').length}, textLen: ${bestEl.textContent.trim().length}`);
    console.log(bestEl.textContent.substring(0, 200));
  }
}
run();
