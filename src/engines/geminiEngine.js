const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiAnalysisEngine {
    constructor() {
        this.name = 'Google Gemini';
        this.description = 'Google\'s advanced multimodal AI model with strong reasoning capabilities';
        this.available = false;
        this.model = null;
        
        // Initialize Gemini only if API key is available
        if (process.env.GEMINI_API_KEY && process.env.ENABLE_GEMINI === 'true') {
            try {
                this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                this.available = true;
                console.log('✅ Gemini engine initialized successfully');
            } catch (error) {
                console.log('⚠️  Gemini engine initialization failed:', error.message);
                this.available = false;
            }
        } else {
            console.log('ℹ️  Gemini engine disabled - set GEMINI_API_KEY and ENABLE_GEMINI=true to enable');
        }
    }

    isAvailable() {
        return this.available;
    }

    async getEngineInfo() {
        return {
            name: "Google Gemini",
            type: "Multimodal AI",
            model: "gemini-1.5-flash",
            provider: "Google",
            capabilities: [
                "Advanced reasoning and analysis",
                "Multimodal understanding",
                "Fast response times",
                "Cost-effective processing"
            ],
            requirements: ["Gemini API key", "Internet connectivity"],
            enabled: this.available,
            available: this.available
        };
    }

    async processUserData(userData) {
        return this.analyzeUserData(userData);
    }

    async analyzeUserData(userData) {
        if (!this.available) {
            throw new Error('Gemini engine is not available. Please check your API key configuration.');
        }

        try {
            const prompt = this.buildAnalysisPrompt(userData);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            return this.parseGeminiResponse(text, userData);
        } catch (error) {
            console.error('Gemini analysis error:', error);
            throw new Error(`Gemini analysis failed: ${error.message}`);
        }
    }

    buildAnalysisPrompt(userData) {
        return `
You are an expert acquisition advisor analyzing an entrepreneur's profile to generate a personalized buybox strategy.

ENTREPRENEUR PROFILE:
- Sales & Marketing Skills: ${userData.sales_marketing?.rating || 'Not provided'} (Evidence: ${userData.sales_marketing?.evidence || 'None'})
- Operations & Systems: ${userData.operations_systems?.rating || 'Not provided'} (Evidence: ${userData.operations_systems?.evidence || 'None'})
- Finance & Analytics: ${userData.finance_analytics?.rating || 'Not provided'} (Evidence: ${userData.finance_analytics?.evidence || 'None'})
- Team & Culture: ${userData.team_culture?.rating || 'Not provided'} (Evidence: ${userData.team_culture?.evidence || 'None'})
- Product & Technology: ${userData.product_technology?.rating || 'Not provided'} (Evidence: ${userData.product_technology?.evidence || 'None'})
- Interests & Topics: ${userData.interests_topics || 'Not provided'}
- Recent Books: ${userData.recent_books || 'Not provided'}
- Problem to Solve: ${userData.problem_to_solve || 'Not provided'}
- Customer Affinity: ${userData.customer_affinity || 'Not provided'}
- Total Liquid Capital: $${userData.total_liquid_capital || 'Not provided'}
- Potential Loan Amount: $${userData.potential_loan_amount || 'Not provided'}
- Risk Tolerance: ${userData.risk_tolerance || 'Not provided'}
- Time Commitment: ${userData.time_commitment || 'Not provided'}
- Geographic Preferences: ${userData.geographic_preferences || 'Not provided'}
- Deal Size Range: ${userData.deal_size_range || 'Not provided'}
- Revenue Range: ${userData.revenue_range || 'Not provided'}
- EBITDA Range: ${userData.ebitda_range || 'Not provided'}
- Employee Count: ${userData.employee_count || 'Not provided'}
- Business Model: ${userData.business_model || 'Not provided'}
- Technology Level: ${userData.technology_level || 'Not provided'}
- Customer Concentration: ${userData.customer_concentration || 'Not provided'}
- Market Position: ${userData.market_position || 'Not provided'}
- Growth Stage: ${userData.growth_stage || 'Not provided'}
- Exit Timeline: ${userData.exit_timeline || 'Not provided'}
- Additional Criteria: ${userData.additional_criteria || 'Not provided'}

ANALYSIS REQUIREMENTS:
1. Determine the operator archetype (Growth Catalyst, Efficiency Expert, Turnaround Specialist, Lifestyle Operator, or Strategic Builder)
2. Identify target industries with specific rationale
3. Calculate financial parameters (max purchase price, SDE range, etc.)
4. Generate acquisition thesis
5. Create personalized buybox criteria

Please provide your analysis in the following JSON format:
{
  "operatorArchetype": {
    "type": "archetype_name",
    "confidence": 0.85,
    "reasoning": "detailed explanation"
  },
  "targetIndustries": [
    {
      "industry": "industry_name",
      "priority": "high/medium/low",
      "rationale": "why this industry fits"
    }
  ],
  "financialParameters": {
    "maxPurchasePrice": 5000000,
    "sdeRange": "500k-1.5M",
    "revenueRange": "2M-8M",
    "ebitdaRange": "200k-1.2M"
  },
  "acquisitionThesis": "comprehensive thesis statement",
  "personalizedBuybox": [
    {
      "criterion": "criterion_name",
      "target": "specific_target_value",
      "rationale": "why this matters"
    }
  ],
  "confidenceScores": {
    "overall": 0.85,
    "archetype": 0.90,
    "industries": 0.80,
    "financial": 0.75
  }
}

Focus on providing actionable, specific recommendations based on the entrepreneur's unique profile and goals.
        `.trim();
    }

    parseGeminiResponse(responseText, userData) {
        try {
            // Extract JSON from the response (handle cases where Gemini includes extra text)
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in Gemini response');
            }
            
            const parsed = JSON.parse(jsonMatch[0]);
            
            // Validate and structure the response
            return {
                operatorArchetype: {
                    type: parsed.operatorArchetype?.type || 'Strategic Builder',
                    confidence: parsed.operatorArchetype?.confidence || 0.8,
                    reasoning: parsed.operatorArchetype?.reasoning || 'AI analysis based on profile data'
                },
                targetIndustries: parsed.targetIndustries || [
                    {
                        industry: 'Technology',
                        priority: 'high',
                        rationale: 'Matches technical background and growth ambitions'
                    }
                ],
                financialParameters: {
                    maxPurchasePrice: parsed.financialParameters?.maxPurchasePrice || 5000000,
                    sdeRange: parsed.financialParameters?.sdeRange || '500k-1.5M',
                    revenueRange: parsed.financialParameters?.revenueRange || '2M-8M',
                    ebitdaRange: parsed.financialParameters?.ebitdaRange || '200k-1.2M'
                },
                acquisitionThesis: parsed.acquisitionThesis || 'AI-generated acquisition strategy based on your unique profile and market opportunities.',
                personalizedBuybox: parsed.personalizedBuybox || [
                    {
                        criterion: 'Revenue Range',
                        target: parsed.financialParameters?.revenueRange || '2M-8M',
                        rationale: 'Matches your financial capacity and growth goals'
                    }
                ],
                confidenceScores: {
                    overall: parsed.confidenceScores?.overall || 0.8,
                    archetype: parsed.confidenceScores?.archetype || 0.8,
                    industries: parsed.confidenceScores?.industries || 0.8,
                    financial: parsed.confidenceScores?.financial || 0.8
                },
                aiEngine: 'Google Gemini',
                analysisTimestamp: new Date().toISOString(),
                rawResponse: responseText
            };
        } catch (error) {
            console.error('Error parsing Gemini response:', error);
            // Return a fallback response
            return {
                operatorArchetype: {
                    type: 'Strategic Builder',
                    confidence: 0.7,
                    reasoning: 'Fallback analysis due to parsing error'
                },
                targetIndustries: [
                    {
                        industry: 'Technology',
                        priority: 'high',
                        rationale: 'General recommendation based on profile'
                    }
                ],
                financialParameters: {
                    maxPurchasePrice: 5000000,
                    sdeRange: '500k-1.5M',
                    revenueRange: '2M-8M',
                    ebitdaRange: '200k-1.2M'
                },
                acquisitionThesis: 'AI-generated acquisition strategy based on your profile. Please review and adjust as needed.',
                personalizedBuybox: [
                    {
                        criterion: 'Revenue Range',
                        target: '2M-8M',
                        rationale: 'Matches your financial capacity'
                    }
                ],
                confidenceScores: {
                    overall: 0.7,
                    archetype: 0.7,
                    industries: 0.7,
                    financial: 0.7
                },
                aiEngine: 'Google Gemini',
                analysisTimestamp: new Date().toISOString(),
                rawResponse: responseText,
                error: 'Response parsing failed, using fallback analysis'
            };
        }
    }
}

module.exports = GeminiAnalysisEngine;
