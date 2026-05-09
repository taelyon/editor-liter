import { JSDOM } from 'jsdom';

async function test() {
  const res = await fetch('https://www.hani.co.kr/arti/opinion/editorial/1257853.html');
  const text = await res.text();
  const dom = new JSDOM(text);
  const doc = dom.window.document;
  
  doc.querySelectorAll('div').forEach(el => {
      const elText = el.textContent || '';
      if(elText.trim() === '광고') {
          console.log("TAG:", el.tagName, "OUTER:", el.outerHTML.substring(0, 300));
      }
  });
}
test();
