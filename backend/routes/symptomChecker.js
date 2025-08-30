const express = require('express');
const router = express.Router();
const { analyzeSymptoms } = require('../services/symptomChecker');

router.post('/analyze', async (req, res) => {
    try {
        // Check if Gemini API key exists
        if (!process.env.GEMINI_API_KEY) {
            console.error('Missing Gemini API key');
            return res.status(500).json({
                success: false,
                message: 'Server configuration error. Please contact support.',
                error: 'API key not configured'
            });
        }

        console.log('Received symptom analysis request:', req.body);
        const { symptoms, userInfo } = req.body;

        if (!symptoms || symptoms.trim().length === 0) {
            console.log('Missing symptoms in request');
            return res.status(400).json({
                success: false,
                message: 'Please provide a description of your symptoms'
            });
        }

        // Validate and prepare user context
        const userContext = {
            age: userInfo?.age || '',
            gender: userInfo?.gender || '',
            existingConditions: Array.isArray(userInfo?.existingConditions) ? userInfo.existingConditions : [],
            medications: Array.isArray(userInfo?.medications) ? userInfo.medications : []
        };

        const analysis = await analyzeSymptoms(symptoms, userContext);
        res.json({
            success: true,
            analysis
        });

    } catch (error) {
        console.error('Symptom analysis error:', error);
        
        // Handle different types of errors
        if (error.message.includes('GEMINI_API_KEY')) {
            return res.status(500).json({
                success: false,
                message: 'Server configuration error. Please contact support.',
                error: 'API configuration error'
            });
        }
        
        if (error.message.includes('No response received from AI model')) {
            return res.status(503).json({
                success: false,
                message: 'The AI service is temporarily unavailable. Please try again in a few minutes.',
                error: 'Service temporarily unavailable'
            });
        }
        
        if (error.message.includes('Invalid response format')) {
            return res.status(500).json({
                success: false,
                message: 'Unable to process the symptoms analysis. Please try again or rephrase your symptoms.',
                error: 'Processing error'
            });
        }
        
        // Default error response
        res.status(500).json({
            success: false,
            message: 'An error occurred while analyzing symptoms. Please try again.',
            error: error.message
        });
    }
});

module.exports = router;
