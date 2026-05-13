import * as cheerio from 'cheerio';

async function testKhan2() {
    const res = await fetch('https://www.khan.co.kr/opinion/editorial/articles');
    const html = await res.text();
    const $ = cheerio.load(html);
    const things: any[] = [];
    $('a').each((i, el) => {
        let title = $(el).text().trim();
        let link = $(el).attr('href');
        if (title.includes('사설') && link) {
            things.push({title, link: link, parentHtml: $(el).parent().html()});
        }
    });
    console.log(things.slice(0, 2));
}
testKhan2();
