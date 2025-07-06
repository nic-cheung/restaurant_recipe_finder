const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './backend/.env' });

async function testGemini() {
  try {
    console.log('Testing Gemini API connection...');
    console.log('API Key found:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const result = await model.generateContent('Name 3 famous Italian chefs. Return only their names, one per line.');
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini API is working!');
    console.log('Response:', text);
    
  } catch (error) {
    console.error('❌ Gemini API Error:', error.message);
  }
}

testGemini(); 