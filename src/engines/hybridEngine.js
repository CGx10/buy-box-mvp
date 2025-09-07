const AIEnhancedAcquisitionAdvisor = require('../aiEnhancedAdvisor');
const OpenAIAnalysisEngine = require('./openaiEngine');

class HybridAnalysisEngine {
    constructor() {
        this.traditionalEngine = new AIEnhancedAcquisitionAdvisor();
        this.llmEngine = new OpenAIAnalysisEngine();
        this.enabled = process.env.ENABLE_HYBRID === 'true' && this.llmEngine.isAvailable();
    }

    async processUserData(userData) {
        if (!this.enabled) {
            throw new Error('Hybrid engine not enabled or dependencies not available');
        }

        console.log('🤖 Starting Hybrid AI Analysis (Traditional + LLM)...');

        try {
            // Run both engines in parallel
            const [traditionalResults, llmResults] = await Promise.all([
                this.traditionalEngine.processUserData(userData),
                this.llmEngine.processUserData(userData)
            ]);

            // Combine and enhance the results
            const hybridAnalysis = this.synthesizeResults(traditionalResults, llmResults, userData);
            
            // Generate comparative analysis
            const comparativeAnalysis = this.generateComparativeAnalysis(traditionalResults, llmResults);
            
            // Generate confidence-weighted recommendations
            const weightedRecommendations = this.generateWeightedRecommendations(traditionalResults, llmResults);

            return {
                ...hybridAnalysis,
                engineType: 'hybrid',
                engineVersion: 'Traditional AI + LLM',
                processingTime: Date.now(),
                traditionalResults,
                llmResults,
                comparativeAnalysis,
                weightedRecommendations,
                aiInsights: this.generateHybridInsights(hybridAnalysis, comparativeAnalysis)
            };

        } catch (error) {
            console.error('Hybrid Analysis Error:', error);
            throw new Error(`Hybrid analysis failed: ${error.message}`);
        }
    }

    synthesizeResults(traditional, llm, userData) {
        // Determine the primary archetype using confidence-weighted voting
        const primaryArchetype = this.selectPrimaryArchetype(traditional, llm);
        
        // Combine industry recommendations with confidence weighting
        const targetIndustries = this.combineIndustryRecommendations(traditional, llm);
        
        // Generate consensus confidence scores
        const confidenceScores = this.generateConsensusConfidence(traditional, llm);
        
        // Create enhanced acquisition thesis
        const acquisitionThesis = this.generateHybridAcquisitionThesis(traditional, llm, primaryArchetype);
        
        // Generate comprehensive buybox
        const personalizedBuybox = this.generateHybridBuybox(traditional, llm, targetIndustries);
        
        // Calculate optimized financial parameters
        const financialAnalysis = this.optimizeFinancialAnalysis(traditional, llm, userData);

        return {
            operatorArchetype: primaryArchetype,
            leverageThesis: this.selectLeverageThesis(traditional, llm),
            targetIndustries,
            confidenceScores,
            acquisitionThesis,
            personalizedBuybox,
            financialAnalysis
        };
    }

