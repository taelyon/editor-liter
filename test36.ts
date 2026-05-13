import * as cheerio from 'cheerio';

async function testKhan3() {
    const res = await fetch('https://www.khan.co.kr/opinion/editorial/articles');
    const html = await res.text();
    const $ = cheerio.load(html);
    const things: any[] = [];
    $('.ph-artc').each((i, el) => {
        let title = $(el).find('a').first().text().trim();
        let link = $(el).find('a').first().attr('href');
        let date = $(el).find('.byline .date').first().text().trim();
        if(!date) date = $(el).find('.byline').first().text().trim();
        things.push({title, link, date: date || $(el).text().substring(0, 50)});
    });
    console.log(things.slice(0, 3));
}
testKhan3();
