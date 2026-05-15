import fetch from 'node-fetch';

async function logChosun() {
     const res = await fetch('http://localhost:3000/api/editorials');
     const data = await res.json();
     data.filter(d => ['조선일보'].includes(d.publisher)).slice(0, 5).forEach(d => {
        console.log(`[${d.publisher}] ${d.title} => ${d.pubDate} => ${d.link}`);
     });
}
logChosun();
