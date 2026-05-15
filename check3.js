import fs from 'fs';
import { GoogleDecoder } from 'google-news-url-decoder';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import iconv from 'iconv-lite';
import * as cheerio from 'cheerio';

function cleanUrl(url) {
  try {
    const parsed = new URL(url);
    const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'rss', '_s', 'sn', 'service', 'kakao_from'];
    paramsToRemove.forEach(p => parsed.searchParams.delete(p));
    if (parsed.hostname === 'news.google.com' && parsed.searchParams.has('oc')) {
      parsed.searchParams.delete('oc');
    }
    return parsed.toString();
  } catch (e) {
    return url;
  }
}

function isValidEditorialTitle(title) {
  if (!title || !title.includes('사설')) return false;
  if (title.includes('[사설]') || title.includes('사설]') || title.includes('[사설') || title.startsWith('사설 ')) return true;
  const exclusions = [
    '사설업체', '사설 업체', '사설구급차', '사설 구급차', '사설도박', '사설 도박', 
    '사설학원', '사설 학원', '사설망', '사설탐정', '사설토토', '사설서버', '사설수리'
  ];
  for (const ex of exclusions) {
      if (title.includes(ex)) return false;
  }
  return true;
}

// simulate directFeeds mapping
async function checkHankyung() {
    const seenLinks = new Set();
    const seenTitles = new Set();
    const centralMedia = ['한국경제'];
    const f = { publisher: '한국경제', url: 'https://www.hankyung.com/feed/opinion' };
    
      const items = [];
      try {
        const response = await fetch(f.url, {
           headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
           signal: AbortSignal.timeout(25000)
        });
        const buffer = await response.arrayBuffer();
        
        let text = iconv.decode(Buffer.from(buffer), 'utf-8');
        if (text.includes('euc-kr') || text.includes('EUC-KR')) {
           text = iconv.decode(Buffer.from(buffer), 'euc-kr');
        }
        
        const localRegex = /<item>([\s\S]*?)<\/item>/gi;
        let match;
        while ((match = localRegex.exec(text)) !== null) {
           const itemXml = match[1];
           const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || itemXml.match(/<title>([\s\S]*?)<\/title>/i);
           const linkMatch = itemXml.match(/<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>/i) || itemXml.match(/<link>([\s\S]*?)<\/link>/i);
           const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
           const dcDateMatch = itemXml.match(/<dc:date>([\s\S]*?)<\/dc:date>/i);
           let descMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) || itemXml.match(/<description>([\s\S]*?)<\/description>/i);
           if (!descMatch) descMatch = itemXml.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/i) || itemXml.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i);
           
           const rawLink = linkMatch ? linkMatch[1].trim() : '';
           const link = cleanUrl(rawLink);
           let title = titleMatch ? titleMatch[1].trim() : '';
           
           if (title.endsWith(' - ' + f.publisher)) {
               title = title.substring(0, title.length - (' - ' + f.publisher).length);
           }
           
           if (!link || !title || seenLinks.has(link) || seenTitles.has(title.replace(/\s+/g, ''))) {
               continue;
           }
           
           let pubDate = pubDateMatch ? pubDateMatch[1].trim() : (dcDateMatch ? dcDateMatch[1].trim() : '');
           if (!pubDate) pubDate = new Date().toISOString();
           
           let description = descMatch ? descMatch[1].trim() : '';
           description = description
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&apos;/g, "'")
             .replace(/&amp;/g, '&')
             .replace(/&nbsp;/g, ' ');
           description = description.replace(/<[^>]+>/g, '').trim();
           
           const isEditorial = isValidEditorialTitle(title);
           
           if (isEditorial) {
               seenLinks.add(link);
               seenTitles.add(title.replace(/\s+/g, ''));
               
               items.push({
                   id: link,
                   publisher: f.publisher,
                   title,
                   link,
                   pubDate,
                   contentSnippet: description.length > 200 ? description.substring(0, 200) + '...' : description,
                   mediaType: 'central'
               });
           }
        }
      } catch (err) {
        console.error(`Error:`, err);
      }
      console.log('Resulting items:', items);
}

checkHankyung();
