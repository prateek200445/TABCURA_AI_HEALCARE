const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Gemini API with proper configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// List available models
async function listModels() {
  try {
    console.log('Available models:', await genAI.listModels());
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

// Call listModels to see available models
listModels();

// Get the model
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    maxOutputTokens: 2048,
  }
});

async function analyzeWithGemini(filePath) {
  try {
    console.log('API Key length:', process.env.GEMINI_API_KEY?.length);
    console.log('Starting analysis for file:', filePath);
    
    // Read the file content
    const fs = require('fs');
    const { createWorker } = require('tesseract.js');
    const path = require('path');
    
    // Verify file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    let documentText = '';
    const fileExtension = path.extname(filePath).toLowerCase();
    console.log('File extension:', fileExtension);
    
    if (fileExtension === '.pdf') {
      console.log('Processing PDF file');
      const fs = require('fs');
      const pdf = require('pdf-parse');
      
      const dataBuffer = fs.readFileSync(filePath);
      const pdfResult = await pdf(dataBuffer);
      documentText = pdfResult.text;
      console.log('PDF extracted text length:', documentText.length);
    } else if (['.jpg', '.jpeg', '.png'].includes(fileExtension)) {
      console.log('Processing image file with OCR');
      try {
        const worker = await createWorker();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data: { text } } = await worker.recognize(filePath);
        console.log('OCR extracted text length:', text.length);
        documentText = text;
        await worker.terminate();
      } catch (ocrError) {
        console.error('OCR Error:', ocrError);
        throw new Error(`OCR failed: ${ocrError.message}`);
      }
    } else {
      throw new Error(`Unsupported file type: ${fileExtension}`);
    }

    const prompt = {
      contents: [{
        parts: [{
          text: `You are a medical document analyzer. Format lab reports and prescriptions into structured JSON data.

Analyze this medical document and extract key information into structured JSON format.

Document Text:
${documentText}

Rules:
1. If it's a lab report, include test name, value, range, and status (H for high, L for low, or null for normal)
2. If it's a prescription, include medication details
3. Always identify the document type, date, and doctor's name
4. Format results based on document type

Return ONLY a JSON object with this structure (no other text):
{
  "type": "lab_report" or "prescription",
  "date": "document date",
  "doctor": "doctor name",
  "lab_results": [
    { "test": "test name", "value": "result value", "range": "normal range", "status": "H/L/null" }
  ],
  "medications": [
    { "name": "", "dosage": "", "frequency": "", "duration": "", "instructions": "" }
  ],
  "summary": "brief analysis of key findings"
}`
        }]
      }]
    };

    // Generate content
    console.log('Sending prompt to Gemini...');
    const result = await model.generateContent(prompt);
    console.log('Received response from Gemini');
    
    const response = await result.response;
    const responseText = await response.text(); // Store the text first
    console.log('Raw response:', responseText);
    
    try {
      // Try to parse the response directly
      const parsedJson = JSON.parse(responseText);
      console.log('Successfully parsed JSON response');
      return parsedJson;
    } catch (parseError) {
      console.error('Error parsing response as direct JSON:', parseError);
      
      // If direct parsing fails, try to extract JSON from the text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON object found in response');
        throw new Error('No valid JSON found in response');
      }
      
      try {
        const extractedJson = JSON.parse(jsonMatch[0]);
        console.log('Successfully parsed extracted JSON');
        return extractedJson;
      } catch (extractError) {
        console.error('Error parsing extracted JSON:', extractError);
        throw new Error('Failed to parse response data');
      }
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

module.exports = { analyzeWithGemini };
