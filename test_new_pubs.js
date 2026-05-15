import fetch from 'node-fetch';

async function check() {
   const res = await fetch('http://localhost:3000/api/editorials');
   const data = await res.json();
   const counts = {};
   for (const item of data) {
       counts[item.publisher] = (counts[item.publisher] || 0) + 1;
   }
   console.log('Publishers:', counts);
   
   console.log('\nSample E-daily:');
   console.log(data.filter(d => d.publisher === '이데일리').slice(0, 2).map(d => `${d.title} [${d.pubDate}]`));
   console.log('\nSample MoneyToday:');
   console.log(data.filter(d => d.publisher === '머니투데이').slice(0, 2).map(d => `${d.title} [${d.pubDate}]`));
   console.log('\nSample FnNews:');
   console.log(data.filter(d => d.publisher === '파이낸셜뉴스').slice(0, 2).map(d => `${d.title} [${d.pubDate}]`));
}
check();
