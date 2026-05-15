import fetch from 'node-fetch';
async function checkHankyung() {
     const res = await fetch('http://localhost:3000/api/editorials');
     const data = await res.json();
     data.filter(d => ['한국경제'].includes(d.publisher)).slice(0, 5).forEach(d => {
        console.log(`[${d.publisher}] ${d.title} => ${d.pubDate}`);
     });
}
checkHankyung();
