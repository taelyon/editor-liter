import fs from 'fs';

let text = fs.readFileSync('api/index.ts', 'utf8');

// Step 1: Make a background fetch function for editorials
const fetchEdStart = `let cachedEditorials: any[] = [];
let lastEditorialsFetchTime: number = 0;
let isFetchingEditorials = false;

async function fetchEditorialsBackground() {
  if (isFetchingEditorials) return;
  isFetchingEditorials = true;
  try {`;

const origAppGetEdStart = `app.get(['/api/editorials', '/editorials'], async (req, res) => {
  try {`;

const origAppGetClassicsStart = `let cachedClassics: any = null;
let lastClassicsDate: string = '';

app.get(['/api/classics', '/classics'], async (req, res) => {
  try {
    // Generate new quotes once a day
    const today = new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
    if (cachedClassics && lastClassicsDate === today) {
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate');
      return res.json(cachedClassics);
    }
    
    if (process.env.GEMINI_API_KEY) {`;

const newAppGetEd = `app.get(['/api/editorials', '/editorials'], (req, res) => {
  const now = Date.now();
  if (!cachedEditorials || cachedEditorials.length === 0) {
      if (!isFetchingEditorials) fetchEditorialsBackground().catch(console.error);
      res.setHeader('Cache-Control', 'no-cache');
      return res.json([]);
  }
  
  if (now - lastEditorialsFetchTime > 15 * 60 * 1000) {
      if (!isFetchingEditorials) fetchEditorialsBackground().catch(console.error);
  }
  
  res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=300');
  res.json(cachedEditorials);
});`;

// Wait, I need to properly extract the body of app.get('/api/editorials').
// The easiest way is to use split/replace.

text = text.replace(origAppGetEdStart, fetchEdStart);
text = text.replace(
`    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=86400');
    res.json(allItems);
  } catch (error: any) {
    console.error('RSS Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch editorials', details: error.message });
  }
});`,
`    cachedEditorials = allItems;
    lastEditorialsFetchTime = Date.now();
  } catch (error: any) {
    console.error('RSS Fetch Error:', error);
  } finally {
    isFetchingEditorials = false;
  }
}

${newAppGetEd}`
);

// Optimize Classic
const newClassicsRoot = `let cachedClassics: any = null;
let lastClassicsDate: string = '';
let isFetchingClassics = false;

async function fetchClassicsBackground() {
  if (isFetchingClassics) return;
  isFetchingClassics = true;
  try {
    const today = new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
    if (cachedClassics && lastClassicsDate === today) return;
    
    if (process.env.GEMINI_API_KEY) {`;

text = text.replace(origAppGetClassicsStart, newClassicsRoot);

text = text.replace(
`              cachedClassics = dataWithIds;
              lastClassicsDate = today;
              res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate');
              return res.json(dataWithIds);
          }
      }
    }
    
    // Fallback if no API Key or Gemini fails
    throw new Error('Gemini API Error or No API Key');
  } catch (error: any) {
    const isApiKeyError = error.message?.includes('API key') || error.message?.includes('API_KEY_INVALID') || error.message?.includes('Gemini API Error or No API Key');
    if (isApiKeyError) {
      console.log('Classics Fetch: Fallback to static data (Gemini API Key missing or invalid).');
    } else {
      console.error('Classics Fetch Error:', error.message);
    }
    if (cachedClassics) {
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate');
      return res.json(cachedClassics);
    }
    // Static fallback
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate');
    res.json(fallbackClassicsData);
  }
});`,
`              cachedClassics = dataWithIds;
              lastClassicsDate = today;
          }
      }
    } else {
      throw new Error('No API Key');
    }
  } catch (error: any) {
    console.error('Classics Fetch Error:', error.message);
  } finally {
    isFetchingClassics = false;
  }
}

app.get(['/api/classics', '/classics'], (req, res) => {
  const today = new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
  if (!cachedClassics || lastClassicsDate !== today) {
    fetchClassicsBackground().catch(console.error);
  }
  
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate');
  res.json(cachedClassics || fallbackClassicsData);
});
`
);

// Also add a startup hook at the end of the file.
text = text.replace("export default app;", `
// Pre-fetch items on application start to avoid slow initial requests
fetchEditorialsBackground().catch(console.error);
fetchClassicsBackground().catch(console.error);

export default app;
`);

fs.writeFileSync('api/index.ts', text, 'utf8');
console.log('Done refactoring caching logic');
