
import { GoogleGenAI } from '@google/genai';
require('dotenv').config();

async function test() {
  console.log('Testing with key length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: '안녕'
    });
    console.log('Response:', response.text?.slice(0, 50));
  } catch(e) {
    console.error('Error:', e.message);
  }
}
test();
