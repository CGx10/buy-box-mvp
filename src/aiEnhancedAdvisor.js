const natural = require('natural');
const compromise = require('compromise');
const Sentiment = require('sentiment');
const vaderSentiment = require('vader-sentiment');
const keyword = require('keyword-extractor');
const { Matrix } = require('ml-matrix');
const AITransparencyEngine = require('./aiTransparency');

class AIEnhancedAcquisitionAdvisor {
    constructor() {
        // Initialize AI components
        this.sentiment = new Sentiment();
        this.tokenizer = new natural.WordTokenizer();
        this.stemmer = natural.PorterStemmer;
        this.tfidf = new natural.TfIdf();
        this.transparencyEngine = new AITransparencyEngine();
        
        // Enhanced industry knowledge base with semantic vectors
        this.industrySemantics = this.buildIndustrySemantics();
        
        // Enhanced archetype mappings with AI scoring
        this.archetypeMap = {
            'sales_marketing': {
                title: 'The Growth Catalyst',
                leverage: 'Weak Marketing / Strong Product',
                keyPhrases: ['revenue', 'growth', 'customers', 'marketing', 'sales', 'acquisition', 'conversion', 'funnel', 'leads', 'campaigns'],
                sentimentWeight: 0.3
            },
            'operations_systems': {
                title: 'The Efficiency Expert',
                leverage: 'Good Revenue / Inefficient Operations',
                keyPhrases: ['efficiency', 'process', 'systems', 'automation', 'workflow', 'optimization', 'streamline', 'cost reduction', 'scalability', 'operations'],
                sentimentWeight: 0.2
            },
            'product_technology': {
                title: 'The Visionary Builder',
                leverage: 'Loyal Customer Base / Outdated Products',
                keyPhrases: ['innovation', 'technology', 'product', 'development', 'features', 'technical', 'software', 'platform', 'architecture', 'engineering'],
                sentimentWeight: 0.4
            },
            'team_culture': {
                title: 'The People Leader',
                leverage: 'High Turnover / Cultural Issues',
                keyPhrases: ['leadership', 'team', 'culture', 'people', 'management', 'collaboration', 'mentoring', 'hiring', 'retention', 'motivation'],
                sentimentWeight: 0.5
            },
            'finance_analytics': {
                title: 'The Financial Strategist',
                leverage: 'Undervalued / Financial Restructuring Opportunities',
                keyPhrases: ['financial', 'analytics', 'data', 'metrics', 'roi', 'profit', 'budget', 'forecasting', 'analysis', 'strategy'],
                sentimentWeight: 0.2
            }
        };

        // Industry SDE multiples with confidence scoring
        this.industryMultiples = {
            'technology': { multiple: 4.5, confidence: 0.85 },
            'saas': { multiple: 5.0, confidence: 0.90 },
            'healthcare': { multiple: 3.2, confidence: 0.80 },
            'finance': { multiple: 3.8, confidence: 0.75 },
            'education': { multiple: 2.8, confidence: 0.70 },
            'retail': { multiple: 2.8, confidence: 0.85 },
            'ecommerce': { multiple: 3.5, confidence: 0.80 },
            'service': { multiple: 2.5, confidence: 0.90 },
            'manufacturing': { multiple: 2.0, confidence: 0.85 },
            'real_estate': { multiple: 2.3, confidence: 0.75 },
            'default': { multiple: 3.0, confidence: 0.60 }
        };
    }

