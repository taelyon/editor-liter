import * as cheerio from 'cheerio';

async function testKhan() {
    const res = await fetch('https://www.khan.co.kr/opinion/editorial/articles');
    const html = await res.text();
    const $ = cheerio.load(html);
    let count = 0;
    $('.item').each((i, el) => {
        if (count >= 2) return;
        console.log($(el).find('.appct').text().trim()); 
        console.log($(el).html());
        count++;
    });
}
testKhan();
