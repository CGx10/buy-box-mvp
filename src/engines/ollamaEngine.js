const axios = require('axios');

class OllamaAnalysisEngine {
    constructor() {
        this.baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        this.model = process.env.OLLAMA_MODEL || 'llama3.1';
        this.enabled = process.env.ENABLE_OLLAMA === 'true';
    }

    async processUserData(userData) {
        if (!this.enabled) {
            throw new Error('Ollama engine not enabled');
        }

        // Check if Ollama is running
        const isAvailable = await this.checkOllamaAvailability();
        if (!isAvailable) {
            throw new Error('Ollama server not available. Please ensure Ollama is running locally.');
        }

        console.log(`🤖 Starting Ollama ${this.model} Analysis...`);

        try {
            // Generate analysis using local LLM
            const analysisPrompt = this.buildAnalysisPrompt(userData);
            
            const response = await this.generateWithOllama(analysisPrompt);
            const analysis = this.parseOllamaResponse(response);
            
            // Generate reasoning explanation
            const reasoningExplanation = await this.generateReasoningExplanation(userData, analysis);
            
            return {
                ...analysis,
                engineType: 'ollama',
                engineVersion: this.model,
                processingTime: Date.now(),
                reasoningExplanation,
                aiInsights: this.generateOllamaInsights(analysis, reasoningExplanation)
            };

        } catch (error) {
            console.error('Ollama Analysis Error:', error);
            throw new Error(`Ollama analysis failed: ${error.message}`);
        }
    }

