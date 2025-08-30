require('dotenv').config();
const axios = require('axios');

async function testGeminiAPI() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';
  
  try {
    console.log('Testing Gemini API with direct REST call...');
    console.log('API Key (first 10 chars):', apiKey.substring(0, 10) + '...');
    
    const response = await axios.post(
      `${url}?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: "What is 2+2? Respond with just the number."
              }
            ]
          }
        ]
      }
    );
    
    console.log('Test successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('Test failed!');
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.response?.data || error.message);
  }
}

// Run the test
testGeminiAPI();
