import * as cheerio from 'cheerio';

async function fixSeoul() {
    const link = 'https://www.seoul.co.kr/news/editOpinion/editorial/2026/05/13/20260513027003';
    const res = await fetch(link, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(10000)
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const modTime = $('meta[property="article:modified_time"]').attr('content');
    const pubTime = $('meta[property="article:published_time"]').attr('content');
    
    console.log('modTime', modTime);
    console.log('pubTime', pubTime);
}
fixSeoul();
