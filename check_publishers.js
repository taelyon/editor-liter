import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function checkMT() {
  const url = 'https://news.mt.co.kr/newsList.html?pDepth1=opinion&pDepth2=Oedito';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const $ = cheerio.load(html);
  $('a').each((i, el) => {
    let title = $(el).text().trim() || $(el).attr('title')?.trim() || '';
    let link = $(el).attr('href');
    if (title && title.includes('[사설]')) {
      console.log('MT:', title, link);
    }
  });
}

async function checkEdaily() {
  const url = 'https://www.edaily.co.kr/news/opinion/editorial';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const $ = cheerio.load(html);
  $('a').each((i, el) => {
    let title = $(el).text().trim() || $(el).attr('title')?.trim() || '';
    let link = $(el).attr('href');
    if (title && title.includes('[사설]')) {
      console.log('Edaily:', title, link);
    }
  });
}

async function checkFnNews() {
  const url = 'https://www.fnnews.com/opinion/editorial';
  // or fnnews.com/opinion
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const $ = cheerio.load(html);
  $('a').each((i, el) => {
    let title = $(el).text().trim() || $(el).attr('title')?.trim() || '';
    let link = $(el).attr('href');
    if (title && title.includes('[사설]')) {
      console.log('FnNews:', title, link);
    }
  });
}

async function checkFnNews2() {
  const url = 'https://www.fnnews.com/newsList/editorial';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const $ = cheerio.load(html);
  $('a').each((i, el) => {
    let title = $(el).text().trim() || $(el).attr('title')?.trim() || '';
    let link = $(el).attr('href');
    if (title && title.includes('[사설]')) {
      console.log('FnNews2:', title, link);
    }
  });
}

async function run() {
  await checkMT().catch(console.error);
  await checkEdaily().catch(console.error);
  await checkFnNews().catch(console.error);
  await checkFnNews2().catch(console.error);
}
run();