    buildIndustrySemantics() {
        return {
            'technology': {
                primary: ['tech', 'software', 'ai', 'digital', 'platform', 'saas', 'app', 'system', 'code', 'development'],
                secondary: ['innovation', 'startup', 'disrupt', 'automation', 'cloud', 'data', 'algorithm', 'api'],
                context: ['scale', 'growth', 'venture', 'silicon', 'technical', 'engineering', 'product']
            },
            'healthcare': {
                primary: ['health', 'medical', 'wellness', 'fitness', 'therapy', 'care', 'hospital', 'clinic', 'patient'],
                secondary: ['treatment', 'diagnosis', 'medicine', 'pharmaceutical', 'doctor', 'nurse', 'telehealth'],
                context: ['outcome', 'quality', 'safety', 'compliance', 'regulation', 'insurance']
            },
            'finance': {
                primary: ['finance', 'financial', 'money', 'investment', 'banking', 'accounting', 'credit', 'loan'],
                secondary: ['wealth', 'portfolio', 'trading', 'market', 'capital', 'fund', 'asset', 'risk'],
                context: ['regulation', 'compliance', 'audit', 'strategy', 'advisory', 'planning']
            },
            'education': {
                primary: ['education', 'learning', 'teaching', 'training', 'school', 'university', 'course', 'student'],
                secondary: ['curriculum', 'instructor', 'knowledge', 'skill', 'development', 'certification'],
                context: ['online', 'remote', 'assessment', 'accreditation', 'outcome', 'engagement']
            },
            'retail': {
                primary: ['retail', 'shopping', 'consumer', 'store', 'merchandise', 'brand', 'customer', 'sales'],
                secondary: ['inventory', 'supply', 'logistics', 'distribution', 'wholesale', 'vendor'],
                context: ['experience', 'loyalty', 'omnichannel', 'seasonal', 'trend', 'margin']
            },
            'ecommerce': {
                primary: ['ecommerce', 'online', 'marketplace', 'digital', 'website', 'platform', 'cart', 'checkout'],
                secondary: ['fulfillment', 'shipping', 'payment', 'conversion', 'traffic', 'seo'],
                context: ['growth', 'acquisition', 'retention', 'automation', 'analytics', 'optimization']
            },
            'service': {
                primary: ['service', 'consulting', 'professional', 'agency', 'support', 'client', 'project'],
                secondary: ['expertise', 'advisory', 'implementation', 'strategy', 'solution', 'delivery'],
                context: ['relationship', 'quality', 'efficiency', 'scalability', 'expertise', 'value']
            },
            'manufacturing': {
                primary: ['manufacturing', 'production', 'factory', 'industrial', 'supply', 'equipment', 'machinery'],
                secondary: ['quality', 'efficiency', 'automation', 'lean', 'safety', 'compliance'],
                context: ['capacity', 'output', 'waste', 'maintenance', 'logistics', 'standards']
            },
            'real_estate': {
                primary: ['real estate', 'property', 'housing', 'construction', 'development', 'commercial', 'residential'],
                secondary: ['investment', 'management', 'leasing', 'valuation', 'market', 'location'],
                context: ['appreciation', 'yield', 'occupancy', 'maintenance', 'regulation', 'zoning']
            }
        };
    }

