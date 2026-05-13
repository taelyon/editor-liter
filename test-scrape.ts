import * as cheerio from 'cheerio';

async function fetchWithUA(url) {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    return res.text();
}

async function scrapeKhan() {
    const html = await fetchWithUA('https://www.khan.co.kr/opinion/editorial/articles');
    const $ = cheerio.load(html);
    const items = [];
    $('a').each((i, el) => {
        const title = $(el).text().trim();
        const link = $(el).attr('href');
        if(title && title.includes('사설')) items.push({ title, link });
    });
    console.log('Khan Titles:', items.slice(0,5));
}

async function scrapeHankyung() {
    const html = await fetchWithUA('https://www.hankyung.com/opinion/editorial');
    const $ = cheerio.load(html);
    const items = [];
    $('.news-tit a').each((i, el) => {
        const title = $(el).text().trim();
        const link = $(el).attr('href');
        if(title) items.push({ title, link });
    });
    console.log('Hankyung Titles:', items.slice(0,5));
}

async function scrapeMunhwa() {
    const html = await fetchWithUA('https://www.munhwa.com/news/section.html?sec=opinion&class=0');
    const $ = cheerio.load(html);
    const items = [];
    $('.list_title, .title').each((i, el) => {
        const a = $(el).is('a') ? $(el) : $(el).find('a');
        const title = a.text().trim();
        const link = a.attr('href');
        if(title && title.includes('사설')) items.push({ title, link });
    });
    console.log('Munhwa Titles:', items.slice(0,5));
}

async function scrapeHankookilboNext() {
    const html = await fetchWithUA('https://www.hankookilbo.com/news/opinion/editorial');
    const $ = cheerio.load(html);
    const jsonStr = $('script#__NEXT_DATA__').html();
    console.log(jsonStr?.substring(0, 50));
}

async function main() {
    await scrapeHankookilboNext().catch(console.error);
}
main();
