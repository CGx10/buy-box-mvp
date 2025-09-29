// Vercel serverless function entry point
const express = require('express');
const bodyParser = require('body-parser');

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

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Simple Gemini Engine implementation
class GeminiEngine {
    constructor() {
        this.available = !!process.env.GEMINI_API_KEY;
        this.model = 'gemini-2.5-flash';
    }

    async analyzeUserData(userData) {
        if (!this.available) {
            throw new Error('Gemini engine is not available. Please check your API key configuration.');
        }

        try {
            const availableModels = await this.fetchAvailableModels();
            const userSelectedModel = userData.ai_model || userData.model;
            let modelsToTry = [];

            if (userSelectedModel) {
                console.log(`🎯 User selected specific model: ${userSelectedModel}`);
                modelsToTry = [userSelectedModel, ...availableModels.filter(m => m !== userSelectedModel)];
            } else {
                console.log(`🔄 No specific model selected, using default order`);
                modelsToTry = availableModels;
            }

            let lastError = null;
            let successfulModel = null;

            for (const tryModel of modelsToTry) {
                try {
                    console.log(`🔄 Trying model: ${tryModel}`);
                    const result = await this.callGeminiAPI(userData, tryModel);
                    successfulModel = tryModel;
                    console.log(`✅ Success with model: ${successfulModel}`);
                    return result;
                } catch (error) {
                    console.log(`❌ Model ${tryModel} failed:`, error.message);
                    lastError = error;
                    continue;
                }
            }
            throw new Error(`All models failed. Last error: ${lastError?.message}`);
        } catch (error) {
            console.error('Gemini analysis error:', error);
            throw new Error(`Gemini analysis failed: ${error.message}`);
        }
    }

    async fetchAvailableModels() {
        try {
            const geminiApiKey = process.env.GEMINI_API_KEY;
            if (!geminiApiKey) {
                throw new Error('Gemini API key not configured');
            }
            console.log('🔍 Fetching available models from Gemini API...');
            const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`);
            if (modelsResponse.ok) {
                const modelsData = await modelsResponse.json();
                const availableModels = modelsData.models
                    ?.filter(model => model.supportedGenerationMethods?.includes('generateContent'))
                    ?.map(model => model.name.replace('models/', '')) || [];
                console.log('✅ Available models from API:', availableModels);
                return availableModels;
            }
        } catch (error) {
            console.log('⚠️ Could not fetch models from API:', error.message);
        }
        const fallbackModels = [
            'gemini-2.5-pro',
            'gemini-2.5-flash',
            'gemini-2.5-flash-lite'
        ];
        console.log('🔄 Using fallback models:', fallbackModels);
        return fallbackModels;
    }

    async callGeminiAPI(userData, modelName) {
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            throw new Error('Gemini API key not configured');
        }
        const prompt = this.buildAnalysisPrompt(userData);
        const requestBody = {
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 8000,
                topP: 0.8,
                topK: 10
            }
        };
        console.log(`🚀 Making API call to Gemini 2.5 model: ${modelName}`);
        console.log(`📝 Request body structure:`, JSON.stringify(requestBody, null, 2));
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            }
        );
        console.log(`📊 API Response Status: ${response.status}`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API Error Response:`, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        const data = await response.json();
        console.log(`✅ API Response received successfully`);
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const content = data.candidates[0].content.parts[0].text;
            return {
                success: true,
                content: content,
                model: modelName,
                usage: data.usageMetadata || {}
            };
        } else {
            throw new Error('No valid content in response');
        }
    }

    buildAnalysisPrompt(userData) {
        const competencies = userData.competencies || {};
        const competencyText = Object.entries(competencies)
            .map(([key, value]) => {
                const rating = value?.rating || value || 'Not provided';
                const evidence = value?.evidence || '';
                return `${key}: ${rating}${evidence ? ` (Evidence: ${evidence})` : ''}`;
            })
            .join('\n');

        return `You are an expert business acquisition advisor. Analyze the following user profile and provide a comprehensive acquisition strategy report.

USER PROFILE:
- Total Liquid Capital: ${userData.total_liquid_capital || 'Not specified'}
- Investment Timeline: ${userData.investment_timeline || 'Not specified'}
- Risk Tolerance: ${userData.risk_tolerance || 'Not specified'}
- Geographic Focus: ${userData.geographic_focus || 'Not specified'}
- Industry Interests: ${userData.interests_topics || 'Not specified'}

COMPETENCY ASSESSMENT:
${competencyText}

Please provide a detailed analysis including:
1. Executive Summary
2. Strategic Acquisition Framework
3. Target Company Profile
4. Financial Analysis
5. Risk Assessment
6. Implementation Timeline
7. Success Metrics

Format your response with clear headings and actionable insights.`;
    }
}

