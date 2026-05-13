import * as cheerio from 'cheerio';

async function testDonga4() {
    const res = await fetch('https://www.donga.com/news/Series/70040100000001');
    const html = await res.text();
    const $ = cheerio.load(html);
    let things: any[] = [];
    $('a').each((i, el) => {
        let title = $(el).text().trim();
        let link = $(el).attr('href');
        if (title.includes('사설') && link && title !== '사설') {
            const parentText = $(el).parent().parent().text();
            things.push({title, link, parentText: parentText.substring(0, 150).replace(/\s+/g, ' ')});
        }
    });
    console.log(things.slice(0, 5));
}
testDonga4();
