import fs from 'fs';
const lines = fs.readFileSync('fn.txt', 'utf8').split('\n');
for (const line of lines) {
  if (line.match(/\d{10,}/)) console.log(line);
}
