const { MultiEngineManager } = require('../src/multiEngineManager');

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
    const { userData, selectedEngines, analysisMethodology } = req.body;
    
    if (!userData) {
      res.status(400).json({ error: 'User data is required' });
      return;
    }

    const engineManager = new MultiEngineManager();
    const result = await engineManager.processUserData(userData, selectedEngines, analysisMethodology);
    
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Analysis failed'
    });
  }
};
