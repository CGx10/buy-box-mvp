const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const AIEnhancedAcquisitionAdvisor = require('./src/aiEnhancedAdvisor');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Initialize the AI-Enhanced Advisor
const advisor = new AIEnhancedAcquisitionAdvisor();

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/analyze', async (req, res) => {
    try {
        const userData = req.body;
        
        // Validate required fields
        const validationResult = advisor.validateInput(userData);
        if (!validationResult.isValid) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: validationResult.errors
            });
        }

        // Process the user data through the AI advisor
        const analysis = await advisor.processUserData(userData);
        
        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during analysis'
        });
    }
});

app.listen(PORT, () => {
    console.log(`AI Acquisition Advisor running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} to access the application`);
});
