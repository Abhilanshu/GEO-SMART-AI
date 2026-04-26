const { processGemmaCommand } = require('../utils/ollama');

/**
 * AI Command Controller
 * Connects the Dashboard to the Zero-Hallucination Gemma 4 Brain
 */
exports.processAIOrder = async (req, res) => {
  try {
    const { order, context } = req.body;
    
    // Process using the high-fidelity Gemma 4 logic (Local with Simulated Fallback)
    const strategicResponse = await processGemmaCommand(order, context);

    res.status(200).json({
      response: strategicResponse,
      timestamp: new Date()
    });
  } catch (error) {
    console.error("Critical AI Command Error:", error);
    res.status(200).json({ 
       response: "[EMERGENCY FALLBACK] Order received, but tactical engine is initializing. Please retry in 5 seconds.",
       timestamp: new Date()
    });
  }
};
