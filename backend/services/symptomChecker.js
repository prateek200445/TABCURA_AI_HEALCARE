const { GoogleGenerativeAI } = require("@google/generative-ai");

// Check for API key
if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set. Please add it to your .env file.');
}

// Initialize the Gemini API with error handling
let genAI;
try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('Successfully initialized Gemini AI');
} catch (error) {
    console.error('Error initializing Gemini AI:', error);
    throw new Error('Failed to initialize AI service. Please check your API key.');
}

// Get the model
const model = genAI.getGenerativeModel({
    model: "gemini-pro",  // Using the correct model name
    generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
    }
});

async function analyzeSymptoms(symptoms, userContext = {}) {
    try {
        if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length === 0) {
            throw new Error('Valid symptoms description is required');
        }

        console.log('Analyzing symptoms:', symptoms);

        // Validate user context
        const validatedContext = {
            age: userContext.age || 'Not provided',
            gender: userContext.gender || 'Not provided',
            existingConditions: Array.isArray(userContext.existingConditions) ? userContext.existingConditions : [],
            medications: Array.isArray(userContext.medications) ? userContext.medications : []
        };

        // Construct user context string
        const contextStr = `\nPatient Context:
- Age: ${validatedContext.age}
- Gender: ${validatedContext.gender}
- Existing Conditions: ${validatedContext.existingConditions.length ? validatedContext.existingConditions.join(', ') : 'None reported'}
- Current Medications: ${validatedContext.medications.length ? validatedContext.medications.join(', ') : 'None reported'}`;

        const prompt = `As an AI symptom analyzer, analyze these symptoms and provide structured medical guidance. Return ONLY a JSON response in this exact format:

{
    "symptomSummary": "brief summary of symptoms",
    "possibleCauses": ["cause 1", "cause 2"],
    "recommendedActions": {
        "urgencyLevel": "Low/Medium/High",
        "immediateSteps": ["step 1", "step 2"],
        "homeRemedies": ["remedy 1", "remedy 2"],
        "medications": ["medication 1", "medication 2"],
        "doctorVisit": {
            "required": true or false,
            "urgency": "immediate/within 24 hours/within a week/etc",
            "specialistType": "type of doctor if needed",
            "reason": "why visit is needed"
        }
    },
    "warningFlags": ["warning 1", "warning 2"],
    "preventiveMeasures": ["measure 1", "measure 2"],
    "followUpNeeded": true or false
}

Analyze these symptoms:
6. If a doctor's visit is needed, specify what type of specialist would be most appropriate

Please provide your analysis in this JSON format:
{
    "symptomSummary": "Brief summary of the symptoms",
    "possibleCauses": ["cause1", "cause2", ...],
    "recommendedActions": {
        "urgencyLevel": "Low/Medium/High",
        "immediateSteps": ["step1", "step2", ...],
        "homeRemedies": ["remedy1", "remedy2", ...],
        "medications": ["medication1", "medication2", ...],
        "doctorVisit": {
            "required": true/false,
            "urgency": "When to visit",
            "specialistType": "Type of doctor to see",
            "reason": "Why a doctor visit is needed"
        }
    },
    "warningFlags": ["any concerning symptoms that need immediate attention"],
    "preventiveMeasures": ["measure1", "measure2", ...],
    "followUpNeeded": true/false
}

Symptoms Description:
${symptoms}
${contextStr}

Please provide a comprehensive but cautious analysis. If there's any possibility of a serious condition, always recommend a doctor's visit.`;

        // Send to Gemini API
        console.log('Sending request to Gemini API...');
        const result = await model.generateContent(prompt);
        if (!result) {
            throw new Error('No response received from AI model');
        }

        const response = await result.response;
        const text = response.text();
        console.log('Raw response from Gemini:', text);
        
        // Attempt to clean the response if it contains markdown backticks
        const cleanedText = text.replace(/```json\s*|\s*```/g, '');

        // Parse and validate the JSON response
        try {
            const parsedResponse = JSON.parse(text);
            
            // Validate required fields
            if (!parsedResponse.symptomSummary || !parsedResponse.recommendedActions) {
                throw new Error('Invalid response format from AI model');
            }

            // Ensure proper structure
            const validatedResponse = {
                symptomSummary: parsedResponse.symptomSummary,
                possibleCauses: Array.isArray(parsedResponse.possibleCauses) ? parsedResponse.possibleCauses : [],
                recommendedActions: {
                    urgencyLevel: parsedResponse.recommendedActions.urgencyLevel || 'Medium',
                    immediateSteps: Array.isArray(parsedResponse.recommendedActions.immediateSteps) ? 
                        parsedResponse.recommendedActions.immediateSteps : [],
                    homeRemedies: Array.isArray(parsedResponse.recommendedActions.homeRemedies) ? 
                        parsedResponse.recommendedActions.homeRemedies : [],
                    medications: Array.isArray(parsedResponse.recommendedActions.medications) ? 
                        parsedResponse.recommendedActions.medications : [],
                    doctorVisit: {
                        required: Boolean(parsedResponse.recommendedActions.doctorVisit?.required),
                        urgency: parsedResponse.recommendedActions.doctorVisit?.urgency || '',
                        specialistType: parsedResponse.recommendedActions.doctorVisit?.specialistType || '',
                        reason: parsedResponse.recommendedActions.doctorVisit?.reason || ''
                    }
                },
                warningFlags: Array.isArray(parsedResponse.warningFlags) ? parsedResponse.warningFlags : [],
                preventiveMeasures: Array.isArray(parsedResponse.preventiveMeasures) ? parsedResponse.preventiveMeasures : [],
                followUpNeeded: Boolean(parsedResponse.followUpNeeded)
            };

            return validatedResponse;
        } catch (parseError) {
            console.error('Error parsing or validating Gemini response:', parseError);
            throw new Error('Failed to process symptom analysis results: ' + parseError.message);
        }
    } catch (error) {
        console.error('Error in symptom analysis:', error);
        throw new Error('Symptom analysis failed: ' + (error.message || 'Unknown error'));
    }
}

module.exports = {
    analyzeSymptoms
};
