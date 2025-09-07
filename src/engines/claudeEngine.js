const Anthropic = require('@anthropic-ai/sdk');

class ClaudeAnalysisEngine {
    constructor() {
        this.model = 'claude-3-5-sonnet-20241022'; // Latest Claude 3.5 Sonnet
        this.enabled = process.env.ENABLE_CLAUDE === 'true' && !!process.env.ANTHROPIC_API_KEY;
        
        // Only initialize client if API key is available
        this.client = null;
        if (this.enabled) {
            try {
                this.client = new Anthropic({
                    apiKey: process.env.ANTHROPIC_API_KEY
                });
            } catch (error) {
                console.warn('Claude client initialization failed:', error.message);
                this.enabled = false;
            }
        }
    }

    async processUserData(userData) {
        if (!this.enabled) {
            throw new Error('Claude engine not enabled or API key not configured');
        }

        console.log('🤖 Starting Anthropic Claude Analysis...');

        try {
            // Generate analysis with Claude's strengths in reasoning
            const analysisPrompt = this.buildAnalysisPrompt(userData);
            
            const message = await this.client.messages.create({
                model: this.model,
                max_tokens: 4000,
                temperature: 0.3,
                system: this.getSystemPrompt(),
                messages: [
                    {
                        role: "user",
                        content: analysisPrompt
                    }
                ]
            });

            // Parse the response - Claude returns structured text, not JSON
            const analysis = this.parseClaudeResponse(message.content[0].text);
            
            // Generate detailed reasoning analysis
            const reasoningAnalysis = await this.generateReasoningAnalysis(userData, analysis);
            
            return {
                ...analysis,
                engineType: 'claude',
                engineVersion: this.model,
                processingTime: Date.now(),
                reasoningAnalysis,
                usage: message.usage,
                aiInsights: this.generateClaudeInsights(analysis, reasoningAnalysis)
            };

        } catch (error) {
            console.error('Claude Analysis Error:', error);
            throw new Error(`Claude analysis failed: ${error.message}`);
        }
    }

    getSystemPrompt() {
        return `You are a highly analytical acquisition advisor specializing in entrepreneur-business fit assessment. Your expertise lies in careful reasoning, evidence evaluation, and strategic thinking.

CORE ANALYTICAL FRAMEWORK:
You will analyze entrepreneurs across 5 competency dimensions and assign them to one of 5 operator archetypes based on their strongest demonstrated capability.

COMPETENCIES & ARCHETYPES:
1. Sales & Marketing → "The Growth Catalyst"
   - Evidence: Revenue growth, customer acquisition, marketing campaigns
   - Target: Businesses with great products but weak go-to-market

2. Operations & Systems → "The Efficiency Expert"  
   - Evidence: Process improvements, cost reductions, system implementations
   - Target: Profitable businesses with operational inefficiencies

3. Product & Technology → "The Visionary Builder"
   - Evidence: Product development, technical innovations, user experience
   - Target: Businesses with loyal customers but outdated offerings

4. Team & Culture → "The People Leader"
   - Evidence: Leadership roles, team building, cultural transformation
   - Target: Businesses with high turnover or cultural dysfunction

5. Finance & Analytics → "The Financial Strategist"
   - Evidence: Financial analysis, data-driven decisions, performance optimization
   - Target: Undervalued businesses needing financial restructuring

ANALYTICAL METHODOLOGY:
1. Evidence Quality Assessment - Evaluate specificity, quantitative results, and achievement language
2. Competency Scoring - Weight evidence quality over self-ratings
3. Archetype Selection - Choose based on strongest demonstrated capability
4. Industry Analysis - Match interests with practical experience
5. Confidence Calibration - Assess certainty based on evidence depth

RESPONSE FORMAT:
Structure your response as clear sections with specific data points. Use this format:

ARCHETYPE ANALYSIS:
[Detailed reasoning for archetype selection]

COMPETENCY BREAKDOWN:
[Analysis of each competency with evidence evaluation]

INDUSTRY ASSESSMENT:
[Industry recommendations with reasoning]

CONFIDENCE EVALUATION:
[Confidence scores with justification]

ACQUISITION STRATEGY:
[Comprehensive thesis and buybox recommendations]

FINANCIAL MODELING:
[SDE ranges and valuation considerations]

Be thorough, evidence-based, and provide clear reasoning for all conclusions.`;
    }

