const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Enhanced Gemini Crisis Analyst
 * Supports: Multilingual NLP, Resource Calculation, and Risk Verification
 */
exports.analyzeCrisis = async (message) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are the GeoSmart AI Crisis Management Engine for India.
      A user has sent the following report: "${message}"

      TASKS:
      1. Detect the language (Hindi, Marathi, Bengali, Tamil, etc.). If not English, translate it.
      2. Categorize the crisis (Medical, Flood, Fire, Earthquake, etc.).
      3. Determine Urgency (1-5).
      4. DISPATCH CALCULATION: Based on the severity, calculate exactly what resources are needed from the inventory (e.g., "2 Boats, 50 Food Packets, 1 First Aid Kit").
      5. VERIFICATION: Determine if this report sounds credible.

      RETURN JSON ONLY:
      {
        "category": "...",
        "urgency": 1-5,
        "description": "Short English summary",
        "detectedLanguage": "...",
        "dispatchedResources": "List items here",
        "isVerified": boolean
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON from markdown if needed
    const jsonString = text.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return { 
        category: "General", 
        urgency: 3, 
        description: message, 
        detectedLanguage: "Unknown", 
        dispatchedResources: "1 Field Team", 
        isVerified: false 
    };
  }
};

/**
 * AI Vision for Multimodal Analysis
 */
exports.analyzeCrisisImage = async (base64Image) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = "Analyze this disaster field photo. Identify the type of damage, approximate number of victims, and accessibility (e.g., blocked roads). Return JSON: { category, urgency (1-5), description, affectedPeople, dispatchNeeds }";
    
    const imageParts = [
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg"
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    const jsonString = text.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Vision Analysis Error:", error);
    return null;
  }
};
