async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/editorials');
    const json = await res.json();
    console.log("Length:", json.length);
    if(json.length > 0) {
      console.log(json[0].title);
      console.log(json[0].publisher);
      console.log(json[json.length-1].title);
      console.log(json[json.length-1].publisher);
    }
  } catch (e) {
    console.error(e);
  }
}
test();
