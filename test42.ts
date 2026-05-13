function testLogic3() {
    const id = "A2026051216260005362";
    const dateMatch = id.match(/^A(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
    let pubDate;
    if (dateMatch) {
       pubDate = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T${dateMatch[4]}:${dateMatch[5]}:${dateMatch[6]}+09:00`).toISOString();
    }
    console.log("Hankook Ilbo:", pubDate);
}
testLogic3();
