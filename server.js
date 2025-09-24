const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Gracefully handle missing dependencies for testing
let cors, compression, helmet;

try {
    cors = require('cors');
} catch (error) {
    console.warn('cors not available, using fallback');
    cors = () => (req, res, next) => next();
}

try {
    compression = require('compression');
} catch (error) {
    console.warn('compression not available, using fallback');
    compression = () => (req, res, next) => next();
}

try {
    helmet = require('helmet');
} catch (error) {
    console.warn('helmet not available, using fallback');
    helmet = () => (req, res, next) => next();
}

// Load environment variables with defaults
require('dotenv').config();

// Load production configurations
let securityConfig = {};
let monitoring = {};

try {
    securityConfig = require('./src/config/security');
} catch (error) {
    console.warn('Security config not available, using defaults:', error.message);
    securityConfig = {
        general: (req, res, next) => next(),
        analysis: (req, res, next) => next(),
        helmet: helmet(),
        cors: cors(),
        sanitizeInput: (req, res, next) => next()
    };
}

try {
    monitoring = require('./src/config/monitoring');
} catch (error) {
    console.warn('Monitoring config not available, using defaults:', error.message);
    monitoring = {
        logger: console,
        performanceMonitor: { recordRequest: () => {}, recordError: () => {}, getMetrics: () => ({}) }
    };
}

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

// Security middleware
app.use(securityConfig.helmet);
app.use(securityConfig.cors);

// Compression middleware
app.use(compression());

// Rate limiting
app.use(securityConfig.general);

// Body parsing
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Static files with caching
app.use(express.static('public', {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
    etag: true
}));

// Initialize the Multi-Engine Manager
const engineManager = new MultiEngineManager();

// Health check endpoint
app.get('/health', (req, res) => {
    const metrics = monitoring.performanceMonitor.getMetrics();
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        metrics
    });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
    const metrics = monitoring.performanceMonitor.getMetrics();
    res.json(metrics);
});

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
app.post('/api/analyze', securityConfig.analysis, securityConfig.sanitizeInput, async (req, res) => {
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
        monitoring.performanceMonitor.recordRequest(responseTime);
        monitoring.logger.info('Analysis completed', { engine, responseTime });
        
        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        // Record error
        monitoring.performanceMonitor.recordError();
        monitoring.logger.error('Analysis error:', error);
        
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
        const geminiEngine = require('./src/engines/geminiEngine');
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

// Only start the server if not in test environment
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Buybox Generator running on port ${PORT}`);
        console.log(`Open http://localhost:${PORT} to access the application`);
    });
}

// Export the app for testing
module.exports = app;
