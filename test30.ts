import * as cheerio from 'cheerio';
async function test() {
    const r = await fetch('https://www.mk.co.kr/opinion/editorial/');
    const t = await r.text();
    const $ = cheerio.load(t);
    const items = [];
    $('a').each((i, el) => {
        let title = $(el).text().trim() || $(el).attr('title')?.trim() || '';
        const link = $(el).attr('href');
        if (title.includes('사설') && link) {
            title = title.replace(/&#91;/g, '[').replace(/&#93;/g, ']').replace(/<[^>]+>/g, '').trim();
            if (title === '사설') return;
            items.push({title, link});
        }
    });
    console.log(items.slice(0,5));
}
test();
