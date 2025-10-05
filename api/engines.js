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

  try {
    const engineManager = new MultiEngineManager();
    const engines = await engineManager.getAvailableEngines();
    
    res.status(200).json({
      success: true,
      engines: engines,
      defaultEngine: 'traditional'
    });
  } catch (error) {
    console.error('Error fetching engines:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available engines',
      details: error.message
    });
  }
};
