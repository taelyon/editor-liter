import http from 'http';

http.get('http://0.0.0.0:3000/api/editorials', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        let items = JSON.parse(data);
        console.log("Total Items:", items.length);
        let publishers = new Set(items.map(i => i.publisher));
        console.log("Publishers:", Array.from(publishers));
        let hankook = items.filter(i => i.publisher === '한국일보');
        console.log("Hankook count:", hankook.length);
    });
});