    validateInput(userData) {
        const errors = [];

        // Module A validation
        const requiredCompetencies = ['sales_marketing', 'operations_systems', 'finance_analytics', 'team_culture', 'product_technology'];
        for (const comp of requiredCompetencies) {
            if (!userData[comp] || !userData[comp].rating || !userData[comp].evidence) {
                errors.push(`Missing ${comp} rating or evidence`);
            } else if (userData[comp].evidence.length < 200) {
                errors.push(`${comp} evidence must be at least 200 characters`);
            }
        }

        // Module B validation
        if (!userData.interests_topics || userData.interests_topics.length < 10) {
            errors.push('Interests and topics must be at least 10 characters');
        }
        if (!userData.recent_books || userData.recent_books.length < 10) {
            errors.push('Recent books field must be at least 10 characters');
        }
        if (!userData.problem_to_solve || userData.problem_to_solve.length < 10) {
            errors.push('Problem to solve must be at least 10 characters');
        }
        if (!userData.customer_affinity) {
            errors.push('Customer affinity selection is required');
        }

        // Module C validation
        if (!userData.total_liquid_capital || userData.total_liquid_capital < 0) {
            errors.push('Valid total liquid capital is required');
        }
        if (!userData.potential_loan_amount || userData.potential_loan_amount < 0) {
            errors.push('Valid potential loan amount is required');
        }
        if (!userData.min_annual_income || userData.min_annual_income < 0) {
            errors.push('Valid minimum annual income is required');
        }
        if (!userData.time_commitment || userData.time_commitment < 10 || userData.time_commitment > 80) {
            errors.push('Time commitment must be between 10-80 hours per week');
        }
        if (!userData.location_preference) {
            errors.push('Location preference is required');
        }
        if (!userData.risk_tolerance) {
            errors.push('Risk tolerance is required');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    async processUserData(userData) {
        console.log('🤖 Starting AI-Enhanced Analysis...');
        
        // Phase 2: Enhanced AI Synthesis & Strategy
        
        // Step 2.1: AI-Powered Persona Synthesis
        const operatorArchetype = await this.determineOperatorArchetypeAI(userData);
        
        // Step 2.2: Enhanced Opportunity Mapping
        const leverageThesis = this.archetypeMap[operatorArchetype.key].leverage;
        
        // Step 2.3: Semantic Industry Analysis
        const targetIndustries = await this.analyzeIndustriesAI(userData);
        
        // Step 2.4: Enhanced Financial Parameter Calculation
        const financialAnalysis = this.calculateFinancialParametersAI(userData, targetIndustries);
        
        // Step 2.5: AI Confidence Scoring
        const confidenceScores = this.calculateConfidenceScores(operatorArchetype, targetIndustries, userData);
        
        // Phase 3: Enhanced Report Generation
        const acquisitionThesis = this.generateEnhancedAcquisitionThesis({
            operatorArchetype,
            leverageThesis,
            targetIndustries,
            confidenceScores,
            userData
        });
        
        const personalizedBuybox = this.generateEnhancedPersonalizedBuybox({
            targetIndustries,
            leverageThesis,
            operatorArchetype,
            financialAnalysis,
            confidenceScores,
            userData
        });

        // Generate transparency report
        const transparencyReport = this.transparencyEngine.generateTransparencyReport({
            operatorArchetype,
            targetIndustries,
            confidenceScores,
            userData
        });

        return {
            operatorArchetype,
            leverageThesis,
            targetIndustries,
            financialAnalysis,
            confidenceScores,
            acquisitionThesis,
            personalizedBuybox,
            aiInsights: this.generateAIInsights(operatorArchetype, targetIndustries, confidenceScores),
            transparencyReport
        };
    }

    async determineOperatorArchetypeAI(userData) {
        const competencies = ['sales_marketing', 'operations_systems', 'finance_analytics', 'team_culture', 'product_technology'];
        const scores = {};

        for (const competency of competencies) {
            const rating = userData[competency].rating;
            const evidence = userData[competency].evidence;
            
            // Enhanced scoring with multiple AI techniques
            const sentimentScore = this.analyzeSentiment(evidence);
            const keywordScore = this.analyzeKeywords(evidence, competency);
            const confidenceScore = this.analyzeConfidence(evidence);
            const depthScore = this.analyzeDepth(evidence);
            
            // Weighted composite score
            const compositeScore = (
                rating * 0.3 +
                sentimentScore * 0.2 +
                keywordScore * 0.3 +
                confidenceScore * 0.1 +
                depthScore * 0.1
            );
            
            scores[competency] = {
                rating: rating,
                compositeScore: compositeScore,
                sentiment: sentimentScore,
                keywords: keywordScore,
                confidence: confidenceScore,
                depth: depthScore,
                evidence: evidence
            };
        }

        // Find the highest composite score
        let topCompetency = '';
        let maxScore = 0;
        
        for (const [key, data] of Object.entries(scores)) {
            if (data.compositeScore > maxScore) {
                maxScore = data.compositeScore;
                topCompetency = key;
            }
        }

        return {
            key: topCompetency,
            title: this.archetypeMap[topCompetency].title,
            compositeScore: maxScore,
            allScores: scores,
            evidence: userData[topCompetency].evidence,
            confidence: scores[topCompetency].confidence
        };
    }

    analyzeSentiment(text) {
        // Use multiple sentiment analysis approaches
        const basicSentiment = this.sentiment.analyze(text);
        const vaderAnalysis = vaderSentiment.SentimentIntensityAnalyzer.polarity_scores(text);
        
        // Normalize scores to 1-5 range
        const basicScore = Math.max(1, Math.min(5, 3 + basicSentiment.comparative * 2));
        const vaderScore = Math.max(1, Math.min(5, 3 + vaderAnalysis.compound * 2));
        
        // Return weighted average
        return (basicScore * 0.6 + vaderScore * 0.4);
    }

    analyzeKeywords(text, competency) {
        const extractedKeywords = keyword.extract(text, {
            language: 'english',
            remove_digits: true,
            return_changed_case: true,
            remove_duplicates: true
        });
        
        const relevantPhrases = this.archetypeMap[competency].keyPhrases;
        let matchCount = 0;
        
        for (const phrase of relevantPhrases) {
            if (extractedKeywords.some(keyword => 
                keyword.includes(phrase.toLowerCase()) || 
                phrase.toLowerCase().includes(keyword)
            )) {
                matchCount++;
            }
        }
        
        // Score based on keyword relevance (1-5 scale)
        return Math.min(5, 1 + (matchCount / relevantPhrases.length) * 4);
    }

    analyzeConfidence(text) {
        // Look for confidence indicators in the text
        const confidenceIndicators = {
            high: ['successfully', 'achieved', 'led', 'increased', 'improved', 'delivered', 'exceeded', 'won', 'built', 'created'],
            medium: ['helped', 'contributed', 'participated', 'involved', 'worked', 'supported', 'assisted'],
            low: ['tried', 'attempted', 'learning', 'studying', 'interested', 'hope', 'plan', 'want']
        };
        
        const words = text.toLowerCase().split(/\s+/);
        let score = 3; // baseline
        
        for (const word of words) {
            if (confidenceIndicators.high.includes(word)) score += 0.3;
            else if (confidenceIndicators.medium.includes(word)) score += 0.1;
            else if (confidenceIndicators.low.includes(word)) score -= 0.2;
        }
        
        return Math.max(1, Math.min(5, score));
    }

    analyzeDepth(text) {
        // Analyze depth based on specificity and detail
        const sentences = text.split(/[.!?]+/).filter(s => s.length > 10);
        const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
        const specificityWords = ['specifically', 'particularly', 'exactly', 'precisely', 'detailed', 'comprehensive', 'thorough'];
        
        let specificityCount = 0;
        for (const word of specificityWords) {
            if (text.toLowerCase().includes(word)) specificityCount++;
        }
        
        // Score based on detail and specificity
        const lengthScore = Math.min(3, avgSentenceLength / 50);
        const specificityScore = Math.min(2, specificityCount * 0.5);
        
        return Math.max(1, lengthScore + specificityScore);
    }

    async analyzeIndustriesAI(userData) {
        // Combine all text inputs for enhanced NLP analysis
        const textInputs = [
            userData.interests_topics,
            userData.recent_books,
            userData.problem_to_solve
        ].join(' ');

        // Extract entities and themes using multiple techniques
        const doc = compromise(textInputs);
        const topics = doc.topics().out('array');
        const nouns = doc.nouns().out('array');
        const extractedKeywords = keyword.extract(textInputs, {
            language: 'english',
            remove_digits: true,
            return_changed_case: true,
            remove_duplicates: true
        });

        const allTerms = [...topics, ...nouns, ...extractedKeywords].map(term => term.toLowerCase());
        
        // Enhanced industry detection with semantic similarity
        const industryScores = {};
        
        for (const [industry, semantics] of Object.entries(this.industrySemantics)) {
            let score = 0;
            
            // Primary keyword matches (high weight)
            for (const keyword of semantics.primary) {
                if (allTerms.some(term => term.includes(keyword) || keyword.includes(term))) {
                    score += 3;
                }
            }
            
            // Secondary keyword matches (medium weight)
            for (const keyword of semantics.secondary) {
                if (allTerms.some(term => term.includes(keyword) || keyword.includes(term))) {
                    score += 2;
                }
            }
            
            // Context keyword matches (low weight)
            for (const keyword of semantics.context) {
                if (allTerms.some(term => term.includes(keyword) || keyword.includes(term))) {
                    score += 1;
                }
            }
            
            if (score > 0) {
                industryScores[industry] = score;
            }
        }

        // Sort by relevance and return top industries with confidence
        const sortedIndustries = Object.entries(industryScores)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([industry, score]) => ({
                industry,
                relevance: score,
                confidence: Math.min(1, score / 10)
            }));

        return sortedIndustries.length > 0 ? sortedIndustries : [{ industry: 'service', relevance: 1, confidence: 0.3 }];
    }

    calculateFinancialParametersAI(userData, targetIndustries) {
        const totalLiquidCapital = parseFloat(userData.total_liquid_capital);
        const potentialLoanAmount = parseFloat(userData.potential_loan_amount);
        const minAnnualIncome = parseFloat(userData.min_annual_income);

        // Enhanced financial modeling with industry-specific multiples
        let weightedMultiple = 0;
        let totalWeight = 0;
        
        for (const industryData of targetIndustries) {
            const industry = industryData.industry;
            const weight = industryData.confidence;
            const multiple = this.industryMultiples[industry]?.multiple || this.industryMultiples.default.multiple;
            
            weightedMultiple += multiple * weight;
            totalWeight += weight;
        }
        
        const finalMultiple = totalWeight > 0 ? weightedMultiple / totalWeight : this.industryMultiples.default.multiple;

        // Calculate max purchase price (10% equity injection for SBA loan)
        const maxPurchasePrice = totalLiquidCapital / 0.10;

        // Calculate SDE range using industry-weighted multiple
        let sdeMin = totalLiquidCapital * 2.0;
        const sdeMax = maxPurchasePrice / finalMultiple;

        // Enhanced validation check for minimum income requirements
        const estimatedDebtService = potentialLoanAmount * 0.15;
        const requiredSDE = minAnnualIncome + estimatedDebtService;
        
        if (sdeMin < requiredSDE) {
            sdeMin = requiredSDE;
        }

        return {
            maxPurchasePrice: maxPurchasePrice,
            sdeRange: `$${Math.round(sdeMin).toLocaleString()} - $${Math.round(sdeMax).toLocaleString()}`,
            sdeMin: sdeMin,
            sdeMax: sdeMax,
            totalLiquidCapital: totalLiquidCapital,
            potentialLoanAmount: potentialLoanAmount,
            industryMultiple: finalMultiple,
            industryConfidence: totalWeight / targetIndustries.length
        };
    }

    calculateConfidenceScores(operatorArchetype, targetIndustries, userData) {
        // Calculate overall confidence in the analysis
        const archetypeConfidence = operatorArchetype.confidence;
        const industryConfidence = targetIndustries.reduce((sum, ind) => sum + ind.confidence, 0) / targetIndustries.length;
        
        // Factor in data quality
        const dataQuality = this.assessDataQuality(userData);
        
        return {
            overall: (archetypeConfidence * 0.4 + industryConfidence * 0.4 + dataQuality * 0.2),
            archetype: archetypeConfidence,
            industry: industryConfidence,
            dataQuality: dataQuality
        };
    }

    assessDataQuality(userData) {
        let qualityScore = 0;
        let maxScore = 0;

        // Assess completeness and quality of evidence
        const competencies = ['sales_marketing', 'operations_systems', 'finance_analytics', 'team_culture', 'product_technology'];
        for (const comp of competencies) {
            const evidence = userData[comp].evidence;
            maxScore += 1;
            
            if (evidence.length >= 300) qualityScore += 0.3;
            if (evidence.length >= 200) qualityScore += 0.2;
            
            // Check for specific examples
            if (evidence.includes('$') || /\d+%/.test(evidence)) qualityScore += 0.2;
            if (evidence.toLowerCase().includes('result') || evidence.toLowerCase().includes('outcome')) qualityScore += 0.2;
            if (evidence.split('.').length > 3) qualityScore += 0.1; // Multiple sentences
        }

        return Math.min(1, qualityScore / maxScore);
    }

    generateEnhancedAcquisitionThesis({ operatorArchetype, leverageThesis, targetIndustries, confidenceScores, userData }) {
        const topCompetencyDescription = this.getCompetencyDescription(operatorArchetype.key);
        const industriesText = targetIndustries.map(ind => ind.industry).join(', ') || 'businesses that align with your interests';
        const confidenceLevel = confidenceScores.overall > 0.8 ? 'high' : confidenceScores.overall > 0.6 ? 'medium' : 'moderate';

        return `Based on our AI analysis with ${confidenceLevel} confidence (${Math.round(confidenceScores.overall * 100)}%), you are a **${operatorArchetype.title}**. Your greatest strength lies in ${topCompetencyDescription}, as evidenced by your ${operatorArchetype.compositeScore.toFixed(1)}/5.0 composite expertise score.

The ideal business for you is one that has already achieved product-market fit but has stagnated due to ${leverageThesis.toLowerCase()}. Our AI identified ${targetIndustries.length} priority industries where your skills would create maximum value: ${industriesText}. These sectors show strong alignment with your demonstrated interests and expertise (industry confidence: ${Math.round(confidenceScores.industry * 100)}%).

Your acquisition strategy should focus on the "fit-first" approach, targeting businesses where your unique ${operatorArchetype.title} capabilities can unlock immediate value. The AI analysis suggests you're particularly well-suited for businesses requiring ${this.getSpecificValueAdd(operatorArchetype.key)}, giving you a distinct competitive advantage in the acquisition process.`;
    }

    getCompetencyDescription(competencyKey) {
        const descriptions = {
            'sales_marketing': 'driving revenue growth, customer acquisition, and market expansion through strategic sales and marketing initiatives',
            'operations_systems': 'streamlining processes, improving efficiency, and building scalable operational systems that reduce costs and increase productivity',
            'finance_analytics': 'financial analysis, strategic planning, and data-driven decision making that optimizes profitability and growth',
            'team_culture': 'building high-performing teams, developing talent, and creating positive organizational cultures that drive employee engagement and retention',
            'product_technology': 'product development, technological innovation, and digital transformation that keeps businesses competitive and relevant'
        };
        return descriptions[competencyKey] || 'business operations and strategic management';
    }

    getSpecificValueAdd(competencyKey) {
        const valueAdds = {
            'sales_marketing': 'revenue acceleration, customer acquisition optimization, and market expansion strategies',
            'operations_systems': 'process optimization, cost reduction, and scalability improvements',
            'finance_analytics': 'financial restructuring, performance analytics, and strategic planning',
            'team_culture': 'cultural transformation, talent development, and organizational effectiveness',
            'product_technology': 'digital transformation, product innovation, and technical modernization'
        };
        return valueAdds[competencyKey] || 'operational improvements';
    }

    generateEnhancedPersonalizedBuybox({ targetIndustries, leverageThesis, operatorArchetype, financialAnalysis, confidenceScores, userData }) {
        const industriesText = targetIndustries.map(ind => `${ind.industry} (${Math.round(ind.confidence * 100)}% match)`).join(', ');
        const multipleRange = `${(financialAnalysis.industryMultiple * 0.8).toFixed(1)}x - ${(financialAnalysis.industryMultiple * 1.2).toFixed(1)}x`;
        
        return [
            {
                criterion: 'Industries',
                target: industriesText,
                rationale: `AI-identified sectors with ${Math.round(confidenceScores.industry * 100)}% confidence based on your interests and expertise.`
            },
            {
                criterion: 'Business Model',
                target: 'Recurring Revenue > 60%, Predictable Cash Flow',
                rationale: `Aligns with your ${userData.risk_tolerance} risk tolerance and provides stability for implementing your ${operatorArchetype.title} strategies.`
            },
            {
                criterion: 'Size (SDE)',
                target: financialAnalysis.sdeRange,
                rationale: `Calculated using industry-weighted multiple of ${financialAnalysis.industryMultiple.toFixed(1)}x based on your $${financialAnalysis.totalLiquidCapital.toLocaleString()} capital.`
            },
            {
                criterion: 'Valuation Multiple',
                target: `${multipleRange} SDE Multiple`,
                rationale: `Industry-specific range with ${Math.round(financialAnalysis.industryConfidence * 100)}% confidence based on target sectors.`
            },
            {
                criterion: 'Profit Margin',
                target: '> 20% Net Margin, Healthy Unit Economics',
                rationale: 'Indicates operational efficiency and provides room for your value-creation initiatives.'
            },
            {
                criterion: 'Geography',
                target: userData.location_preference === 'fully_remote' ? 'Location Agnostic' : userData.location_preference,
                rationale: `Matches your ${userData.time_commitment}hr/week commitment and lifestyle preferences.`
            },
            {
                criterion: 'Owner Role',
                target: 'Owner working IN vs ON the business',
                rationale: 'Ensures you\'re acquiring scalable systems, not just purchasing a job for yourself.'
            },
            {
                criterion: 'Team Structure',
                target: 'Key managers in place, documented processes',
                rationale: `Critical for smooth transition and implementing your ${operatorArchetype.title} improvements.`
            },
            {
                criterion: 'YOUR AI-IDENTIFIED LEVERAGE',
                target: `${leverageThesis}: Target specific gaps like ${this.getSpecificIndicators(operatorArchetype.key)}`,
                rationale: `AI analysis shows ${Math.round(operatorArchetype.compositeScore * 20)}% strength match - your expertise directly addresses these deficiencies.`
            },
            {
                criterion: 'AI Risk Factors',
                target: 'Customer concentration >25%, declining 3-yr revenue, outdated systems, cultural issues',
                rationale: `Avoid businesses with existential risks that fall outside your ${operatorArchetype.title} competency zone.`
            }
        ];
    }

    getSpecificIndicators(competencyKey) {
        const indicators = {
            'sales_marketing': 'low website traffic, poor conversion rates, no CRM system, weak brand presence',
            'operations_systems': 'manual processes, high error rates, poor inventory management, cost inefficiencies',
            'finance_analytics': 'poor financial controls, no KPI tracking, inefficient capital allocation, unclear profitability',
            'team_culture': 'high turnover, low engagement scores, poor communication, undefined roles',
            'product_technology': 'outdated systems, no innovation pipeline, technical debt, poor user experience'
        };
        return indicators[competencyKey] || 'operational inefficiencies';
    }

    generateAIInsights(operatorArchetype, targetIndustries, confidenceScores) {
        return {
            keyStrengths: [
                `${operatorArchetype.title} archetype with ${operatorArchetype.compositeScore.toFixed(1)}/5.0 composite score`,
                `Strong industry alignment across ${targetIndustries.length} sectors`,
                `${Math.round(confidenceScores.overall * 100)}% overall analysis confidence`
            ],
            recommendations: [
                `Focus on businesses with clear ${this.getSpecificValueAdd(operatorArchetype.key)} opportunities`,
                `Prioritize ${targetIndustries[0]?.industry || 'service'} sector acquisitions (highest match: ${Math.round((targetIndustries[0]?.confidence || 0.5) * 100)}%)`,
                `Target companies where current owner lacks your ${operatorArchetype.title} expertise`
            ],
            risks: [
                confidenceScores.dataQuality < 0.7 ? 'Consider providing more detailed evidence for improved analysis' : null,
                confidenceScores.industry < 0.6 ? 'Industry alignment could be stronger - consider expanding interest areas' : null,
                'Avoid businesses requiring skills outside your primary archetype'
            ].filter(Boolean)
        };
    }
}

module.exports = AIEnhancedAcquisitionAdvisor;
