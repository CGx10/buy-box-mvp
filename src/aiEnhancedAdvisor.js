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

        // Module A validation - check competencies in nested structure
        const requiredCompetencies = ['sales_marketing', 'operations_systems', 'finance_analytics', 'team_culture', 'product_technology'];
        for (const comp of requiredCompetencies) {
            const competency = userData.competencies?.[comp];
            if (!competency || !competency.rating || !competency.evidence) {
                errors.push(`Missing ${comp} rating or evidence`);
            } else if (competency.evidence.length < 200) {
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

        // Generate multi-framework raw response
        const rawResponse = this.generateMultiFrameworkResponse(operatorArchetype, leverageThesis, targetIndustries, financialAnalysis, confidenceScores, acquisitionThesis, personalizedBuybox, userData);
        
        return {
            analysis_methodology: 'multi_framework',
            rawResponse,
            archetype1: {
                name: operatorArchetype.title,
                description: `A strategic operator who excels at ${operatorArchetype.key} and drives value creation.`
            },
            archetype2: {
                name: this.getSecondaryArchetype(operatorArchetype.key),
                description: `A complementary operator who leverages complementary skills for strategic advantage.`
            },
            frameworks: this.generateFrameworkStructures(operatorArchetype, leverageThesis, targetIndustries, financialAnalysis, userData),
            comparison: this.generateComparisonData(operatorArchetype, targetIndustries, confidenceScores),
            // Keep original single-engine format for backward compatibility
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

        // CRITICAL FIX: Ensure sdeMin is never greater than sdeMax
        if (sdeMin >= sdeMax) {
            // If minimum exceeds maximum, adjust the range to be realistic
            const adjustedMax = sdeMin * 1.5; // 50% buffer above minimum
            return {
                maxPurchasePrice: maxPurchasePrice,
                sdeRange: `$${Math.round(sdeMin).toLocaleString()} - $${Math.round(adjustedMax).toLocaleString()}`,
                sdeMin: sdeMin,
                sdeMax: adjustedMax,
                totalLiquidCapital: totalLiquidCapital,
                potentialLoanAmount: potentialLoanAmount,
                warning: "SDE range adjusted due to capital constraints - consider increasing available capital or reducing income requirements"
            };
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
        const archetypeConfidence = Math.min(1.0, operatorArchetype.confidence); // Cap at 100%
        const industryConfidence = Math.min(1.0, targetIndustries.reduce((sum, ind) => sum + ind.confidence, 0) / targetIndustries.length);
        
        // Factor in data quality
        const dataQuality = Math.min(1.0, this.assessDataQuality(userData));
        
        // CRITICAL FIX: Cap all confidence scores at 100%
        const overall = Math.min(1.0, (archetypeConfidence * 0.4 + industryConfidence * 0.4 + dataQuality * 0.2));
        
        return {
            overall: overall,
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

        return `Based on our AI analysis with ${confidenceLevel} confidence (${Math.round(confidenceScores.overall * 100)}%), you are a **${operatorArchetype.title}**. Your greatest strength lies in ${topCompetencyDescription}, as evidenced by your ${(operatorArchetype.compositeScore || 0).toFixed(1)}/5.0 composite expertise score.

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
        const multipleRange = `${((financialAnalysis.industryMultiple || 3.0) * 0.8).toFixed(1)}x - ${((financialAnalysis.industryMultiple || 3.0) * 1.2).toFixed(1)}x`;
        
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
                rationale: `Calculated using industry-weighted multiple of ${(financialAnalysis.industryMultiple || 3.0).toFixed(1)}x based on your $${(financialAnalysis.totalLiquidCapital || 0).toLocaleString()} capital.`
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
                `${operatorArchetype.title} archetype with ${(operatorArchetype.compositeScore || 0).toFixed(1)}/5.0 composite score`,
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

    generateMultiFrameworkResponse(operatorArchetype, leverageThesis, targetIndustries, financialAnalysis, confidenceScores, acquisitionThesis, personalizedBuybox, userData) {
        const motivators = userData.motivators || ['freedom', 'earning potential'];
        const riskTolerance = userData.riskTolerance || 'medium';
        const timeHorizon = userData.timeHorizon || '1-3 years';
        const investmentAmount = userData.investmentAmount || '250k-1M';
        
        return `**Part 1: Executive Summary & Strategic Insights**

Our comprehensive analysis reveals two distinct and powerful strategic paths for your acquisition journey, each defined by a clear operator archetype. Understanding these two paths is the key to focusing your search and maximizing your chances of success.

**Understanding Your Archetypes**

**The ${operatorArchetype.title}**
This archetype represents your primary strength in ${operatorArchetype.key}. You excel at leveraging ${operatorArchetype.key} to drive strategic value and operational excellence, and are driven by ${motivators.join(' and ')}. Your ${riskTolerance} risk tolerance and ${timeHorizon} time horizon make you well-suited for ${this.getInvestmentRangeDescription(investmentAmount)} acquisitions.

**The ${this.getSecondaryArchetype(operatorArchetype.key)}**
This secondary archetype leverages your complementary capabilities. You have strong potential in leveraging complementary skills for strategic advantage and can complement your primary archetype through strategic integration of ${operatorArchetype.key} and complementary capabilities.

**How to Use This Report to Create Your Unified Buybox**

This analysis provides your personalized acquisition strategy framework. Focus on opportunities that align with your ${operatorArchetype.title} strengths while developing your complementary capabilities. Your ideal targets will be ${this.getTargetDescription(userData)} that offer significant ${motivators.join(' and ')} potential.

Strategic Implications: Your unique combination of competencies positions you for success in ${this.getIndustryFocus(userData)}. Prioritize deals that leverage your ${operatorArchetype.key} expertise while building your complementary capabilities for long-term value creation.

**Part 3: Detailed Framework Reports**

---

### --- Traditional M&A Expert Analysis ---
*Expert M&A advisory approach focusing on operator archetype identification and strategic acquisition targeting.*

**Key Insights:**
- Primary Archetype: ${operatorArchetype.title}
- Secondary Archetype: ${this.getSecondaryArchetype(operatorArchetype.key)}
- Recommended Deal Size: ${investmentAmount}
- Risk Profile: ${riskTolerance}
- Time Horizon: ${timeHorizon}

**Strategic Recommendations:**
1. Focus on ${this.getIndustryFocus(userData)} opportunities
2. Prioritize ${this.getDealTypeFocus(userData)} structures
3. Develop complementary capabilities
4. Build relationships in strategic networks

<thesis_start>
Your acquisition thesis centers on leveraging your ${operatorArchetype.key} expertise to identify and acquire ${this.getIndustryFocus(userData)} businesses in the ${investmentAmount} range. Your ${operatorArchetype.title} profile positions you to create value through operational improvements and strategic synergies, while your complementary capabilities enable you to accelerate growth and market expansion. Target businesses with strong fundamentals but underutilized potential, where your ${operatorArchetype.key} and complementary skills can drive significant value creation and competitive advantage.
<thesis_end>

***Your Personalized Buybox***

| CRITERION | YOUR TARGET PROFILE | RATIONALE |
|-----------|-------------------|-----------|
| **Target Size** | ${investmentAmount} | Aligns with your risk tolerance and available capital |
| **Industry Focus** | ${this.getIndustryFocus(userData)} | Matches your operational expertise and market knowledge |
| **Deal Structure** | ${this.getDealTypeFocus(userData)} | Optimizes for your acquisition strategy and risk profile |
| **Key Capabilities** | ${operatorArchetype.key}, complementary skills | Leverages your strongest competencies for value creation |
| **Risk Profile** | ${riskTolerance} | Balances opportunity with your risk tolerance |
| **Time Horizon** | ${timeHorizon} | Matches your investment timeline and exit strategy |

---

### --- The Hedgehog Concept Analysis ---
*Jim Collins' three circles framework: passion, excellence, and economic engine alignment.*

**Hedgehog Analysis:**
- Passion: ${operatorArchetype.key} and strategic value creation
- Excellence: Complementary capabilities and operational expertise
- Economic Engine: ${motivators.join(' and ')} through strategic acquisitions

**Hedgehog Recommendations:**
1. Focus on businesses where passion and excellence intersect
2. Target opportunities that drive your economic engine
3. Align acquisition strategy with core competencies
4. Build sustainable competitive advantages

<thesis_start>
Focus on acquiring businesses in ${this.getIndustryFocus(userData)} where your ${operatorArchetype.key} passion and excellence can drive ${motivators.join(' and ')} through strategic acquisitions. This framework ensures alignment between what you love, what you're best at, and what drives your economic success.
<thesis_end>

***Your Personalized Buybox***

| CRITERION | YOUR TARGET PROFILE | RATIONALE |
|-----------|-------------------|-----------|
| **Passion Areas** | ${this.getIndustryFocus(userData)} | Aligns with your core interests and values |
| **Excellence Focus** | ${operatorArchetype.key} capabilities | Leverages your strongest demonstrated skills |
| **Economic Engine** | ${motivators.join(' and ')} potential | Drives your primary motivation and goals |
| **Deal Size** | ${investmentAmount} | Matches your risk tolerance and capital |
| **Time Horizon** | ${timeHorizon} | Aligns with your investment timeline |
| **Risk Profile** | ${riskTolerance} | Balances opportunity with your comfort level |

---

### --- SWOT Analysis ---
*Strategic planning framework evaluating internal strengths/weaknesses against external opportunities/threats.*

**SWOT Assessment:**
- Strengths: ${operatorArchetype.key} expertise and complementary capabilities
- Weaknesses: Areas requiring development in complementary skills
- Opportunities: ${this.getIndustryFocus(userData)} market opportunities
- Threats: Market volatility and competitive pressures

**SWOT Strategy:**
1. Leverage strengths in ${operatorArchetype.key}
2. Address weaknesses through strategic partnerships
3. Capitalize on ${this.getIndustryFocus(userData)} opportunities
4. Mitigate threats through diversification

<thesis_start>
Capitalize on your ${operatorArchetype.key} strengths to acquire businesses in ${this.getIndustryFocus(userData)} opportunities while mitigating complementary skill gaps through strategic partnerships, all while aligning with your motivators and work-life balance preferences. This framework leverages your internal capabilities against external market opportunities.
<thesis_end>

***Your Personalized Buybox***

| CRITERION | YOUR TARGET PROFILE | RATIONALE |
|-----------|-------------------|-----------|
| **Strengths** | ${operatorArchetype.key} expertise | Leverages your core competitive advantages |
| **Opportunities** | ${this.getIndustryFocus(userData)} markets | Capitalizes on external market potential |
| **Weakness Mitigation** | Strategic partnerships | Addresses skill gaps through collaboration |
| **Threat Management** | Diversified portfolio | Reduces risk through strategic variety |
| **Deal Size** | ${investmentAmount} | Matches your risk tolerance and capital |
| **Time Horizon** | ${timeHorizon} | Aligns with your investment timeline |

---

### --- Entrepreneurial Orientation Analysis ---
*Miller (1983) framework assessing innovativeness, proactiveness, and risk-taking to match entrepreneurial DNA.*

**EO Assessment:**
- Innovativeness: ${this.getTechIntegration(operatorArchetype.key)} technology integration
- Proactiveness: ${this.getGrowthAcceleration(operatorArchetype.key)} growth acceleration
- Risk-Taking: ${riskTolerance} risk tolerance and strategic positioning

**EO Strategy:**
1. Apply innovative approaches to ${operatorArchetype.key}
2. Proactively identify market opportunities
3. Balance risk-taking with strategic planning
4. Build entrepreneurial capabilities

<thesis_start>
Seek opportunities that match your ${operatorArchetype.key} entrepreneurial characteristics in ${this.getIndustryFocus(userData)} sectors, while respecting your work-life balance preferences and values alignment. Your ${riskTolerance} risk tolerance and proactive nature are best suited for ${this.getDealTypeFocus(userData)} where innovation and market timing are critical success factors.
<thesis_end>

***Your Personalized Buybox***

| CRITERION | YOUR TARGET PROFILE | RATIONALE |
|-----------|-------------------|-----------|
| **Innovativeness** | ${this.getTechIntegration(operatorArchetype.key)} tech integration | Matches your innovation capabilities |
| **Proactiveness** | ${this.getGrowthAcceleration(operatorArchetype.key)} growth focus | Aligns with your proactive nature |
| **Risk-Taking** | ${riskTolerance} risk profile | Balances opportunity with your comfort level |
| **Market Timing** | ${this.getIndustryFocus(userData)} opportunities | Capitalizes on market timing advantages |
| **Deal Size** | ${investmentAmount} | Matches your risk tolerance and capital |
| **Time Horizon** | ${timeHorizon} | Aligns with your investment timeline |

---

### --- Value Creation Analysis ---
*Strategic framework for identifying and maximizing acquisition value.*

**Value Creation Potential:**
- Operational Excellence: ${this.getOperationalExcellence(operatorArchetype.key)}
- Growth Acceleration: ${this.getGrowthAcceleration(operatorArchetype.key)}
- Strategic Synergies: High potential for ${operatorArchetype.key} integration

**Value Creation Strategy:**
1. Identify operational improvement opportunities
2. Develop growth acceleration capabilities
3. Create strategic synergies through ${operatorArchetype.key}
4. Build sustainable competitive advantages

<thesis_start>
Focus on acquiring businesses where your ${operatorArchetype.key} expertise can create immediate operational improvements while building growth acceleration capabilities. Target ${this.getIndustryFocus(userData)} opportunities in the ${investmentAmount} range that offer significant value creation potential through strategic synergies and competitive advantages.
<thesis_end>

***Your Personalized Buybox***

| CRITERION | YOUR TARGET PROFILE | RATIONALE |
|-----------|-------------------|-----------|
| **Operational Excellence** | ${this.getOperationalExcellence(operatorArchetype.key)} capabilities | Leverages your operational improvement skills |
| **Growth Acceleration** | ${this.getGrowthAcceleration(operatorArchetype.key)} potential | Aligns with your growth capabilities |
| **Strategic Synergies** | ${operatorArchetype.key} integration | Maximizes value through skill alignment |
| **Value Creation** | High potential opportunities | Focuses on maximum value creation |
| **Deal Size** | ${investmentAmount} | Matches your risk tolerance and capital |
| **Time Horizon** | ${timeHorizon} | Aligns with your investment timeline |

**Strategic Implications:** This comprehensive analysis positions you as a ${operatorArchetype.title} with strong complementary capabilities, ready to execute strategic acquisitions in the ${investmentAmount} range with a focus on ${this.getIndustryFocus(userData)} opportunities that align with your ${motivators.join(' and ')} objectives.`;
    }

    getSecondaryArchetype(primaryKey) {
        const archetypeMap = {
            'sales_marketing': 'The Efficiency Expert',
            'operations_systems': 'The Growth Catalyst',
            'finance_analytics': 'The Visionary Builder',
            'team_culture': 'The Financial Strategist',
            'product_technology': 'The People Leader'
        };
        return archetypeMap[primaryKey] || 'The Strategic Operator';
    }

    generateFrameworkStructures(operatorArchetype, leverageThesis, targetIndustries, financialAnalysis, userData) {
        return [
            {
                name: 'Traditional M&A Expert Analysis',
                type: 'Expert M&A Advisory',
                status: 'completed',
                confidence: 0.85
            },
            {
                name: 'The Hedgehog Concept Analysis',
                type: 'Strategic Framework',
                status: 'completed',
                confidence: 0.80
            },
            {
                name: 'SWOT Analysis',
                type: 'Strategic Planning',
                status: 'completed',
                confidence: 0.82
            },
            {
                name: 'Entrepreneurial Orientation Analysis',
                type: 'Behavioral Assessment',
                status: 'completed',
                confidence: 0.78
            }
        ];
    }

    generateComparisonData(operatorArchetype, targetIndustries, confidenceScores) {
        return {
            summary: 'Multi-framework analysis provides comprehensive strategic insights',
            strengths: [
                'Comprehensive archetype identification',
                'Multi-dimensional strategic analysis',
                'Personalized recommendations',
                'Framework-specific insights'
            ],
            recommendations: [
                'Focus on primary archetype strengths',
                'Develop secondary archetype capabilities',
                'Leverage framework synergies',
                'Implement strategic recommendations'
            ]
        };
    }

    getInvestmentRangeDescription(amount) {
        const ranges = {
            '50k-250k': 'small to medium',
            '250k-1M': 'medium to large',
            '1M-5M': 'large',
            '5M+': 'enterprise-level'
        };
        return ranges[amount] || 'medium to large';
    }

    getTechIntegration(key) {
        if (key === 'product_technology') return 'high';
        if (key === 'finance_analytics') return 'moderate';
        return 'developing';
    }

    getGrowthAcceleration(key) {
        if (key === 'sales_marketing') return 'high';
        if (key === 'operations_systems') return 'moderate';
        return 'developing';
    }

    getOperationalExcellence(key) {
        if (key === 'operations_systems') return 'strong';
        if (key === 'finance_analytics') return 'moderate';
        return 'developing';
    }

    getTargetDescription(userData) {
        const industry = userData.industry || 'any';
        const dealSize = userData.dealSize || 'small';
        return `${dealSize}-sized businesses in ${industry} industries`;
    }

    getIndustryFocus(userData) {
        return userData.industry || 'technology, finance, healthcare';
    }

    getDealTypeFocus(userData) {
        return userData.dealType || 'equity-based acquisitions';
    }
}

module.exports = AIEnhancedAcquisitionAdvisor;
