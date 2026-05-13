import * as cheerio from 'cheerio';
async function test() {
    const r = await fetch('https://www.seoul.co.kr/newsList/editOpinion/editorial/');
    const t = await r.text();
    const $ = cheerio.load(t);
    const items = [];
    $('a').each((i, el) => {
        const title = $(el).text().trim() || $(el).attr('title')?.trim() || '';
        const link = $(el).attr('href');
        if (title.includes('사설') && link) {
            items.push({title, link});
        }
    });
    console.log(items.slice(0,5));
}
test();