// Simple Multi-Engine Manager
class MultiEngineManager {
    constructor() {
        this.engines = {
            gemini: new GeminiEngine()
        };
        this.defaultEngine = 'gemini';
    }

    async getAvailableEngines() {
        const available = [];
        for (const [name, engine] of Object.entries(this.engines)) {
            if (engine.available) {
                available.push(name);
            }
        }
        console.log(`🔧 Available engines: ${available.join(', ')}`);
        return available;
    }

    getDefaultEngine() {
        return this.defaultEngine;
    }

    validateInput(userData) {
        const errors = [];
        
        if (!userData) {
            errors.push('User data is required');
            return { isValid: false, errors };
        }

        if (!userData.competencies || Object.keys(userData.competencies).length === 0) {
            errors.push('At least one competency assessment is required');
        }

        if (!userData.total_liquid_capital) {
            errors.push('Total liquid capital is required');
        }

        return { isValid: errors.length === 0, errors };
    }

    async processWithEngine(engineName, userData) {
        const engine = this.engines[engineName];
        if (!engine) {
            throw new Error(`Engine '${engineName}' not found`);
        }
        if (!engine.available) {
            throw new Error(`Engine '${engineName}' is not available`);
        }
        return await engine.analyzeUserData(userData);
    }
}

// Initialize engine manager
const engineManager = new MultiEngineManager();

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
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

// Get available Gemini models dynamically
app.get('/api/models/available', async (req, res) => {
    try {
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            return res.json({
                success: false,
                error: 'Gemini API key not configured',
                models: []
            });
        }

        let availableModels = [];
        try {
            console.log('🔍 Fetching available models from Gemini API... v2.6');
            const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`);
            if (modelsResponse.ok) {
                const modelsData = await modelsResponse.json();
                availableModels = modelsData.models
                    ?.filter(model => model.supportedGenerationMethods?.includes('generateContent'))
                    ?.map(model => ({
                        name: model.name.replace('models/', ''),
                        displayName: model.displayName || model.name.replace('models/', ''),
                        description: model.description || '',
                        available: true
                    })) || [];
                console.log('✅ Available models from API:', availableModels.map(m => m.name));
            }
        } catch (error) {
            console.log('⚠️ Could not fetch models from API:', error.message);
        }

        // Fallback models for 2025 - using stable identifiers
        const fallbackModels = [
            { name: 'gemini-2.5-pro', displayName: 'Gemini 2.5 Pro', description: 'Most powerful model for complex reasoning and analysis (2025)', available: true },
            { name: 'gemini-2.5-flash', displayName: 'Gemini 2.5 Flash', description: 'Balanced model with best performance, cost, and speed (2025)', available: true },
            { name: 'gemini-2.5-flash-lite', displayName: 'Gemini 2.5 Flash Lite', description: 'Fastest and most cost-effective model (2025)', available: true }
        ];

        if (availableModels.length > 0) {
            const apiModelNames = availableModels.map(m => m.name);
            const combinedModels = [...availableModels];
            
            fallbackModels.forEach(fallback => {
                if (!apiModelNames.includes(fallback.name)) {
                    combinedModels.push({ ...fallback, available: false });
                }
            });
            
            res.json({
                success: true,
                models: combinedModels.sort((a, b) => {
                    if (a.available && !b.available) return -1;
                    if (!a.available && b.available) return 1;
                    return a.displayName.localeCompare(b.displayName);
                })
            });
        } else {
            res.json({
                success: true,
                models: fallbackModels
            });
        }
    } catch (error) {
        console.error('Error fetching available models:', error);
        res.json({
            success: false,
            error: error.message,
            models: []
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

        console.log(`🚀 Processing analysis with engine: ${engine}`);
        console.log('📊 User data received:', {
            competencies: userData.competencies ? Object.keys(userData.competencies) : 'none',
            interests: userData.interests_topics ? 'provided' : 'missing',
            capital: userData.total_liquid_capital || 'missing'
        });

        // Process with selected engine
        const result = await engineManager.processWithEngine(engine, userData);
        
        const processingTime = Date.now() - startTime;
        console.log(`✅ Analysis completed in ${processingTime}ms`);

        res.json({
            success: true,
            result,
            processingTime,
            engine: engine
        });

    } catch (error) {
        console.error('Analysis error:', error);
        const processingTime = Date.now() - startTime;
        
        res.status(500).json({
            success: false,
            error: error.message,
            processingTime,
            engine: req.body.engine || 'unknown'
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Export for Vercel
module.exports = app;