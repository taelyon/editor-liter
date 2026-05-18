import fs from 'fs';

let text = fs.readFileSync('api/index.ts', 'utf8');

text = text.replace(
\`app.get(['/api/editorials', '/editorials'], (req, res) => {
  const now = Date.now();
  if (!cachedEditorials || cachedEditorials.length === 0) {
      if (!isFetchingEditorials) fetchEditorialsBackground().catch(console.error);
      res.setHeader('Cache-Control', 'no-cache');
      return res.json([]);
  }
  
  if (now - lastEditorialsFetchTime > 15 * 60 * 1000) {
      if (!isFetchingEditorials) fetchEditorialsBackground().catch(console.error);
  }\`,
\`app.get(['/api/editorials', '/editorials'], async (req, res) => {
  const now = Date.now();
  
  // Wait if it's currently fetching the first batch!
  if (!cachedEditorials || cachedEditorials.length === 0) {
      if (!isFetchingEditorials) {
          await fetchEditorialsBackground();
      } else {
          // Poll until cachedEditorials is populated (up to a few seconds)
          let retries = 50;
          while (isFetchingEditorials && (!cachedEditorials || cachedEditorials.length === 0) && retries > 0) {
              await new Promise(r => setTimeout(r, 100)); // wait 100ms
              retries--;
          }
      }
  } else if (now - lastEditorialsFetchTime > 15 * 60 * 1000) {
      if (!isFetchingEditorials) fetchEditorialsBackground().catch(console.error);
  }\`
);

fs.writeFileSync('api/index.ts', text, 'utf8');
console.log('Fixed await');