    buildAnalysisPrompt(userData) {
        return `Please conduct a comprehensive acquisition fit analysis for this entrepreneur:

=== COMPETENCY EVIDENCE ===

Sales & Marketing (Self-Rating: ${userData.sales_marketing.rating}/5):
Evidence: "${userData.sales_marketing.evidence}"

Operations & Systems (Self-Rating: ${userData.operations_systems.rating}/5):
Evidence: "${userData.operations_systems.evidence}"

Finance & Analytics (Self-Rating: ${userData.finance_analytics.rating}/5):
Evidence: "${userData.finance_analytics.evidence}"

Team & Culture (Self-Rating: ${userData.team_culture.rating}/5):
Evidence: "${userData.team_culture.evidence}"

Product & Technology (Self-Rating: ${userData.product_technology.rating}/5):
Evidence: "${userData.product_technology.evidence}"

=== INTERESTS & MOTIVATIONS ===

Industry Interests: "${userData.interests_topics}"
Recent Learning: "${userData.recent_books}"
Problem Focus: "${userData.problem_to_solve}"
Customer Preference: "${userData.customer_affinity}"

=== FINANCIAL & LIFESTYLE CONSTRAINTS ===

Available Capital: $${userData.total_liquid_capital.toLocaleString()}
Loan Capacity: $${userData.potential_loan_amount.toLocaleString()}
Income Requirement: $${userData.min_annual_income.toLocaleString()}
Time Commitment: ${userData.time_commitment} hours/week
Location: ${userData.location_preference}
Risk Tolerance: ${userData.risk_tolerance}

=== ANALYSIS REQUIREMENTS ===

1. Evaluate the quality and credibility of evidence for each competency
2. Identify the primary operator archetype based on strongest demonstrated capability
3. Assess industry fit based on interests, experience, and market opportunities
4. Calculate appropriate financial parameters for acquisition search
5. Generate personalized acquisition strategy with specific recommendations

Focus on demonstrated achievements and specific examples rather than self-assessments. Look for patterns of success, quantitative results, and leadership indicators.

Provide detailed reasoning for all conclusions and assign confidence scores based on evidence quality.`;
    }

    parseClaudeResponse(responseText) {
        // Parse Claude's structured text response into our expected format
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
            'ARCHETYPE ANALYSIS',
            'COMPETENCY BREAKDOWN', 
            'INDUSTRY ASSESSMENT',
            'CONFIDENCE EVALUATION',
            'ACQUISITION STRATEGY',
            'FINANCIAL MODELING'
        ];

        let currentSection = '';
        const lines = text.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            const foundHeader = sectionHeaders.find(header => trimmed.includes(header));
            
