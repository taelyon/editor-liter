import * as cheerio from 'cheerio';

async function testDonga3() {
    const res = await fetch('https://www.donga.com/news/Series/70040100000001');
    const html = await res.text();
    const $ = cheerio.load(html);
    const things: any[] = [];
    $('.article_list .item').each((i, el) => {
        let title = $(el).find('a .tit').first().text().trim();
        if(!title) title = $(el).find('a').first().text().trim();
        let link = $(el).find('a').first().attr('href');
        let date = $(el).find('.date').first().text().trim();
        if(!date) date = $(el).text().substring(0, 50);
        things.push({title, link, date});
    });
    console.log(things.slice(0, 3));
}
testDonga3();
