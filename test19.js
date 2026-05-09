async function test() {
  try {
    const res = await fetch('https://rsshub.app/naver/news/search/%EC%82%AC%EC%84%A4');
    const text = await res.text();
    console.log(text.substring(0, 500));
  } catch (e) {
    console.log(e);
  }
}
test();
