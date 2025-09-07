const OpenAI = require('openai');

class OpenAIAnalysisEngine {
    constructor() {
        this.model = 'gpt-4-1106-preview'; // Latest GPT-4 Turbo
        this.enabled = process.env.ENABLE_OPENAI === 'true' && !!process.env.OPENAI_API_KEY;
        
        // Only initialize client if API key is available
        this.client = null;
        if (this.enabled) {
            try {
                this.client = new OpenAI({
                    apiKey: process.env.OPENAI_API_KEY
                });
            } catch (error) {
                console.warn('OpenAI client initialization failed:', error.message);
                this.enabled = false;
            }
        }
    }

    async processUserData(userData) {
        if (!this.enabled) {
            throw new Error('OpenAI engine not enabled or API key not configured');
        }

        console.log('🤖 Starting OpenAI GPT-4 Analysis...');

        try {
            // Generate comprehensive analysis prompt
            const analysisPrompt = this.buildAnalysisPrompt(userData);
            
            const completion = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: "system",
                        content: this.getSystemPrompt()
                    },
                    {
                        role: "user", 
                        content: analysisPrompt
                    }
                ],
                temperature: 0.3, // Lower temperature for more consistent analysis
                max_tokens: 3000,
                response_format: { type: "json_object" }
            });

            const analysis = JSON.parse(completion.choices[0].message.content);
            
            // Enhance with reasoning traces
            const reasoningTrace = await this.generateReasoningTrace(userData, analysis);
            
            return {
                ...analysis,
                engineType: 'openai',
                engineVersion: this.model,
                processingTime: Date.now(),
                reasoningTrace,
                usage: completion.usage,
                aiInsights: this.generateOpenAIInsights(analysis, reasoningTrace)
            };

        } catch (error) {
            console.error('OpenAI Analysis Error:', error);
            throw new Error(`OpenAI analysis failed: ${error.message}`);
        }
    }

    getSystemPrompt() {
        return `You are an expert acquisition advisor and business psychology analyst. Your task is to analyze an entrepreneur's profile and determine their optimal acquisition strategy using the "Fit-First" principle.

CORE COMPETENCIES TO ANALYZE:
1. Sales & Marketing - Revenue generation, customer acquisition
2. Operations & Systems - Process optimization, efficiency 
3. Finance & Analytics - Financial analysis, data-driven decisions
4. Team & Culture - Leadership, people development
5. Product & Technology - Innovation, technical capabilities

OPERATOR ARCHETYPES:
- The Growth Catalyst (Sales & Marketing strength)
- The Efficiency Expert (Operations & Systems strength)  
- The Visionary Builder (Product & Technology strength)
- The People Leader (Team & Culture strength)
- The Financial Strategist (Finance & Analytics strength)

ANALYSIS METHODOLOGY:
1. Evaluate evidence quality and depth for each competency
2. Identify primary archetype based on strongest demonstrated capability
3. Analyze industry interests using semantic understanding
4. Calculate confidence scores based on evidence strength
5. Generate personalized acquisition strategy

RESPONSE FORMAT:
Return a JSON object with this exact structure:
{
  "operatorArchetype": {
    "key": "competency_name",
    "title": "Archetype Title", 
    "compositeScore": 4.2,
    "confidence": 0.85,
    "evidence": "supporting evidence text",
    "reasoning": "detailed reasoning for this selection"
  },
  "leverageThesis": "specific leverage opportunity",
  "targetIndustries": [
    {"industry": "name", "relevance": 8, "confidence": 0.9, "reasoning": "why this industry"}
  ],
  "confidenceScores": {
    "overall": 0.85,
    "archetype": 0.9, 
    "industry": 0.8,
    "dataQuality": 0.85
  },
  "acquisitionThesis": "2-3 paragraph narrative",
  "personalizedBuybox": [
    {"criterion": "name", "target": "specific target", "rationale": "reasoning"}
  ],
  "financialAnalysis": {
    "sdeRange": "$X - $Y",
    "maxPurchasePrice": number,
    "industryMultiple": 3.5,
    "industryConfidence": 0.8
  }
}

Be thorough, analytical, and provide clear reasoning for all conclusions.`;
    }

    buildAnalysisPrompt(userData) {
        return `Please analyze this entrepreneur's acquisition profile:

COMPETENCY EVIDENCE:
Sales & Marketing (Rating: ${userData.sales_marketing.rating}/5):
"${userData.sales_marketing.evidence}"

Operations & Systems (Rating: ${userData.operations_systems.rating}/5):
"${userData.operations_systems.evidence}"

Finance & Analytics (Rating: ${userData.finance_analytics.rating}/5):
"${userData.finance_analytics.evidence}"

Team & Culture (Rating: ${userData.team_culture.rating}/5):
"${userData.team_culture.evidence}"

Product & Technology (Rating: ${userData.product_technology.rating}/5):
"${userData.product_technology.evidence}"

INDUSTRY INTERESTS:
Topics/Industries of Interest: "${userData.interests_topics}"
Recent Business Reading: "${userData.recent_books}"
Problem to Solve: "${userData.problem_to_solve}"
Customer Preference: "${userData.customer_affinity}"

FINANCIAL PROFILE:
- Total Liquid Capital: $${userData.total_liquid_capital.toLocaleString()}
- Potential Loan Amount: $${userData.potential_loan_amount.toLocaleString()}
- Minimum Annual Income: $${userData.min_annual_income.toLocaleString()}
- Time Commitment: ${userData.time_commitment} hours/week
- Location Preference: ${userData.location_preference}
- Risk Tolerance: ${userData.risk_tolerance}

ANALYSIS REQUIREMENTS:
1. Determine the primary operator archetype based on strongest demonstrated competency
2. Assess the quality and depth of evidence for each competency
3. Identify 3-5 target industries based on interests and expertise alignment  
4. Calculate realistic financial parameters for acquisition search
5. Generate a comprehensive acquisition strategy

Focus on evidence quality, demonstrated achievements, and specific examples rather than just self-ratings.`;
    }

    async generateReasoningTrace(userData, analysis) {
        try {
            const reasoningPrompt = `Given this analysis result, please provide a detailed reasoning trace explaining the decision-making process:

ANALYSIS RESULT:
${JSON.stringify(analysis, null, 2)}

ORIGINAL USER DATA:
${JSON.stringify(userData, null, 2)}

Please explain:
1. Why this specific archetype was selected
2. How the evidence quality influenced the decision
3. The methodology for industry selection
4. Key factors that drove confidence scores
5. Any alternative archetypes that were considered and why they were rejected

Provide a step-by-step reasoning chain that shows the analytical process.`;

            const reasoning = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: "system",
                        content: "You are explaining the analytical reasoning behind an acquisition strategy analysis. Be detailed, logical, and transparent about the decision-making process."
                    },
                    {
                        role: "user",
                        content: reasoningPrompt
                    }
                ],
                temperature: 0.2,
                max_tokens: 1500
            });

            return reasoning.choices[0].message.content;

        } catch (error) {
            console.error('Reasoning trace generation failed:', error);
            return "Reasoning trace generation unavailable due to API limitations.";
        }
    }

    generateOpenAIInsights(analysis, reasoningTrace) {
        return {
            engineName: "OpenAI GPT-4 Turbo",
            processingApproach: "Large Language Model with business acquisition expertise",
            keyStrengths: [
                "Advanced natural language understanding of evidence quality",
                "Semantic industry analysis beyond keyword matching", 
                "Nuanced competency assessment with contextual reasoning",
                `Selected ${analysis.operatorArchetype.title} with ${Math.round(analysis.confidenceScores.overall * 100)}% confidence`
            ],
            analyticalMethod: [
                "Multi-layered evidence evaluation",
                "Contextual competency scoring", 
                "Semantic industry clustering",
                "Integrated reasoning chains"
            ],
            uniqueCapabilities: [
                "Understands nuanced language and context",
                "Identifies subtle patterns in evidence",
                "Provides detailed reasoning explanations",
                "Adapts analysis based on evidence quality"
            ],
            limitations: [
                "Requires API access and internet connectivity",
                "Analysis quality depends on prompt engineering",
                "May occasionally hallucinate specific details",
                "Processing cost scales with usage"
            ],
            recommendedUse: "Best for nuanced analysis requiring deep language understanding and complex reasoning"
        };
    }

    isAvailable() {
        return this.enabled;
    }

    getEngineInfo() {
        return {
            name: "OpenAI GPT-4",
            type: "Large Language Model",
            model: this.model,
            provider: "OpenAI",
            capabilities: [
                "Advanced natural language understanding",
                "Complex reasoning and analysis", 
                "Semantic comprehension",
                "Detailed explanation generation"
            ],
            requirements: ["OpenAI API key", "Internet connectivity"],
            enabled: this.enabled
        };
    }
}

module.exports = OpenAIAnalysisEngine;

