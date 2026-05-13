function testLogic2() {
    let link = 'https://www.seoul.co.kr/news/editOpinion/editorial/2026/05/13/20260513027003';
    let pubDateS = new Date().toISOString();
    const dateMatchS = link.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
    if (dateMatchS) pubDateS = new Date(`${dateMatchS[1]}-${dateMatchS[2]}-${dateMatchS[3]}T00:00:00+09:00`).toISOString();
    console.log("Seoul:", pubDateS);

    let linkM = 'http://munhwa.com/news/view.html?no=2026051301032711000001';
    let pubDateM = new Date().toISOString();
    const dateMatchM = linkM.match(/no=(\d{4})(\d{2})(\d{2})/);
    if (dateMatchM) pubDateM = new Date(`${dateMatchM[1]}-${dateMatchM[2]}-${dateMatchM[3]}T00:00:00+09:00`).toISOString();
    console.log("Munhwa:", pubDateM);
}
testLogic2();
