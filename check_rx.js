import fetch from 'node-fetch';

async function testFetch() {
  const link = 'https://www.hankyung.com/article/2026051472811';
  try {
      const res = await fetch(link, {
           headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
       });
       const text = await res.text();
       
       const rx1 = /(업데이트|수정|입력)\s*(?:(?:일|시간)?:?\s*)?(?:<[^>]+>\s*)?\d{4}[-./]\d{2}[-./]\d{2}/;
       const rx2 = /(업데이트|수정|입력)[\s\r\n]*(?:(?:일|시간)?[:\s\r\n]*)?(?:<[^>]+>[\s\r\n]*)?(?:<[^>]+>[\s\r\n]*)?\d{4}[-./]\d{2}[-./]\d{2}/;
       
       console.log('rx1:', text.match(rx1)?.[1]);
       console.log('rx2:', text.match(rx2)?.[1]);

  } catch (e) {
      console.error(e);
  }
}
testFetch();