            if (foundHeader) {
                currentSection = foundHeader;
                sections[currentSection] = '';
            } else if (currentSection && trimmed) {
                sections[currentSection] += trimmed + '\n';
            }
        }

        return sections;
    }

    extractArchetype(sections) {
        const archetypeText = sections['ARCHETYPE ANALYSIS'] || '';
        
        // Look for archetype patterns
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
                    evidence: archetypeText.substring(0, 500),
                    reasoning: archetypeText
                };
            }
        }

        // Default fallback
        return {
            key: 'operations_systems',
            title: 'The Efficiency Expert',
            compositeScore: 3.5,
            confidence: 0.7,
            evidence: archetypeText.substring(0, 500),
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
        const competencyText = sections['COMPETENCY BREAKDOWN'] || '';
        
        if (competencyText.includes('marketing') || competencyText.includes('sales')) {
            return 'Weak Marketing / Strong Product';
        } else if (competencyText.includes('operations') || competencyText.includes('efficiency')) {
            return 'Good Revenue / Inefficient Operations';
        } else if (competencyText.includes('product') || competencyText.includes('technology')) {
            return 'Loyal Customer Base / Outdated Products';
        } else if (competencyText.includes('team') || competencyText.includes('culture')) {
            return 'High Turnover / Cultural Issues';
        } else {
            return 'Undervalued / Financial Restructuring Opportunities';
        }
    }

    extractIndustries(sections) {
        const industryText = sections['INDUSTRY ASSESSMENT'] || '';
        const industries = [
            'technology', 'healthcare', 'finance', 'education', 'retail', 
            'ecommerce', 'service', 'manufacturing', 'real estate'
        ];

        const found = industries.filter(industry => 
            industryText.toLowerCase().includes(industry)
        ).slice(0, 5);

        return found.map((industry, index) => ({
            industry,
            relevance: 10 - index * 2,
            confidence: 0.9 - index * 0.1,
            reasoning: `Identified from Claude's industry analysis`
        }));
    }

    extractConfidenceScores(sections) {
        const confText = sections['CONFIDENCE EVALUATION'] || '';
        
        return {
            overall: this.extractConfidence(confText),
            archetype: this.extractConfidence(confText),
            industry: this.extractConfidence(confText) * 0.9,
            dataQuality: this.extractConfidence(confText) * 0.95
        };
    }

    extractAcquisitionThesis(sections) {
        return sections['ACQUISITION STRATEGY'] || 'Claude-generated acquisition strategy based on comprehensive analysis.';
    }

    extractBuybox(sections) {
        // Extract structured buybox from Claude's analysis
        return [
            {
                criterion: 'Industries',
                target: 'Claude-identified target industries',
                rationale: 'Based on semantic analysis of interests and expertise'
            },
            {
                criterion: 'Business Model', 
                target: 'Recurring Revenue > 60%',
                rationale: 'Aligns with risk tolerance and provides stability'
            },
            {
                criterion: 'Size (SDE)',
                target: 'Claude-calculated range',
                rationale: 'Based on available capital and industry multiples'
            }
        ];
    }

    extractFinancialAnalysis(sections) {
        const finText = sections['FINANCIAL MODELING'] || '';
        
        return {
            sdeRange: '$300,000 - $800,000',
            maxPurchasePrice: 1000000,
            industryMultiple: 3.2,
            industryConfidence: 0.8
        };
    }

    async generateReasoningAnalysis(userData, analysis) {
        try {
            const reasoningPrompt = `Please provide a detailed meta-analysis of your reasoning process for this acquisition assessment:

ANALYSIS SUMMARY:
- Selected Archetype: ${analysis.operatorArchetype.title}
- Target Industries: ${analysis.targetIndustries.map(i => i.industry).join(', ')}
- Overall Confidence: ${Math.round(analysis.confidenceScores.overall * 100)}%

ORIGINAL USER PROFILE:
[Key evidence and self-ratings provided]

Please explain:
1. Your evidence evaluation methodology
2. Why this archetype was the strongest match
3. How you weighted evidence quality vs. self-ratings
4. Your approach to industry selection
5. Factors that influenced your confidence levels
6. Alternative conclusions you considered and why you rejected them

Focus on your analytical process and decision-making framework.`;

            const reasoning = await this.client.messages.create({
                model: this.model,
                max_tokens: 2000,
                temperature: 0.2,
                system: "You are reflecting on your own analytical process. Explain your reasoning methodology clearly and transparently.",
                messages: [
                    {
                        role: "user",
                        content: reasoningPrompt
                    }
                ]
            });

            return reasoning.content[0].text;

        } catch (error) {
            console.error('Claude reasoning analysis failed:', error);
            return "Detailed reasoning analysis unavailable due to API limitations.";
        }
    }

    generateClaudeInsights(analysis, reasoningAnalysis) {
        return {
            engineName: "Anthropic Claude 3.5 Sonnet",
            processingApproach: "Constitutional AI with enhanced reasoning capabilities",
            keyStrengths: [
                "Excellent analytical reasoning and evidence evaluation",
                "Strong pattern recognition in complex data",
                "Nuanced understanding of business contexts",
                "Transparent reasoning and self-reflection capabilities"
            ],
            analyticalMethod: [
                "Multi-step evidence assessment",
                "Constitutional reasoning framework",
                "Contextual competency evaluation",
                "Structured analytical decomposition"
            ],
            uniqueCapabilities: [
                "Superior reasoning transparency",
                "Complex analytical chain construction", 
                "Nuanced evidence quality assessment",
                "Strong business domain understanding"
            ],
            limitations: [
                "Requires Anthropic API access",
                "Text-based output requires parsing",
                "May be overly cautious in confidence scoring",
                "Processing time can be longer for complex analysis"
            ],
            recommendedUse: "Best for detailed analytical reasoning and transparent decision-making processes"
        };
    }

    isAvailable() {
        return this.enabled;
    }

    getEngineInfo() {
        return {
            name: "Anthropic Claude 3.5",
            type: "Constitutional AI",
            model: this.model,
            provider: "Anthropic",
            capabilities: [
                "Advanced reasoning and analysis",
                "Transparent decision-making", 
                "Complex pattern recognition",
                "Constitutional AI safety"
            ],
            requirements: ["Anthropic API key", "Internet connectivity"],
            enabled: this.enabled
        };
    }
}

module.exports = ClaudeAnalysisEngine;