    selectPrimaryArchetype(traditional, llm) {
        const tradArchetype = traditional.operatorArchetype;
        const llmArchetype = llm.operatorArchetype;
        
        // Weight by confidence scores
        const tradWeight = traditional.confidenceScores.archetype * 0.6; // Traditional gets 60% weight
        const llmWeight = llm.confidenceScores.archetype * 0.4; // LLM gets 40% weight
        
        if (tradArchetype.key === llmArchetype.key) {
            // Agreement - combine scores
            return {
                key: tradArchetype.key,
                title: tradArchetype.title,
                compositeScore: (tradArchetype.compositeScore * tradWeight + llmArchetype.compositeScore * llmWeight),
                confidence: Math.min(0.95, (tradWeight + llmWeight) / 2 + 0.1), // Boost confidence for agreement
                evidence: `Traditional AI: ${tradArchetype.evidence.substring(0, 200)}... LLM Analysis: ${llmArchetype.evidence.substring(0, 200)}...`,
                reasoning: `CONSENSUS: Both traditional AI and LLM analysis agree on ${tradArchetype.title}. Traditional analysis shows ${tradArchetype.compositeScore.toFixed(2)} composite score, while LLM analysis provides detailed reasoning: ${llmArchetype.reasoning.substring(0, 300)}...`,
                agreement: true
            };
        } else {
            // Disagreement - use confidence-weighted selection
            const tradTotal = tradArchetype.compositeScore * tradWeight;
            const llmTotal = llmArchetype.compositeScore * llmWeight;
            
            const winner = tradTotal > llmTotal ? tradArchetype : llmArchetype;
            const methodology = tradTotal > llmTotal ? 'Traditional AI' : 'LLM Analysis';
            
            return {
                ...winner,
                confidence: Math.max(tradWeight, llmWeight) * 0.8, // Reduce confidence for disagreement
                reasoning: `WEIGHTED SELECTION: ${methodology} selected ${winner.title}. Traditional: ${tradArchetype.title} (${tradTotal.toFixed(2)}), LLM: ${llmArchetype.title} (${llmTotal.toFixed(2)}). Disagreement detected - recommend manual review.`,
                agreement: false,
                alternativeArchetype: tradTotal > llmTotal ? llmArchetype : tradArchetype
            };
        }
    }

    combineIndustryRecommendations(traditional, llm) {
        const tradIndustries = traditional.targetIndustries || [];
        const llmIndustries = llm.targetIndustries || [];
        
        // Create industry confidence map
        const industryMap = new Map();
        
        // Add traditional recommendations
        tradIndustries.forEach(ind => {
            const key = typeof ind === 'string' ? ind : ind.industry;
            const confidence = typeof ind === 'string' ? 0.7 : (ind.confidence || 0.7);
            industryMap.set(key, {
                industry: key,
                traditionalRelevance: typeof ind === 'string' ? 7 : (ind.relevance || 7),
                traditionalConfidence: confidence,
                llmRelevance: 0,
                llmConfidence: 0,
                sources: ['traditional']
            });
        });
        
        // Add LLM recommendations
        llmIndustries.forEach(ind => {
            const key = typeof ind === 'string' ? ind : ind.industry;
            const confidence = typeof ind === 'string' ? 0.8 : (ind.confidence || 0.8);
            const relevance = typeof ind === 'string' ? 8 : (ind.relevance || 8);
            
            if (industryMap.has(key)) {
                const existing = industryMap.get(key);
                existing.llmRelevance = relevance;
                existing.llmConfidence = confidence;
                existing.sources.push('llm');
            } else {
                industryMap.set(key, {
                    industry: key,
                    traditionalRelevance: 0,
                    traditionalConfidence: 0,
                    llmRelevance: relevance,
                    llmConfidence: confidence,
                    sources: ['llm']
                });
            }
        });
        
        // Calculate combined scores and sort
        const combinedIndustries = Array.from(industryMap.values()).map(ind => {
            const agreement = ind.sources.length > 1;
            const avgRelevance = (ind.traditionalRelevance + ind.llmRelevance) / (agreement ? 2 : 1);
            const avgConfidence = (ind.traditionalConfidence + ind.llmConfidence) / (agreement ? 2 : 1);
            
            return {
                industry: ind.industry,
                relevance: avgRelevance,
                confidence: agreement ? Math.min(0.95, avgConfidence + 0.1) : avgConfidence * 0.9,
                agreement,
                sources: ind.sources,
                reasoning: agreement ? 
                    'Recommended by both traditional AI and LLM analysis' :
                    `Recommended by ${ind.sources[0]} analysis only`
            };
        });
        
        return combinedIndustries
            .sort((a, b) => (b.relevance * b.confidence) - (a.relevance * a.confidence))
            .slice(0, 5);
    }

    generateConsensusConfidence(traditional, llm) {
        const tradConf = traditional.confidenceScores;
        const llmConf = llm.confidenceScores;
        
        return {
            overall: (tradConf.overall * 0.6 + llmConf.overall * 0.4),
            archetype: (tradConf.archetype * 0.6 + llmConf.archetype * 0.4),
            industry: (tradConf.industry * 0.6 + llmConf.industry * 0.4),
            dataQuality: Math.max(tradConf.dataQuality, llmConf.dataQuality),
            consensus: this.calculateConsensusLevel(traditional, llm)
        };
    }

