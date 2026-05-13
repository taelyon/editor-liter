import * as cheerio from 'cheerio';

async function testDonga() {
    const res = await fetch('https://www.donga.com/news/Series/70040100000001');
    const html = await res.text();
    const $ = cheerio.load(html);
    let count = 0;
    $('.article_list').each((i, el) => {
        if (count >= 2) return;
        console.log($(el).find('.date').text().trim());
        console.log($(el).html());
        count++;
    });
}
testDonga();
