require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  try {
    // Initialize the API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Simple test prompt
    const prompt = "What is 2+2? Respond with just the number.";
    
    console.log('Testing Gemini API...');
    console.log('API Key (first 10 chars):', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Test successful!');
    console.log('Response:', text);
    
  } catch (error) {
    console.error('Test failed!');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testGeminiAPI();