    calculateConsensusLevel(traditional, llm) {
        let agreementPoints = 0;
        let totalPoints = 0;
        
        // Archetype agreement
        totalPoints += 3;
        if (traditional.operatorArchetype.key === llm.operatorArchetype.key) {
            agreementPoints += 3;
        }
        
        // Industry overlap
        const tradIndustries = (traditional.targetIndustries || []).map(i => typeof i === 'string' ? i : i.industry);
        const llmIndustries = (llm.targetIndustries || []).map(i => typeof i === 'string' ? i : i.industry);
        const commonIndustries = tradIndustries.filter(ind => llmIndustries.includes(ind));
        
        totalPoints += 2;
        agreementPoints += (commonIndustries.length / Math.max(tradIndustries.length, llmIndustries.length, 1)) * 2;
        
        return agreementPoints / totalPoints;
    }

    generateHybridAcquisitionThesis(traditional, llm, primaryArchetype) {
        const consensusLevel = this.calculateConsensusLevel(traditional, llm);
        const confidenceNote = consensusLevel > 0.7 ? 'high consensus' : 'moderate consensus';
        
        const traditionalThesis = traditional.acquisitionThesis || '';
        const llmThesis = llm.acquisitionThesis || '';
        
        return `HYBRID AI ANALYSIS (${confidenceNote} between methodologies):

${primaryArchetype.agreement ? 
    `Both traditional AI and LLM analysis confirm you are a **${primaryArchetype.title}** with high confidence (${Math.round(primaryArchetype.confidence * 100)}%).` :
    `Weighted analysis identifies you as a **${primaryArchetype.title}**, though methodologies show some variation in assessment.`
}

TRADITIONAL AI INSIGHTS: ${traditionalThesis.substring(0, 400)}...

LLM ANALYSIS: ${llmThesis.substring(0, 400)}...

SYNTHESIZED STRATEGY: The hybrid approach provides enhanced accuracy by combining the systematic analysis of traditional AI with the nuanced reasoning of large language models. This multi-methodology consensus ${consensusLevel > 0.7 ? 'strongly supports' : 'suggests'} focusing on ${primaryArchetype.title} opportunities in your target acquisition search.`;
    }

    generateHybridBuybox(traditional, llm, targetIndustries) {
        const tradBuybox = traditional.personalizedBuybox || [];
        const llmBuybox = llm.personalizedBuybox || [];
        
        // Combine and enhance buybox criteria
        const hybridBuybox = [
            {
                criterion: 'Industries (Hybrid)',
                target: targetIndustries.slice(0, 3).map(i => `${i.industry} (${Math.round(i.confidence * 100)}%)`).join(', '),
                rationale: `Multi-methodology analysis with ${targetIndustries.filter(i => i.agreement).length}/${targetIndustries.length} industries showing consensus`
            },
            {
                criterion: 'AI Confidence Level',
                target: `${Math.round(this.generateConsensusConfidence(traditional, llm).overall * 100)}% overall confidence`,
                rationale: 'Based on agreement between traditional AI and LLM methodologies'
            }
        ];
        
        // Add unique criteria from both sources
        tradBuybox.forEach(item => {
            if (!hybridBuybox.find(h => h.criterion === item.criterion)) {
                hybridBuybox.push({
                    ...item,
                    rationale: `Traditional AI: ${item.rationale}`
                });
            }
        });
        
        return hybridBuybox.slice(0, 8); // Limit to 8 most important criteria
    }

