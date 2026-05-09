import Parser from 'rss-parser';
import { JSDOM } from 'jsdom';

async function test() {
  const parser = new Parser();
  try {
    const feed = await parser.parseURL('https://www.mk.co.kr/rss/30200030/'); // MK editorials rss
    const items = feed.items.slice(0, 1);
    for (const item of items) {
      console.log('Fetching', item.link);
      const resHTML = await fetch(item.link);
      const html = await resHTML.text();
      const dom = new JSDOM(html);
      const articleBody = dom.window.document.querySelector('[itemprop="articleBody"]');
      console.log('Has itemprop articleBody?', !!articleBody);
      if (articleBody) {
        console.log('Length of articleBody.innerHTML:', articleBody.innerHTML.length);
        console.log('Does articleBody have submenu in it?', articleBody.innerHTML.includes('submenu="economy"'));
      }
      
      const res = await fetch(`http://localhost:3000/api/article?url=${encodeURIComponent(item.link)}`);
      const data = await res.json();
      console.log('Title:', data.title);
      console.log('Content?', !!data.content);
      if (!data.content && data.error) {
        console.log('Error:', data.error, data.details);
      }
      if (data.content) {
        const text = data.content;
        console.log(text.substring(text.length - 1500));
      }
      console.log('---');
    }
  } catch (e) {
    console.error(e);
  }
}
test();
