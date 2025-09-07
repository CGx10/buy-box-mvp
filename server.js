const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Load environment variables with defaults
require('dotenv').config();

// Set default environment variables if not provided
process.env.DEFAULT_AI_ENGINE = process.env.DEFAULT_AI_ENGINE || 'traditional';
process.env.ENABLE_TRADITIONAL = process.env.ENABLE_TRADITIONAL || 'true';
process.env.ENABLE_OPENAI = process.env.ENABLE_OPENAI || 'false';
process.env.ENABLE_CLAUDE = process.env.ENABLE_CLAUDE || 'false';
process.env.ENABLE_GEMINI = process.env.ENABLE_GEMINI || 'false';
process.env.ENABLE_OLLAMA = process.env.ENABLE_OLLAMA || 'false';
process.env.ENABLE_HYBRID = process.env.ENABLE_HYBRID || 'false';

const MultiEngineManager = require('./src/multiEngineManager');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Initialize the Multi-Engine Manager
const engineManager = new MultiEngineManager();

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get available AI engines
app.get('/api/engines', async (req, res) => {
    try {
        const engines = await engineManager.getAvailableEngines();
        res.json({
            success: true,
            engines,
            defaultEngine: engineManager.getDefaultEngine()
        });
    } catch (error) {
        console.error('Engine info error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get engine information'
        });
    }
});

// Single engine analysis
app.post('/api/analyze', async (req, res) => {
    try {
        const { userData, engine = engineManager.getDefaultEngine() } = req.body;
        
        // Validate required fields
        const validationResult = engineManager.validateInput(userData);
        if (!validationResult.isValid) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: validationResult.errors
            });
        }

        // Process with specified engine
        const analysis = await engineManager.processWithEngine(engine, userData);
        
        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({
            success: false,
            error: `Analysis failed: ${error.message}`
        });
    }
});

// Multi-engine comparison analysis
app.post('/api/analyze/compare', async (req, res) => {
    try {
        const { userData, engines = ['traditional', 'openai'] } = req.body;
        
        // Validate required fields
        const validationResult = engineManager.validateInput(userData);
        if (!validationResult.isValid) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: validationResult.errors
            });
        }

        // Process with multiple engines
        const multiResults = await engineManager.processWithMultipleEngines(engines, userData);
        const comparison = engineManager.getEngineComparison(multiResults);
        
        res.json({
            success: true,
            data: {
                ...multiResults,
                comparison
            }
        });
    } catch (error) {
        console.error('Multi-engine analysis error:', error);
        res.status(500).json({
            success: false,
            error: `Multi-engine analysis failed: ${error.message}`
        });
    }
});

app.listen(PORT, () => {
    console.log(`Buybox Generator running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} to access the application`);
});
