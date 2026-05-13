import iconv from 'iconv-lite';

async function testRSS() {
    const urls = [
        'https://www.khan.co.kr/rss/rssdata/opinion.xml',
        'https://www.seoul.co.kr/news/newsInfo.php?rss=4',
        'https://rss.donga.com/opinion.xml',
        'http://www.munhwa.com/news/rss/opinion.xml',
        'https://rss.hankyung.com/new/news_opinion.xml'
    ];
    for (const url of urls) {
        console.log('Fetching', url);
        try {
            const response = await fetch(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });
            const buffer = await response.arrayBuffer();
            let text = iconv.decode(Buffer.from(buffer), 'utf-8');
            if (text.includes('euc-kr') || text.includes('EUC-KR')) {
                text = iconv.decode(Buffer.from(buffer), 'euc-kr');
            }
            const localRegex = /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/gi;
            let match;
            let count = 0;
            let editorials = 0;
            while ((match = localRegex.exec(text)) !== null) {
                count++;
                const t = match[1];
                if (t.includes('사설')) editorials++;
            }
            console.log(`- ${count} titles, ${editorials} with 사설`);
        } catch (e) {
            console.log('Error', e.message);
        }
    }
}
testRSS();
