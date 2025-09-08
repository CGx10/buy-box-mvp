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
            available: this.available,
            configuration: {
                model: "gemini-1.5-flash",
                apiVersion: "v1beta",
                maxTokens: 8192,
                temperature: 0.7,
                promptMethodology: "Same as Traditional AI (Multi-Factor Scoring)",
                archetypeDetection: "Weighted composite scoring with key phrase analysis"
            }
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
            
            // Debug: Log the prompt being sent to Gemini
            console.log('🔍 GEMINI PROMPT DEBUG:');
            console.log('Model:', 'gemini-1.5-flash');
            console.log('Prompt length:', prompt.length, 'characters');
            console.log('Prompt preview (first 500 chars):', prompt.substring(0, 500));
            console.log('User data keys:', Object.keys(userData));
            console.log('Competency data:', {
                sales_marketing: userData.sales_marketing,
                operations_systems: userData.operations_systems,
                finance_analytics: userData.finance_analytics,
                team_culture: userData.team_culture,
                product_technology: userData.product_technology
            });
            
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Debug: Log the raw response from Gemini
            console.log('🔍 GEMINI RESPONSE DEBUG:');
            console.log('Response length:', text.length, 'characters');
            console.log('Raw response:', text);
            
                    return this.parseGeminiResponse(text, userData, prompt);
        } catch (error) {
            console.error('Gemini analysis error:', error);
            throw new Error(`Gemini analysis failed: ${error.message}`);
        }
    }

    buildAnalysisPrompt(userData) {
        return `
You are an expert M&A advisor and business acquisition specialist with 20+ years of experience. Your task is to analyze an entrepreneur's profile and create a personalized acquisition strategy that maximizes their chances of success.

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

YOUR ANALYSIS APPROACH:
As an expert M&A advisor, analyze this entrepreneur's profile holistically. Focus on:

1. **Core Competencies**: Identify their strongest demonstrated capabilities and how they translate to business value
2. **Industry Alignment**: Determine which industries best match their skills, interests, and experience
3. **Financial Realism**: Calculate realistic acquisition parameters based on their capital and risk profile
4. **Value Creation**: Identify specific ways they can add value to acquired businesses
5. **Strategic Fit**: Ensure the acquisition strategy aligns with their goals and constraints

ARCHETYPE FRAMEWORK:
Based on their strongest competencies, categorize them as:
- **The Growth Catalyst**: Sales/marketing strength, customer acquisition focus
- **The Efficiency Expert**: Operations/systems strength, process optimization focus
- **The Visionary Builder**: Product/technology strength, innovation focus
- **The People Leader**: Team/culture strength, leadership focus
- **The Financial Strategist**: Finance/analytics strength, data-driven focus

ANALYSIS REQUIREMENTS:
Provide a comprehensive analysis that includes:
1. Primary archetype identification with clear reasoning
2. 3-5 target industries with specific rationale
3. Realistic financial parameters (SDE range, max purchase price)
4. Strategic acquisition thesis
5. Detailed buybox criteria that focus on value creation opportunities

Please provide your analysis in the following JSON format:
{
  "operatorArchetype": {
    "type": "archetype_name",
    "confidence": 0.85,
    "reasoning": "detailed explanation of why this archetype fits best"
  },
  "targetIndustries": [
    {
      "industry": "industry_name",
      "priority": "high/medium/low",
      "rationale": "specific reasons why this industry aligns with their profile"
    }
  ],
  "financialParameters": {
    "maxPurchasePrice": 5000000,
    "sdeRange": "150k-400k",
    "revenueRange": "1M-3M",
    "ebitdaRange": "100k-300k"
  },
  "acquisitionThesis": "comprehensive 2-3 paragraph thesis explaining their acquisition strategy",
  "personalizedBuybox": [
    {
      "criterion": "criterion_name",
      "target": "specific_target_value",
      "rationale": "why this criterion matters for value creation"
    }
  ],
  "confidenceScores": {
    "overall": 0.85,
    "archetype": 0.90,
    "industries": 0.80,
    "financial": 0.75
  }
}

Focus on providing actionable, strategic recommendations that leverage their unique strengths for maximum acquisition success.
        `.trim();
    }

    parseGeminiResponse(responseText, userData, prompt) {
        try {
            // Extract JSON from the response (handle cases where Gemini includes extra text)
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in Gemini response');
            }
            
            const parsed = JSON.parse(jsonMatch[0]);
            
            // Validate and structure the response
            console.log('🔍 GEMINI PARSING DEBUG:');
            console.log('Parsed response:', parsed);
            console.log('Operator archetype:', parsed.operatorArchetype);
            
            return {
                operatorArchetype: {
                    name: parsed.operatorArchetype?.type || 'Strategic Builder',
                    title: parsed.operatorArchetype?.type || 'Strategic Builder',
                    type: parsed.operatorArchetype?.type || 'Strategic Builder',
                    confidence: parsed.operatorArchetype?.confidence || 0.8,
                    reasoning: parsed.operatorArchetype?.reasoning || 'AI analysis based on profile data',
                    compositeScore: (parsed.operatorArchetype?.confidence || 0.8) * 5, // Convert to 5-point scale
                    evidence: parsed.operatorArchetype?.reasoning || 'AI analysis based on profile data'
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
                acquisitionThesis: parsed.acquisitionThesis || 'No acquisition thesis available from Gemini analysis',
                personalizedBuybox: parsed.personalizedBuybox || [
                    {
                        criterion: 'General Business Criteria',
                        target: 'Technology-focused businesses',
                        rationale: 'Based on AI analysis of your profile'
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
                rawResponse: responseText,
                promptUsed: prompt
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
                promptUsed: 'Fallback prompt due to parsing error',
                error: 'Response parsing failed, using fallback analysis'
            };
        }
    }
}

module.exports = GeminiAnalysisEngine;
