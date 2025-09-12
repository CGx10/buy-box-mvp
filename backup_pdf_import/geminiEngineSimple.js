const { GoogleGenerativeAI } = require('@google/generative-ai');
const METHODOLOGIES = require('../methodologies');

class GeminiAnalysisEngine {
    constructor() {
        this.name = 'Google Gemini';
        this.available = false;
        
        // Initialize Gemini client if API key is available
        if (process.env.GEMINI_API_KEY && process.env.ENABLE_GEMINI === 'true') {
            try {
                this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                this.available = true;
                console.log('✅ Gemini engine initialized successfully');
            } catch (error) {
                console.error('❌ Failed to initialize Gemini engine:', error.message);
                this.available = false;
            }
        } else {
            console.log('⚠️ Gemini engine not enabled - set GEMINI_API_KEY and ENABLE_GEMINI=true');
        }
    }

    isAvailable() {
        return this.available;
    }

    async processUserData(userData) {
        console.log('Gemini processing user data...');
        console.log('Methodology selected:', userData.analysis_methodology);
        return await this.analyzeUserData(userData);
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
            console.log('Prompt contains "How to Use This Report":', prompt.includes('How to Use This Report'));
            console.log('Prompt contains "How to Use This Report to Create Your Unified Buybox":', prompt.includes('How to Use This Report to Create Your Unified Buybox'));
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
            console.log('Response contains "How to Use This Report":', text.includes('How to Use This Report'));
            console.log('Response contains "How to Use This Report to Create Your Unified Buybox":', text.includes('How to Use This Report to Create Your Unified Buybox'));
            console.log('Raw response:', text);
            
            return this.parseGeminiResponse(text, userData, prompt);
        } catch (error) {
            console.error('Gemini analysis error:', error);
            throw new Error(`Gemini analysis failed: ${error.message}`);
        }
    }

    buildAnalysisPrompt(userData) {
        console.log('🚀🚀🚀 BUILDING SIMPLIFIED PROMPT TEMPLATE v5.0 - SHORT & FOCUSED 🚀🚀🚀');
        
        return `
# AI-Powered Acquisition Advisor - Multi-Framework Analysis

You are an expert M&A advisor. Analyze this entrepreneur's profile using 4 frameworks: Traditional M&A, Hedgehog Concept, SWOT, and Entrepreneurial Orientation.

## ENTREPRENEUR PROFILE
- Sales & Marketing: ${userData.sales_marketing?.rating || 'Not provided'} (${userData.sales_marketing?.evidence || 'None'})
- Operations & Systems: ${userData.operations_systems?.rating || 'Not provided'} (${userData.operations_systems?.evidence || 'None'})
- Finance & Analytics: ${userData.finance_analytics?.rating || 'Not provided'} (${userData.finance_analytics?.evidence || 'None'})
- Team & Culture: ${userData.team_culture?.rating || 'Not provided'} (${userData.team_culture?.evidence || 'None'})
- Product & Technology: ${userData.product_technology?.rating || 'Not provided'} (${userData.product_technology?.evidence || 'None'})
- Motivators: ${userData.top_motivators || 'Not provided'}
- Work-Life Balance: ${userData.ideal_work_life_balance || 'Not provided'}
- Values: ${userData.values_alignment || 'Not provided'}
- Interests: ${userData.interests_topics || 'Not provided'}
- Capital: $${userData.total_liquid_capital || 'Not provided'}
- Loan: $${userData.potential_loan_amount || 'Not provided'}
- Risk: ${userData.risk_tolerance || 'Not provided'}
- Time: ${userData.time_commitment || 'Not provided'}
- Location: ${userData.location_preference || 'Not provided'} ${userData.location_regions ? `(${userData.location_regions})` : ''}
- Revenue Target: ${userData.target_revenue_range || 'Not provided'}
- EBITDA Target: ${userData.target_ebitda_margin || 'Not provided'}
- Valuation: ${userData.preferred_valuation_range || 'Not provided'}
- Ownership: ${userData.ownership_style || 'Not provided'}
- Management: ${userData.management_team_importance || 'Not provided'}

## OUTPUT FORMAT
Generate a Markdown report with these sections in order:

**Part 1: Executive Summary & Strategic Insights**

Our comprehensive analysis reveals two distinct and powerful strategic paths for your acquisition journey, each defined by a clear operator archetype. Understanding these two paths is the key to focusing your search and maximizing your chances of success.

**Understanding Your Archetypes**

**The Efficiency Expert (The Value Unlocker):** The goal of the Efficiency Expert is to find established businesses with strong revenue but inefficient operations and make them better. They unlock hidden value by analyzing systems, cutting waste, improving processes, and optimizing financial structures. This archetype is identified by frameworks like Traditional M&A and SWOT, which prioritize your proven, existing skills and experience in operations and finance.

**The Growth Catalyst (The Scaler):** The goal of the Growth Catalyst is to find businesses with great products but underdeveloped market reach and ignite their growth. They create value by leveraging sales and marketing expertise, building strategic partnerships, and proactively entering new markets. This archetype is identified by frameworks like the Hedgehog Concept and EO, which focus on your passions, proactive nature, and track record of building ventures.

**🚨 CRITICAL: How to Use This Report to Create Your Unified Buybox 🚨**

This dual-archetype profile is a significant strategic advantage. It does not force you to choose one path over the other; instead, it provides a powerful lens for evaluating opportunities. Your ideal acquisition target likely sits at the intersection of these two strategies.

**Use the "Efficiency" frameworks (Traditional M&A, SWOT) to define your floor:** These reports identify the types of stable, cash-flowing businesses you can confidently acquire and improve. Use their criteria to screen for operationally sound opportunities.

**Use the "Growth" frameworks (Hedgehog, EO) to define your ceiling:** These reports identify the industries and business models that align with your passions and offer the most significant upside potential. Use their criteria to screen for exciting, high-growth opportunities.

**Your "Sweet Spot" is the Hybrid:** The ultimate goal is to find a business that meets the core criteria of both archetypes: an established business with inefficient operations (Efficiency Play) that also operates in a high-growth market you are passionate about, with underdeveloped sales and marketing channels (Growth Play). This hybrid target allows you to unlock value on day one through operational improvements while simultaneously positioning the business for massive long-term growth.

**Strategic Implications:** This duality is a significant advantage, meaning you have two viable strategic paths for your acquisition journey. The key is to find opportunities that satisfy both sides of your entrepreneurial DNA - businesses where you can apply both your operational improvement skills and your growth-scaling abilities. The snapshot below summarizes the key financial differences, and the detailed reports that follow will help you build this combined view.

**Part 2: Strategic Snapshot**

| Analysis Framework | Operator Archetype | Size (SDE) Range | Primary Strategic Focus |
|-------------------|-------------------|------------------|------------------------|
| Traditional M&A | Efficiency Expert | $250k - $1M | Unlocking value in established businesses through operational improvements. |
| The Hedgehog Concept | Growth Catalyst | $100k - $500k | Aligning passion and skill to scale a business with high growth potential. |
| SWOT Analysis | Efficiency Expert | $200k - $750k | Leveraging operational strengths to capitalize on market opportunities. |
| Entrepreneurial Orientation | Growth Catalyst | $50k - $250k | Applying innovation and risk-taking to disrupt a market or create new value. |

**Part 3: Detailed Framework Reports**

For each framework, provide:
- Enhanced data integration showing how user data influences the analysis
- Acquisition thesis with <thesis_start> and <thesis_end> markers
- Personalized buybox table with Industries, Business Model, Size (SDE), Profit Margin, Geography, YOUR LEVERAGE, and Red Flags

**Part 4: Final Strategic Considerations**
Synthesize key leverage points and red flags across all frameworks.

**Part 5: AI TRANSPARENCY & METHODOLOGY**
Include confidence assessment, data sources, and limitations.

**CRITICAL: The "How to Use This Report to Create Your Unified Buybox" section MUST appear in Part 1. Do not skip this section.**
        `.trim();
    }

    parseGeminiResponse(responseText, userData, prompt) {
        try {
            // Parse the Markdown response to extract structured data
            const lines = responseText.split('\n');
            let acquisitionThesis = '';
            let personalizedBuybox = [];
            let operatorArchetype = {
                name: 'Strategic Builder',
                title: 'Strategic Builder',
                type: 'Strategic Builder',
                confidence: 0.8,
                reasoning: 'AI analysis based on profile data',
                compositeScore: 4.0,
                evidence: 'AI analysis based on profile data'
            };

            // Extract executive summary (now Part 1: Executive Summary & Strategic Insights)
            const summaryStart = lines.findIndex(line => line.includes('Executive Summary & Strategic Insights') || line.includes('Part 1:'));
            if (summaryStart !== -1) {
                const summaryEnd = lines.findIndex((line, index) => index > summaryStart && (line.includes('Part 2:') || line.includes('Detailed Framework Reports')));
                if (summaryEnd !== -1) {
                    acquisitionThesis = lines.slice(summaryStart + 1, summaryEnd).join('\n').trim();
                }
            }

            // Extract personalized buybox table
            const tableStart = lines.findIndex(line => line.includes('| Criterion') || line.includes('Your Personalized Buybox'));
            if (tableStart !== -1) {
                const tableLines = lines.slice(tableStart);
                for (let i = 1; i < tableLines.length; i++) {
                    const line = tableLines[i].trim();
                    if (line.startsWith('|') && line.includes('|')) {
                        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
                        if (cells.length >= 3) {
                            personalizedBuybox.push({
                                criterion: cells[0],
                                target: cells[1],
                                rationale: cells[2]
                            });
                        }
                    }
                }
            }

            // Extract AI Transparency & Methodology section
            let aiTransparency = '';
            const transparencyStart = lines.findIndex(line => 
                line.includes('AI TRANSPARENCY') || 
                line.includes('**Analysis Methodology:**') || 
                line.includes('Analysis Methodology:')
            );
            if (transparencyStart !== -1) {
                // Take everything from the transparency start to the end of the response
                aiTransparency = lines.slice(transparencyStart).join('\n').trim();
            } else {
                // Fallback: use multi-framework transparency text
                aiTransparency = "This analysis was conducted using a comprehensive multi-framework approach, applying Traditional M&A Analysis, The Hedgehog Concept, SWOT Analysis, and Entrepreneurial Orientation simultaneously. This methodology provides a 360-degree view of the entrepreneur's profile, highlighting both consensus insights and nuanced differences to enable deeper strategic thinking and more informed acquisition decisions.";
            }

            // Extract archetype from thesis
            const archetypeMatch = acquisitionThesis.match(/\*\*(.*?)\*\*/);
            if (archetypeMatch) {
                const archetypeName = archetypeMatch[1];
                operatorArchetype = {
                    name: archetypeName,
                    title: archetypeName,
                    type: archetypeName,
                    confidence: 0.9,
                    reasoning: `Identified as ${archetypeName} based on comprehensive profile analysis`,
                    compositeScore: 4.5,
                    evidence: `Expert analysis of competencies and evidence points to ${archetypeName} archetype`
                };
            }

            // Calculate financial parameters from SDE range in buybox
            let financialParameters = {
                maxPurchasePrice: 5000000,
                sdeRange: "500k-1.5M",
                revenueRange: "2M-8M",
                ebitdaRange: "200k-1.2M"
            };

            const sdeRow = personalizedBuybox.find(row => row.criterion.toLowerCase().includes('size') || row.criterion.toLowerCase().includes('sde'));
            if (sdeRow) {
                financialParameters.sdeRange = sdeRow.target;
            }

            // Extract target industries
            const industriesRow = personalizedBuybox.find(row => row.criterion.toLowerCase().includes('industries'));
            const targetIndustries = industriesRow ? [{
                industry: industriesRow.target,
                priority: 'high',
                rationale: industriesRow.rationale
            }] : [{
                industry: 'Technology',
                priority: 'high',
                rationale: 'Matches technical background and growth ambitions'
            }];

            return {
                operatorArchetype,
                targetIndustries,
                financialParameters,
                acquisitionThesis: acquisitionThesis || 'AI-generated acquisition strategy based on your profile. Please review and adjust as needed.',
                personalizedBuybox: personalizedBuybox.length > 0 ? personalizedBuybox : [
                    {
                        criterion: 'Revenue Range',
                        target: '2M-8M',
                        rationale: 'Matches your financial capacity'
                    }
                ],
                confidenceScores: {
                    overall: 0.9,
                    archetype: 0.9,
                    industries: 0.85,
                    financial: 0.8
                },
                aiTransparency: aiTransparency || 'Transparency data not available',
                analysis_methodology: userData.analysis_methodology || 'hedgehog_concept',
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
                    name: 'Strategic Builder',
                    title: 'Strategic Builder',
                    type: 'Strategic Builder',
                    confidence: 0.7,
                    reasoning: 'Fallback analysis due to parsing error',
                    compositeScore: 3.5,
                    evidence: 'Fallback analysis due to parsing error'
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
                    sdeRange: "500k-1.5M",
                    revenueRange: "2M-8M",
                    ebitdaRange: "200k-1.2M"
                },
                acquisitionThesis: 'Fallback acquisition thesis due to parsing error',
                personalizedBuybox: [
                    {
                        criterion: 'General Business Criteria',
                        target: 'Technology-focused businesses',
                        rationale: 'Fallback recommendation based on profile'
                    }
                ],
                confidenceScores: {
                    overall: 0.7,
                    archetype: 0.7,
                    industries: 0.7,
                    financial: 0.7
                },
                aiTransparency: 'Transparency data not available due to parsing error',
                aiEngine: 'Google Gemini',
                analysisTimestamp: new Date().toISOString(),
                rawResponse: responseText,
                promptUsed: 'Fallback prompt due to parsing error',
                error: 'Response parsing failed, using fallback analysis'
            };
        }
    }

    async getEngineInfo() {
        return {
            name: "Google Gemini",
            type: "Expert M&A Advisor",
            model: "gemini-1.5-flash",
            provider: "Google",
            capabilities: [
                "Expert M&A analysis and strategy",
                "Holistic entrepreneur profiling",
                "Industry-specific recommendations",
                "Financial parameter calculation",
                "Strategic buybox development"
            ],
            requirements: ["Gemini API key", "Internet connectivity"],
            enabled: this.available,
            available: this.available,
            configuration: {
                model: "gemini-1.5-flash",
                apiVersion: "v1beta",
                maxTokens: 8192,
                temperature: 0.7,
                promptMethodology: "Expert M&A Advisor Approach",
                archetypeDetection: "Holistic analysis of competencies and evidence"
            }
        };
    }

    /**
     * Extracts LinkedIn profile data using Gemini
     */
    async extractLinkedInData(systemPrompt, userPrompt) {
        if (!this.available) {
            throw new Error('Gemini engine not available');
        }

        try {
            const prompt = `${systemPrompt}\n\n${userPrompt}`;
            const result = await this.model.generateContent(prompt);

            const response = await result.response;
            const text = response.text();
            
            // Parse the JSON response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No valid JSON found in response');
            }
        } catch (error) {
            console.error('Error extracting LinkedIn data:', error);
            throw error;
        }
    }
}

module.exports = GeminiAnalysisEngine;
