import * as cheerio from 'cheerio';
async function run() {
      try {
        const response = await fetch('https://www.munhwa.com/news/series.html?secode=11', {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(25000)
        });
        const html = await response.text();
        const $ = cheerio.load(html);
        const things = [];
        $('.list-type1 li').each((i, el) => {
           let title = $(el).find('.title').text().trim();
           if (title) things.push(title);
        });
        console.log(things.slice(0,5));
      } catch(err) {
        console.error('Failed to fetch Munhwa:', err);
      }
}
run();
