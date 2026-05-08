const fetch = require('node-fetch');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

async function run() {
  const res = await fetch('https://www.chosun.com/opinion/editorial/2026/05/08/3QKNZGCETNEEHKVBKEOGUBWAFY/', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const text = await res.text();
  const dom = new JSDOM(text);
  const doc = dom.window.document;
  
  const selectors = ['article', 'main', 'section[class*="article"]', 'div[class*="article"]'];
  for (const s of selectors) {
    const el = doc.querySelector(s);
    if (el) {
      console.log(`Found ${s}: text length ${el.textContent.length}`);
    } else {
      console.log(`Not found ${s}`);
    }
  }
}
run();
