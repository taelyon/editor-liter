import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function checkEd() {
  const res = await fetch('https://www.edaily.co.kr/opinion/editorial', { headers: { 'User-Agent': 'Mozilla/5.0' }});
  const text = await res.text();
  const $ = cheerio.load(text);
  const results = [];
  $('a').each((i, el) => {
     let title = $(el).text().trim();
     let link = $(el).attr('href');
     if (link && link.includes('newsId') && title.length > 5) {
        if (!results.includes(title + ' ' + link)) {
           results.push(title + ' ' + link);
        }
     }
  });
  console.log('Edaily:', results.slice(0, 10));
}

async function checkFn() {
  const res = await fetch('https://www.fnnews.com/opinion/editorial', { headers: { 'User-Agent': 'Mozilla/5.0' }});
  const text = await res.text();
  const $ = cheerio.load(text);
  const results = [];
  $('a').each((i, el) => {
     let title = $(el).text().trim() || $(el).attr('title')?.trim() || '';
     let link = $(el).attr('href');
     if (link && link.includes('/news/202') && title.length > 5) {
        if (!results.includes(title + ' ' + link)) {
           results.push(title + ' ' + link);
        }
     }
  });
  console.log('FnNews:', results.slice(0, 10));
}

async function checkMt() {
  const res = await fetch('https://news.mt.co.kr/newsList.html?pDepth1=opinion&pDepth2=Oedito', { headers: { 'User-Agent': 'Mozilla/5.0' }});
  if (res.ok) {
     const text = await res.text();
     const $ = cheerio.load(text);
     const results = [];
     $('a').each((i, el) => {
        let title = $(el).text().trim();
        let link = $(el).attr('href');
        if (link && title.length > 5 && link.includes('view.html')) {
           if (!results.includes(title + ' ' + link)) results.push(title + ' ' + link);
        }
     });
     console.log('MT list:', results.slice(0, 10));
  } else {
     console.log('MT list failed', res.status);
  }
}

async function checkMtOpinion() {
  const res = await fetch('https://news.mt.co.kr/opinion/', { headers: { 'User-Agent': 'Mozilla/5.0' }});
  if (res.ok) {
     const text = await res.text();
     const $ = cheerio.load(text);
     const results = [];
     $('a').each((i, el) => {
        let title = $(el).text().trim();
        let link = $(el).attr('href');
        if (title.length > 5 && link && (link.includes('view') || title.includes('[사설]'))) {
           if (!results.includes(title + ' ' + link)) results.push(title + ' ' + link);
        }
     });
     console.log('MT opinion:', results.slice(0, 10));
  }
}

async function checkMtSection() {
  const res = await fetch('https://www.mt.co.kr/opinion/', { headers: { 'User-Agent': 'Mozilla/5.0' }});
  if (res.ok) {
     const text = await res.text();
     const $ = cheerio.load(text);
     const results = [];
     $('a').each((i, el) => {
        let title = $(el).text().trim() || $(el).attr('title')?.trim() || '';
        let link = $(el).attr('href');
        if (title.length > 5 && link && (link.includes('view') || title.includes('사설'))) {
           if (!results.includes(title + ' ' + link)) results.push(title + ' ' + link);
        }
     });
     console.log('MT opinion www:', results.slice(0, 10));
  }
}

async function run() {
  await checkEd();
  await checkFn();
  await checkMt();
  await checkMtOpinion();
  await checkMtSection();
}
run();
