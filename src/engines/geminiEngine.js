const { GoogleGenerativeAI } = require('@google/generative-ai');

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
# AI-Powered Acquisition Advisor

## ROLE & OBJECTIVE
You are an expert Mergers & Acquisitions (M&A) advisor and business strategist. Your task is to analyze the detailed profile of an acquisition entrepreneur. Based on your expert assessment of their skills, passions, and financial standing, you will generate a hyper-personalized "Acquisition Thesis" and a "Personalized Buybox" report.

Your entire analysis must be guided by the "Fit-First" principle: finding the ideal business where this specific entrepreneur's unique strengths can unlock maximum value.

## INPUT DATA
You will be provided with a JSON object containing the entrepreneur's complete profile, structured into three modules:

**Module A: The Operator Profile (5x competency ratings and qualitative evidence)**
- Sales & Marketing Skills: ${userData.sales_marketing?.rating || 'Not provided'} (Evidence: ${userData.sales_marketing?.evidence || 'None'})
- Operations & Systems: ${userData.operations_systems?.rating || 'Not provided'} (Evidence: ${userData.operations_systems?.evidence || 'None'})
- Finance & Analytics: ${userData.finance_analytics?.rating || 'Not provided'} (Evidence: ${userData.finance_analytics?.evidence || 'None'})
- Team & Culture: ${userData.team_culture?.rating || 'Not provided'} (Evidence: ${userData.team_culture?.evidence || 'None'})
- Product & Technology: ${userData.product_technology?.rating || 'Not provided'} (Evidence: ${userData.product_technology?.evidence || 'None'})

**Module B: The Industry Profile (Interests, reading habits, problems to solve, customer affinity)**
- Interests & Topics: ${userData.interests_topics || 'Not provided'}
- Recent Books: ${userData.recent_books || 'Not provided'}
- Problem to Solve: ${userData.problem_to_solve || 'Not provided'}
- Customer Affinity: ${userData.customer_affinity || 'Not provided'}

**Module C: The Lifestyle & Financial Profile (Financials, time, location, risk tolerance)**
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

## CORE ANALYSIS & STRATEGY (Your Process)
Using your expertise as an M&A advisor, perform the following analysis:

**Step 1: Synthesize the Operator Archetype**
Holistically evaluate the ratings and, more importantly, the qualitative evidence in Module A. Identify the entrepreneur's single most dominant strength and classify them into one of these archetypes: "The Growth Catalyst" (Sales/Marketing), "The Efficiency Expert" (Ops/Systems), "The Visionary Builder" (Product/Tech), "The People Leader" (Team/Culture), or "The Financial Strategist" (Finance/Analytics). Briefly explain why you chose this archetype, citing specific evidence from their profile.

**Step 2: Define the Core Leverage**
Based on the identified archetype, determine the corresponding business opportunity. For example, if they are "The Growth Catalyst," their leverage lies in acquiring a business with a great product but poor marketing.

**Step 3: Identify Target Industries**
Analyze the text inputs from Module B (interests, books, problems to solve). Identify 3-5 specific, niche industries or business models that align with their passions and where their operator archetype would be most impactful. Avoid overly broad categories.

**Step 4: Calculate Financial Parameters**
Analyze the financial inputs from Module C. Calculate a realistic target Seller Discretionary Earnings (SDE) range. This calculation must account for the entrepreneur's liquid capital (for a ~10% down payment), their loan potential, and ensure the resulting cash flow can cover both their minimum income requirement and the estimated annual debt service on the loan. If the numbers create an impossible range, use your expertise to suggest a more realistic starting point.

## OUTPUT FORMAT
Your final output MUST be a single Markdown-formatted report containing the following two sections.

**Part 1: Your Acquisition Thesis**
A concise, expert narrative following this template:
"Based on my analysis of your profile, your clear operator archetype is **{Operator Archetype}**. Your greatest strength lies in {description of top competency, citing evidence}. The ideal business for you is one that has achieved product-market fit but is struggling with {corresponding weakness from your leverage analysis}. You are uniquely positioned to unlock value here. Your search should be focused on niche industries such as **{Target Industries}**, which align perfectly with your stated interests in {mention specific interests}."

**Part 2: Your Personalized Buybox**
A Markdown table summarizing your findings. The "Rationale" column should be insightful and directly tie back to the user's data.

| Criterion | Your Target Profile | Rationale |
|-----------|-------------------|----------|
| Industries | {Target Industries} | Aligns with your stated passions for {mention specific interests}. |
| Business Model | Recurring Revenue (Service Contracts, Subscriptions > 60%) | Provides stability and aligns with your stated risk tolerance of {risk_tolerance}. |
| Size (SDE) | {Calculated SDE Range} | A realistic range based on your capital and income needs, ensuring the acquisition is both feasible and profitable for you. |
| Profit Margin | > 20% Net Margin | A key indicator of a healthy, fundamentally sound business with operational efficiency. |
| Geography | {location_preference} | Matches your specified lifestyle requirements. |
| Owner Role | Owner is not the primary operator/technician. | Ensures you are buying a scalable system that can grow beyond a single person's efforts. |
| YOUR LEVERAGE | {Core Leverage}: Look for specific indicators like low web traffic, undeveloped SOPs, or outdated technology. | Your skills as a {Operator Archetype} are the key to unlocking immediate post-acquisition growth. |
| Red Flags | High customer concentration (>20%), declining revenue, owner-dependent operations. | Avoids businesses with existential risks that do not align with your core strengths. |

Focus on providing actionable, specific recommendations based on the entrepreneur's unique profile and goals. Use your expertise as an M&A advisor to deliver insights that go beyond simple data analysis.
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

            // Extract acquisition thesis
            const thesisStart = lines.findIndex(line => line.includes('Your Acquisition Thesis') || line.includes('Part 1:'));
            if (thesisStart !== -1) {
                const thesisEnd = lines.findIndex((line, index) => index > thesisStart && (line.includes('Part 2:') || line.includes('Your Personalized Buybox')));
                if (thesisEnd !== -1) {
                    acquisitionThesis = lines.slice(thesisStart + 1, thesisEnd).join('\n').trim();
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
}

module.exports = GeminiAnalysisEngine;
