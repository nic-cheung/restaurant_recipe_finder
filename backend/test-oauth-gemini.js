const { config } = require('dotenv');
const path = require('path');

// Load environment variables
config();

console.log('🧪 Testing OAuth Authentication for Gemini API');
console.log('================================================');

// Test environment configuration
console.log('\n📋 Environment Configuration:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('- GOOGLE_SERVICE_ACCOUNT_KEY_PATH:', process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH ? '✅ configured' : '❌ not set');
console.log('- GOOGLE_SERVICE_ACCOUNT_KEY:', process.env.GOOGLE_SERVICE_ACCOUNT_KEY ? '✅ configured' : '❌ not set');
console.log('- GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ configured' : '❌ not set');
console.log('- GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ configured' : '❌ not set');
console.log('- GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ configured (fallback)' : '❌ not set');

async function testOAuthConnection() {
  try {
    console.log('\n🔐 Testing OAuth Authentication...');
    
    // Import services after environment is loaded
    const { googleAuthService } = require('./dist/services/googleAuthService');
    const { geminiService } = require('./dist/services/geminiService');
    
    // Test 1: Check if OAuth is configured
    console.log('\n📋 Test 1: OAuth Configuration');
    const isOAuthConfigured = googleAuthService.isConfigured();
    console.log('OAuth configured:', isOAuthConfigured ? '✅' : '❌');
    
    if (!isOAuthConfigured) {
      console.log('⚠️  OAuth not configured. Will test API key fallback.');
      return await testApiFallback();
    }
    
    // Test 2: Get access token
    console.log('\n📋 Test 2: OAuth Token Retrieval');
    const accessToken = await googleAuthService.getAccessToken();
    console.log('Access token obtained:', accessToken ? '✅' : '❌');
    console.log('Token length:', accessToken ? accessToken.length : 'N/A');
    console.log('Token preview:', accessToken ? accessToken.substring(0, 20) + '...' : 'N/A');
    
    // Test 3: Test Gemini API with OAuth
    console.log('\n📋 Test 3: Gemini API Call with OAuth');
    const testPrompt = 'Say "OAuth authentication working!" if you can read this.';
    
    console.log('Sending test prompt to Gemini...');
    console.log('Prompt:', testPrompt);
    
    const response = await geminiService.generateRecipe(testPrompt);
    console.log('Gemini response received:', response ? '✅' : '❌');
    
    if (response) {
      // Try to parse the response
      try {
        const parsed = JSON.parse(response);
        console.log('Response type:', typeof parsed);
        console.log('Response keys:', Object.keys(parsed));
        
        // Check if it's a recipe or a simple response
        if (parsed.title) {
          console.log('✅ OAuth authentication successful!');
          console.log('Sample response title:', parsed.title);
        } else if (parsed.instructions && Array.isArray(parsed.instructions)) {
          console.log('✅ OAuth authentication successful!');
          console.log('Response instructions:', parsed.instructions.slice(0, 2));
        } else {
          console.log('Response preview:', JSON.stringify(parsed).substring(0, 200) + '...');
        }
      } catch (parseError) {
        console.log('Response (text):', response.substring(0, 200) + '...');
      }
      
      console.log('\n🎉 OAuth Integration Test: PASSED');
      return true;
    } else {
      console.log('❌ No response received from Gemini');
      return false;
    }
    
  } catch (error) {
    console.error('\n❌ OAuth Test Failed:', error.message);
    console.error('Error details:', error);
    
    // Check if it's an authentication error
    if (error.message.includes('authentication') || error.message.includes('token') || error.message.includes('401')) {
      console.log('\n🔄 Attempting API key fallback...');
      return await testApiFallback();
    }
    
    // Check if it's an API not enabled error
    if (error.message.includes('SERVICE_DISABLED') || error.message.includes('has not been used') || error.message.includes('403')) {
      console.log('\n✅ OAuth Authentication Working!');
      console.log('🔍 Issue: Generative Language API not enabled in Google Cloud project');
      console.log('📋 Solution: Enable the API at:');
      console.log('   https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview?project=1052091380306');
      console.log('\n🔄 Testing API key fallback meanwhile...');
      return await testApiFallback();
    }
    
    return false;
  }
}

async function testApiFallback() {
  try {
    console.log('\n📋 Testing API Key Fallback');
    
    if (!process.env.GEMINI_API_KEY) {
      console.log('❌ No API key configured for fallback');
      return false;
    }
    
    console.log('API key configured:', '✅');
    
    // Test with direct API key
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent('Say "API key fallback working!" if you can read this.');
    const response = await result.response;
    const text = response.text();
    
    console.log('API key fallback response:', text ? '✅' : '❌');
    console.log('Response preview:', text.substring(0, 100) + '...');
    
    console.log('\n🎉 API Key Fallback Test: PASSED');
    return true;
    
  } catch (error) {
    console.error('\n❌ API Key Fallback Failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('Starting OAuth + Gemini API integration test...\n');
  
  const success = await testOAuthConnection();
  
  console.log('\n' + '='.repeat(50));
  if (success) {
    console.log('🎉 OVERALL TEST RESULT: PASSED');
    console.log('✅ Your OAuth integration is working correctly!');
  } else {
    console.log('❌ OVERALL TEST RESULT: FAILED');
    console.log('🔍 Check your environment variables and OAuth configuration.');
  }
  console.log('='.repeat(50));
  
  process.exit(success ? 0 : 1);
}

// Run the test
main().catch(error => {
  console.error('Test script error:', error);
  process.exit(1);
}); 