    async checkOllamaAvailability() {
        try {
            const response = await axios.get(`${this.baseURL}/api/tags`, { timeout: 5000 });
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }

    async generateWithOllama(prompt) {
        try {
            const response = await axios.post(`${this.baseURL}/api/generate`, {
                model: this.model,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.3,
                    num_predict: 3000,
                    top_p: 0.9
                }
            }, {
                timeout: 120000 // 2 minute timeout for local processing
            });

            return response.data.response;
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                throw new Error('Ollama server not running. Please start Ollama first.');
            }
            throw error;
        }
    }

    buildAnalysisPrompt(userData) {
        return `You are an expert acquisition advisor analyzing an entrepreneur's profile for business acquisition strategy. Use the "Fit-First" principle to match their strengths with appropriate business opportunities.

ENTREPRENEUR PROFILE:

COMPETENCY EVIDENCE:
1. Sales & Marketing (Self-rated: ${userData.sales_marketing.rating}/5)
   Evidence: "${userData.sales_marketing.evidence}"

2. Operations & Systems (Self-rated: ${userData.operations_systems.rating}/5)
   Evidence: "${userData.operations_systems.evidence}"

3. Finance & Analytics (Self-rated: ${userData.finance_analytics.rating}/5)
   Evidence: "${userData.finance_analytics.evidence}"

4. Team & Culture (Self-rated: ${userData.team_culture.rating}/5)
   Evidence: "${userData.team_culture.evidence}"

5. Product & Technology (Self-rated: ${userData.product_technology.rating}/5)
   Evidence: "${userData.product_technology.evidence}"

INTERESTS & GOALS:
- Industry Interests: "${userData.interests_topics}"
- Recent Reading: "${userData.recent_books}"
- Problem to Solve: "${userData.problem_to_solve}"
- Customer Preference: "${userData.customer_affinity}"

FINANCIAL PROFILE:
- Available Capital: $${userData.total_liquid_capital.toLocaleString()}
- Loan Potential: $${userData.potential_loan_amount.toLocaleString()}
- Income Requirement: $${userData.min_annual_income.toLocaleString()}
- Time Commitment: ${userData.time_commitment} hours/week
- Location: ${userData.location_preference}
- Risk Tolerance: ${userData.risk_tolerance}

ANALYSIS FRAMEWORK:

OPERATOR ARCHETYPES:
- The Growth Catalyst (Sales/Marketing strength) → Target: Strong products, weak marketing
- The Efficiency Expert (Operations strength) → Target: Good revenue, inefficient operations  
- The Visionary Builder (Product/Tech strength) → Target: Loyal customers, outdated products
- The People Leader (Team/Culture strength) → Target: High turnover, cultural issues
- The Financial Strategist (Finance strength) → Target: Undervalued, needs restructuring

TASK:
1. Evaluate evidence quality for each competency (look for specific achievements, numbers, results)
2. Select primary archetype based on strongest demonstrated capability
3. Identify 3-5 target industries based on interests and experience
4. Calculate appropriate SDE range for acquisition search
5. Generate personalized acquisition strategy

Focus on demonstrated achievements and concrete examples rather than self-ratings.

RESPONSE FORMAT:
Please structure your response with clear sections:

PRIMARY ARCHETYPE: [Selected archetype with reasoning]

COMPETENCY ANALYSIS: [Brief analysis of each competency with evidence quality assessment]

TARGET INDUSTRIES: [3-5 industries with reasons for selection]

FINANCIAL PARAMETERS: [SDE range and purchase price recommendations]

ACQUISITION THESIS: [2-3 paragraph strategic recommendation]

BUYBOX CRITERIA: [Key criteria for target businesses]

CONFIDENCE ASSESSMENT: [Your confidence in this analysis and reasoning]

Be specific, analytical, and provide clear reasoning for all recommendations.`;
    }

    parseOllamaResponse(responseText) {
        // Parse the structured response from Ollama
        const sections = this.extractSections(responseText);
        
        return {
            operatorArchetype: this.extractArchetype(sections),
            leverageThesis: this.extractLeverageThesis(sections),
            targetIndustries: this.extractIndustries(sections),
            confidenceScores: this.extractConfidenceScores(sections),
            acquisitionThesis: this.extractAcquisitionThesis(sections),
            personalizedBuybox: this.extractBuybox(sections),
            financialAnalysis: this.extractFinancialAnalysis(sections)
        };
    }

    extractSections(text) {
        const sections = {};
        const sectionHeaders = [
            'PRIMARY ARCHETYPE',
            'COMPETENCY ANALYSIS',
            'TARGET INDUSTRIES', 
            'FINANCIAL PARAMETERS',
            'ACQUISITION THESIS',
            'BUYBOX CRITERIA',
            'CONFIDENCE ASSESSMENT'
        ];

        let currentSection = '';
        const lines = text.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            const foundHeader = sectionHeaders.find(header => 
                trimmed.toUpperCase().includes(header)
            );
            
            if (foundHeader) {
                currentSection = foundHeader;
                sections[currentSection] = '';
            } else if (currentSection && trimmed) {
                sections[currentSection] += trimmed + ' ';
            }
        }

        return sections;
    }

    extractArchetype(sections) {
        const archetypeText = sections['PRIMARY ARCHETYPE'] || '';
        
        const archetypes = {
            'growth catalyst': { key: 'sales_marketing', title: 'The Growth Catalyst' },
            'efficiency expert': { key: 'operations_systems', title: 'The Efficiency Expert' },
            'visionary builder': { key: 'product_technology', title: 'The Visionary Builder' },
            'people leader': { key: 'team_culture', title: 'The People Leader' },
            'financial strategist': { key: 'finance_analytics', title: 'The Financial Strategist' }
        };

        for (const [pattern, archetype] of Object.entries(archetypes)) {
            if (archetypeText.toLowerCase().includes(pattern)) {
                return {
                    key: archetype.key,
                    title: archetype.title,
                    compositeScore: this.extractScore(archetypeText),
                    confidence: this.extractConfidence(archetypeText),
                    evidence: archetypeText,
                    reasoning: archetypeText
                };
            }
        }

        // Default if no clear match
        return {
            key: 'operations_systems',
            title: 'The Efficiency Expert',
            compositeScore: 3.5,
            confidence: 0.75,
            evidence: archetypeText,
            reasoning: archetypeText
        };
    }

    extractScore(text) {
        const scoreMatch = text.match(/(\d+\.?\d*)\s*\/\s*5|(\d+\.?\d*)\s*out of\s*5|score.*?(\d+\.?\d*)/i);
        return scoreMatch ? parseFloat(scoreMatch[1] || scoreMatch[2] || scoreMatch[3]) : 3.5;
    }

    extractConfidence(text) {
        const confMatch = text.match(/(\d+)%|confidence.*?(\d+\.?\d*)|(\d+\.?\d*)\s*confidence/i);
        const percentage = confMatch ? parseFloat(confMatch[1] || confMatch[2] || confMatch[3]) : 75;
        return percentage > 1 ? percentage / 100 : percentage;
    }

    extractLeverageThesis(sections) {
        const archetypeText = sections['PRIMARY ARCHETYPE'] || '';
        
        if (archetypeText.toLowerCase().includes('growth') || archetypeText.toLowerCase().includes('marketing')) {
            return 'Weak Marketing / Strong Product';
        } else if (archetypeText.toLowerCase().includes('efficiency') || archetypeText.toLowerCase().includes('operations')) {
            return 'Good Revenue / Inefficient Operations';
        } else if (archetypeText.toLowerCase().includes('visionary') || archetypeText.toLowerCase().includes('product')) {
            return 'Loyal Customer Base / Outdated Products';
        } else if (archetypeText.toLowerCase().includes('people') || archetypeText.toLowerCase().includes('culture')) {
            return 'High Turnover / Cultural Issues';
        } else {
            return 'Undervalued / Financial Restructuring Opportunities';
        }
    }

    extractIndustries(sections) {
        const industryText = sections['TARGET INDUSTRIES'] || '';
        const commonIndustries = [
            'technology', 'healthcare', 'finance', 'education', 'retail',
            'ecommerce', 'service', 'manufacturing', 'real estate', 'saas'
        ];

        const found = commonIndustries.filter(industry => 
            industryText.toLowerCase().includes(industry)
        ).slice(0, 5);

        if (found.length === 0) {
            found.push('service', 'technology', 'retail');
        }

        return found.map((industry, index) => ({
            industry,
            relevance: 9 - index,
            confidence: 0.8 - index * 0.05,
            reasoning: `Identified from Ollama analysis`
        }));
    }

    extractConfidenceScores(sections) {
        const confText = sections['CONFIDENCE ASSESSMENT'] || '';
        const baseConfidence = this.extractConfidence(confText);
        
        return {
            overall: baseConfidence,
            archetype: baseConfidence * 1.05,
            industry: baseConfidence * 0.9,
            dataQuality: baseConfidence * 0.95
        };
    }

    extractAcquisitionThesis(sections) {
        return sections['ACQUISITION THESIS'] || 'Local LLM-generated acquisition strategy based on comprehensive profile analysis.';
    }

    extractBuybox(sections) {
        const buyboxText = sections['BUYBOX CRITERIA'] || '';
        
        return [
            {
                criterion: 'Industries',
                target: 'Ollama-identified sectors',
                rationale: 'Based on local LLM analysis of interests and expertise'
            },
            {
                criterion: 'Business Model',
                target: 'Recurring Revenue > 60%',
                rationale: 'Provides stability and predictable cash flow'
            },
            {
                criterion: 'Size (SDE)',
                target: 'Ollama-calculated range',
                rationale: 'Based on available capital and risk tolerance'
            }
        ];
    }

    extractFinancialAnalysis(sections) {
        const finText = sections['FINANCIAL PARAMETERS'] || '';
        
        // Extract numerical values if present
        const sdeMatch = finText.match(/\$[\d,]+\s*-\s*\$[\d,]+/);
        const sdeRange = sdeMatch ? sdeMatch[0] : '$350,000 - $750,000';
        
        return {
            sdeRange,
            maxPurchasePrice: 1000000,
            industryMultiple: 3.0,
            industryConfidence: 0.75
        };
    }

    async generateReasoningExplanation(userData, analysis) {
        try {
            const reasoningPrompt = `Please explain your analytical reasoning for the following acquisition assessment:

ANALYSIS RESULTS:
- Selected Archetype: ${analysis.operatorArchetype.title}
- Target Industries: ${analysis.targetIndustries.map(i => i.industry).join(', ')}
- Confidence Level: ${Math.round(analysis.confidenceScores.overall * 100)}%

Explain your decision-making process:
1. How did you evaluate the evidence quality for each competency?
2. What factors led to selecting this specific archetype?
3. Why did you choose these particular industries?
4. What influenced your confidence assessment?
5. What alternatives did you consider?

Keep your explanation concise but thorough.`;

            const reasoning = await this.generateWithOllama(reasoningPrompt);
            return reasoning;

        } catch (error) {
            console.error('Ollama reasoning explanation failed:', error);
            return "Detailed reasoning explanation unavailable due to processing limitations.";
        }
    }

    generateOllamaInsights(analysis, reasoningExplanation) {
        return {
            engineName: `Ollama ${this.model}`,
            processingApproach: "Local Large Language Model with privacy-first processing",
            keyStrengths: [
                "Complete data privacy - no data leaves your system",
                "Fast local processing without API dependencies",
                "Customizable model selection and parameters",
                "Cost-effective for high-volume analysis"
            ],
            analyticalMethod: [
                "Local natural language processing",
                "Pattern recognition in evidence",
                "Structured analytical framework",
                "Privacy-preserving analysis"
            ],
            uniqueCapabilities: [
                "100% private and secure processing",
                "No internet connectivity required",
                "Customizable model configurations",
                "Unlimited usage without API costs"
            ],
            limitations: [
                "Requires local Ollama installation and setup",
                "Analysis quality depends on selected model",
                "May have less business domain knowledge than specialized APIs",
                "Processing time varies with hardware capabilities"
            ],
            recommendedUse: "Best for privacy-sensitive analysis and high-volume processing needs"
        };
    }

    isAvailable() {
        return this.enabled;
    }

    async getEngineInfo() {
        const available = await this.checkOllamaAvailability();
        
        return {
            name: `Ollama ${this.model}`,
            type: "Local Large Language Model",
            model: this.model,
            provider: "Ollama (Local)",
            capabilities: [
                "Local natural language processing",
                "Privacy-first analysis",
                "Customizable model selection",
                "Offline operation"
            ],
            requirements: ["Ollama installation", "Local model download"],
            enabled: this.enabled && available,
            serverStatus: available ? "Running" : "Not available"
        };
    }
}

module.exports = OllamaAnalysisEngine;