    optimizeFinancialAnalysis(traditional, llm, userData) {
        const tradFinancial = traditional.financialAnalysis || {};
        const llmFinancial = llm.financialAnalysis || {};
        
        // Use the more conservative estimates for safety
        const sdeMin = Math.max(tradFinancial.sdeMin || 0, llmFinancial.sdeMin || 0);
        const sdeMax = Math.min(tradFinancial.sdeMax || 1000000, llmFinancial.sdeMax || 1000000);
        
        return {
            sdeRange: `$${Math.round(sdeMin).toLocaleString()} - $${Math.round(sdeMax).toLocaleString()}`,
            maxPurchasePrice: Math.min(tradFinancial.maxPurchasePrice || 0, llmFinancial.maxPurchasePrice || 0),
            industryMultiple: (tradFinancial.industryMultiple + llmFinancial.industryMultiple) / 2,
            industryConfidence: Math.max(tradFinancial.industryConfidence || 0, llmFinancial.industryConfidence || 0),
            methodology: 'Conservative hybrid approach using both traditional and LLM financial modeling'
        };
    }

    selectLeverageThesis(traditional, llm) {
        // Use the thesis from the primary archetype
        return traditional.leverageThesis || llm.leverageThesis || 'Hybrid opportunity identification';
    }

    generateComparativeAnalysis(traditional, llm) {
        return {
            archetypeAgreement: traditional.operatorArchetype.key === llm.operatorArchetype.key,
            traditionalArchetype: traditional.operatorArchetype.title,
            llmArchetype: llm.operatorArchetype.title,
            confidenceDifference: Math.abs(traditional.confidenceScores.overall - llm.confidenceScores.overall),
            industryOverlap: this.calculateIndustryOverlap(traditional.targetIndustries, llm.targetIndustries),
            recommendedApproach: 'Hybrid methodology provides enhanced accuracy through multi-algorithm consensus'
        };
    }

    calculateIndustryOverlap(tradIndustries, llmIndustries) {
        const tradList = (tradIndustries || []).map(i => typeof i === 'string' ? i : i.industry);
        const llmList = (llmIndustries || []).map(i => typeof i === 'string' ? i : i.industry);
        const overlap = tradList.filter(ind => llmList.includes(ind));
        return overlap.length / Math.max(tradList.length, llmList.length, 1);
    }

    generateWeightedRecommendations(traditional, llm) {
        return {
            primaryRecommendation: 'Use hybrid analysis for optimal accuracy',
            confidenceLevel: 'Enhanced through multi-methodology validation',
            actionItems: [
                'Focus search on consensus industries identified by both methodologies',
                'Pay special attention to archetype agreement/disagreement',
                'Use conservative financial parameters from hybrid analysis',
                'Validate findings through additional due diligence'
            ]
        };
    }

    generateHybridInsights(analysis, comparative) {
        return {
            engineName: "Hybrid AI Analysis",
            processingApproach: "Traditional AI + Large Language Model synthesis",
            keyStrengths: [
                "Multi-methodology validation and consensus building",
                "Enhanced accuracy through algorithm diversity",
                "Balanced systematic analysis with nuanced reasoning",
                "Reduced single-point-of-failure risk in AI analysis"
            ],
            analyticalMethod: [
                "Parallel traditional and LLM processing",
                "Confidence-weighted result synthesis",
                "Consensus detection and disagreement flagging",
                "Conservative financial parameter optimization"
            ],
            uniqueCapabilities: [
                "Cross-methodology validation",
                "Disagreement detection and resolution",
                "Enhanced confidence through consensus",
                "Balanced systematic + intuitive analysis"
            ],
            limitations: [
                "Requires both traditional and LLM capabilities",
                "More complex processing and longer analysis time",
                "May mask important minority opinions from single methodologies",
                "Dependent on quality of both underlying engines"
            ],
            recommendedUse: "Best for high-stakes decisions requiring maximum analytical confidence and validation"
        };
    }

    isAvailable() {
        return this.enabled && this.llmEngine.isAvailable();
    }

    getEngineInfo() {
        return {
            name: "Hybrid AI Engine",
            type: "Multi-Methodology Analysis",
            model: "Traditional AI + LLM Synthesis",
            provider: "Hybrid System",
            capabilities: [
                "Multi-algorithm consensus building",
                "Cross-methodology validation",
                "Enhanced confidence scoring",
                "Disagreement detection and resolution"
            ],
            requirements: ["Traditional AI components", "LLM API access"],
            enabled: this.enabled
        };
    }
}

module.exports = HybridAnalysisEngine;

