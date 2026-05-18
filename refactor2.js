import fs from 'fs';

let text = fs.readFileSync('api/index.ts', 'utf8');

const findBlock = `// Attempt to fetch actual pubDate for specific articles that might lack precise time or are known to need meta tag extraction
    const itemsToFix = allItems.filter(item => 
        ['서울신문', '동아일보', '경향신문', '문화일보', '한국경제', '매일경제', '한겨레', '조선일보', '중앙일보', '머니투데이', '이데일리', '파이낸셜뉴스'].includes(item.publisher) || 
        item.pubDate.includes('T00:00:00')
    );`;

const replaceBlock = `
    const now = new Date();
    
    // Filter out old news (older than 3-4 days) and problematic redirects
    const excludedSources = ['daum.net', 'v.daum.net', 'nate.com', 'msn.com', 'zum.com'];
    
    allItems = allItems.filter(item => {
      const source = (item.publisher || '').toLowerCase();
      const isExcludedLink = excludedSources.some(excluded => item.link.includes(excluded));
      const pubDate = new Date(item.pubDate || '');
      const isRecent = now.getTime() - pubDate.getTime() <= 96 * 60 * 60 * 1000;
      return !isExcludedLink && isRecent && item.mediaType === 'central';
    });

    allItems.sort((a, b) => {
      if (a.publisher < b.publisher) return -1;
      if (a.publisher > b.publisher) return 1;
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });
    
    // PRE-CACHE with basic dates to be instantly available!
    cachedEditorials = structuredClone ? structuredClone(allItems) : JSON.parse(JSON.stringify(allItems));
    lastEditorialsFetchTime = Date.now();
    
    // ATTEMPT TO FETCH METADATA ASYNCHRONOUSLY WITHOUT BLOCKING INITIAL CACHING
    const itemsToFix = allItems.filter(item => 
        ['서울신문', '동아일보', '경향신문', '문화일보', '한국경제', '매일경제', '한겨레', '조선일보', '중앙일보', '머니투데이', '이데일리', '파이낸셜뉴스'].includes(item.publisher) || 
        item.pubDate.includes('T00:00:00')
    );`;

// First remove the old filtering and sorting block since we moved it above itemsToFix
const oldFilteringRegex = /const now = new Date\(\);\s*\/\/ Filter out old news[\s\S]*?cachedEditorials = allItems;\s*lastEditorialsFetchTime = Date\.now\(\);/m;

if (!text.includes(findBlock)) {
   console.log('Could not find target block!');
} else {
   text = text.replace(oldFilteringRegex, `
    // Re-sort after dates are fixed
    allItems.sort((a, b) => {
      if (a.publisher < b.publisher) return -1;
      if (a.publisher > b.publisher) return 1;
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });
    cachedEditorials = allItems;
    lastEditorialsFetchTime = Date.now();
   `);
   text = text.replace(findBlock, replaceBlock);
   fs.writeFileSync('api/index.ts', text, 'utf8');
   console.log('Update success');
}
