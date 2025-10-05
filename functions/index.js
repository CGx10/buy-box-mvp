const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import the main server logic
const MultiEngineManager = require('../src/multiEngineManager');

const app = express();

// CORS configuration for Firebase Functions
app.use(cors({
    origin: [
        'https://buybox-generator.web.app',
        'https://buybox-generator.firebaseapp.com',
        'http://localhost:3000',
        'http://localhost:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Initialize the Multi-Engine Manager
const engineManager = new MultiEngineManager();

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
    res.json({
        requests: 0,
        errors: 0,
        averageResponseTime: 0
    });
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
    const startTime = Date.now();
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
        
        // Record successful request
        const responseTime = Date.now() - startTime;
        console.log('Analysis completed', { engine, responseTime });
        
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
        const { userData, engines = ['gemini'] } = req.body;
        
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

// LinkedIn PDF data extraction
app.post('/api/extract-linkedin-data', async (req, res) => {
    try {
        const { pdfText } = req.body;
        
        if (!pdfText) {
            return res.status(400).json({
                success: false,
                error: 'PDF text is required'
            });
        }

        // Use Gemini for data extraction
        const geminiEngine = require('../src/engines/geminiEngine');
        const gemini = new geminiEngine();
        
        const systemPrompt = `You are an expert data extraction agent. Your task is to analyze the raw text from a LinkedIn profile PDF and extract specific information to pre-populate a questionnaire. Analyze the user's experience and summarize it for the five specified categories. Also, extract a list of skills or topics of interest. The output MUST be a valid JSON object.`;
        
        const userPrompt = `
            Analyze the following text from a LinkedIn profile and extract the relevant information.

            RAW TEXT:
            ---
            ${pdfText.substring(0, 30000)} 
            ---

            For each of the five categories below, provide a concise summary of the user's experience based ONLY on the text provided. If no relevant experience is found for a category, leave the string empty.
            
            - sales_marketing_evidence
            - operations_systems_evidence
            - finance_analytics_evidence
            - team_culture_evidence
            - product_technology_evidence

            Also, extract a comma-separated list of skills, technologies, or topics of interest mentioned in the text for the 'interests_topics' field.

            Return ONLY a valid JSON object with these fields.
        `;

        const extractedData = await gemini.extractLinkedInData(systemPrompt, userPrompt);
        
        res.json({
            success: true,
            extractedData: extractedData
        });
    } catch (error) {
        console.error('LinkedIn extraction error:', error);
        res.status(500).json({
            success: false,
            error: `LinkedIn data extraction failed: ${error.message}`
        });
    }
});

// Serve the main HTML file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Export the Express app as a Firebase Function
exports.app = functions.https.onRequest(app);
