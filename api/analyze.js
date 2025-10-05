const MultiEngineManager = require('../src/multiEngineManager');

module.exports = async (req, res) => {
  // Set CORS headers - specifically allow Firebase hosting
  res.setHeader('Access-Control-Allow-Origin', 'https://buybox-generator.web.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { userData, selectedEngines, analysisMethodology, engine } = req.body;
    
    console.log('🔍 DEBUG: API received request body:', { userData: userData ? 'present' : 'missing', selectedEngines, analysisMethodology, engine });
    console.log('🔍 DEBUG: AI model from userData:', userData?.ai_model);
    
    if (!userData) {
      res.status(400).json({ error: 'User data is required' });
      return;
    }

    // Determine which engine to use
    let engineToUse = 'traditional'; // default
    if (engine) {
      engineToUse = engine;
    } else if (userData.ai_model) {
      // Map AI model names to engine names
      if (userData.ai_model.includes('gemini')) {
        engineToUse = 'gemini';
      } else if (userData.ai_model.includes('gpt')) {
        engineToUse = 'openai';
      } else if (userData.ai_model.includes('claude')) {
        engineToUse = 'claude';
      }
    }
    
    console.log('🔍 DEBUG: Using engine:', engineToUse);
    console.log('🔍 DEBUG: AI model from userData:', userData.ai_model);

    const engineManager = new MultiEngineManager();
    const result = await engineManager.processWithEngine(engineToUse, userData);
    
    res.status(200).json({
      success: true,
      analysisResult: result
    });
  } catch (error) {
    console.error('Analysis error:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Analysis failed',
      details: error.message
    });
  }
};
