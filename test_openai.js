const OpenAI = require('openai');
require('dotenv').config({ path: './backend/.env' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
  try {
    console.log('Testing OpenAI API connection...');
    console.log('API Key:', process.env.OPENAI_API_KEY ? 'Found' : 'Missing');
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Suggest 3 famous chefs who cook Italian cuisine. Return only their names, one per line."
        }
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    console.log('✅ OpenAI API is working!');
    console.log('Response:', response.choices[0].message.content);
    
  } catch (error) {
    console.error('❌ OpenAI API Error:', error.message);
    if (error.status) {
      console.error('Status:', error.status);
    }
  }
}

testOpenAI(); 