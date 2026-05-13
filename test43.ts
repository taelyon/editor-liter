import * as cheerio from 'cheerio';
async function testHankyung() {
    const res = await fetch('https://www.hankyung.com/opinion/editorial');
    const html = await res.text();
    const $ = cheerio.load(html);
    const links: any[] = [];
    $('a').each((i, el) => {
        let title = $(el).text().trim();
        let link = $(el).attr('href');
        if (title.includes('사설') && link) {
            links.push(link);
        }
    });
    console.log(links.slice(0, 5));
}
testHankyung();
