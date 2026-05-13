function testLogic() {
    const dongaLink = 'https://www.donga.com/news/Opinion/article/all/20260508/133889451/2';
    const khanLink1 = 'https://www.khan.co.kr/article/202605121917001';
    const khanLink2 = 'https://www.khan.co.kr/article/202605121810011';

    let pubDateD = new Date().toISOString();
    let dateMatchD = dongaLink.match(/\/(\d{4})(\d{2})(\d{2})\//);
    if (dateMatchD) pubDateD = new Date(`${dateMatchD[1]}-${dateMatchD[2]}-${dateMatchD[3]}T00:00:00+09:00`).toISOString();
    console.log("DongA:", pubDateD);

    let pubDateK = new Date().toISOString();
    let dateMatchK = khanLink1.match(/\/article\/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
    if (dateMatchK) pubDateK = new Date(`${dateMatchK[1]}-${dateMatchK[2]}-${dateMatchK[3]}T${dateMatchK[4]}:${dateMatchK[5]}:${dateMatchK[6]}+09:00`).toISOString();
    console.log("Khan 1:", pubDateK);

    let pubDateK2 = new Date().toISOString();
    let dateMatchK2 = khanLink2.match(/\/article\/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
    if (dateMatchK2) pubDateK2 = new Date(`${dateMatchK2[1]}-${dateMatchK2[2]}-${dateMatchK2[3]}T${dateMatchK2[4]}:${dateMatchK2[5]}:${dateMatchK2[6]}+09:00`).toISOString();
    console.log("Khan 2:", pubDateK2);
}
testLogic();
