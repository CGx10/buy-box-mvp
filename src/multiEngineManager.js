require('dotenv').config();

const AIEnhancedAcquisitionAdvisor = require('./aiEnhancedAdvisor');
const OpenAIAnalysisEngine = require('./engines/openaiEngine');
const ClaudeAnalysisEngine = require('./engines/claudeEngine');
const OllamaAnalysisEngine = require('./engines/ollamaEngine');
const HybridAnalysisEngine = require('./engines/hybridEngine');

class MultiEngineManager {
    constructor() {
        this.engines = {
            traditional: new AIEnhancedAcquisitionAdvisor(),
            openai: new OpenAIAnalysisEngine(),
            claude: new ClaudeAnalysisEngine(),
            ollama: new OllamaAnalysisEngine(),
            hybrid: new HybridAnalysisEngine()
        };
        
        this.defaultEngine = process.env.DEFAULT_AI_ENGINE || 'traditional';
    }

    async getAvailableEngines() {
        const engineInfo = {};
        
        for (const [name, engine] of Object.entries(this.engines)) {
            try {
                if (name === 'traditional') {
                    engineInfo[name] = {
                        name: "Traditional AI",
                        type: "Multi-Algorithm NLP",
                        model: "Sentiment + Keyword + Pattern Analysis",
                        provider: "Local Processing",
                        capabilities: [
                            "Fast local processing",
                            "No API dependencies",
                            "Transparent algorithms",
                            "Cost-effective analysis"
                        ],
                        requirements: ["None - built-in"],
                        enabled: true,
                        available: true
                    };
                } else if (typeof engine.getEngineInfo === 'function') {
                    engineInfo[name] = await engine.getEngineInfo();
                } else {
                    engineInfo[name] = {
                        name: name,
                        enabled: engine.isAvailable ? engine.isAvailable() : false,
                        available: false
                    };
                }
            } catch (error) {
                engineInfo[name] = {
                    name: name,
                    enabled: false,
                    available: false,
                    error: error.message
                };
            }
        }
        
        return engineInfo;
    }

    async processWithEngine(engineName, userData) {
        if (!this.engines[engineName]) {
            throw new Error(`Unknown engine: ${engineName}`);
        }

        const engine = this.engines[engineName];
        
        // Check if engine is available
        if (engineName !== 'traditional' && engine.isAvailable && !engine.isAvailable()) {
            throw new Error(`Engine ${engineName} is not available or properly configured`);
        }

        try {
            const startTime = Date.now();
            const result = await engine.processUserData(userData);
            const processingTime = Date.now() - startTime;

            return {
                ...result,
                engineUsed: engineName,
                processingTimeMs: processingTime,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`Engine ${engineName} failed:`, error);
            throw new Error(`Analysis failed with ${engineName} engine: ${error.message}`);
        }
    }

    async processWithMultipleEngines(engineNames, userData) {
        const results = {};
        const errors = {};
        
        // Process with each engine in parallel
        const promises = engineNames.map(async (engineName) => {
            try {
                const result = await this.processWithEngine(engineName, userData);
                results[engineName] = result;
            } catch (error) {
                errors[engineName] = error.message;
            }
        });

        await Promise.allSettled(promises);

        return {
            results,
            errors,
            engineCount: Object.keys(results).length,
            successfulEngines: Object.keys(results),
            failedEngines: Object.keys(errors)
        };
    }

    validateInput(userData) {
        // Use traditional engine for validation since it has comprehensive validation
        return this.engines.traditional.validateInput(userData);
    }

    getEngineComparison(multiResults) {
        if (!multiResults.results || Object.keys(multiResults.results).length < 2) {
            return null;
        }

        const engines = Object.keys(multiResults.results);
        const comparison = {
            engineCount: engines.length,
            archetypeAgreement: this.analyzeArchetypeAgreement(multiResults.results),
            industryOverlap: this.analyzeIndustryOverlap(multiResults.results),
            confidenceVariation: this.analyzeConfidenceVariation(multiResults.results),
            processingTimes: this.getProcessingTimes(multiResults.results),
            recommendations: this.generateComparisonRecommendations(multiResults.results)
        };

        return comparison;
    }

    analyzeArchetypeAgreement(results) {
        const archetypes = Object.values(results).map(r => r.operatorArchetype?.key || r.operatorArchetype?.title);
        const unique = [...new Set(archetypes)];
        
        return {
            totalEngines: archetypes.length,
            uniqueArchetypes: unique.length,
            agreement: unique.length === 1,
            archetypes: unique,
            agreementPercentage: unique.length === 1 ? 100 : Math.round((1 / unique.length) * 100)
        };
    }

    analyzeIndustryOverlap(results) {
        const allIndustries = [];
        const engineIndustries = {};

        Object.entries(results).forEach(([engine, result]) => {
            const industries = (result.targetIndustries || []).map(i => 
                typeof i === 'string' ? i : i.industry
            );
            engineIndustries[engine] = industries;
            allIndustries.push(...industries);
        });

        const uniqueIndustries = [...new Set(allIndustries)];
        const commonIndustries = uniqueIndustries.filter(industry =>
            Object.values(engineIndustries).every(engineList => 
                engineList.includes(industry)
            )
        );

        return {
            totalIndustries: uniqueIndustries.length,
            commonIndustries: commonIndustries.length,
            overlapPercentage: uniqueIndustries.length > 0 ? 
                Math.round((commonIndustries.length / uniqueIndustries.length) * 100) : 0,
            industries: commonIndustries
        };
    }

    analyzeConfidenceVariation(results) {
        const confidences = Object.values(results).map(r => 
            r.confidenceScores?.overall || 0.5
        );
        
        const avg = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
        const variance = confidences.reduce((sum, conf) => sum + Math.pow(conf - avg, 2), 0) / confidences.length;
        const stdDev = Math.sqrt(variance);

        return {
            average: Math.round(avg * 100),
            standardDeviation: Math.round(stdDev * 100),
            range: {
                min: Math.round(Math.min(...confidences) * 100),
                max: Math.round(Math.max(...confidences) * 100)
            },
            consistency: stdDev < 0.1 ? 'High' : stdDev < 0.2 ? 'Medium' : 'Low'
        };
    }

    getProcessingTimes(results) {
        return Object.entries(results).reduce((times, [engine, result]) => {
            times[engine] = result.processingTimeMs || 0;
            return times;
        }, {});
    }

    generateComparisonRecommendations(results) {
        const engineCount = Object.keys(results).length;
        const archetype = this.analyzeArchetypeAgreement(results);
        const industry = this.analyzeIndustryOverlap(results);
        const confidence = this.analyzeConfidenceVariation(results);

        const recommendations = [];

        if (archetype.agreement) {
            recommendations.push(`Strong consensus: All ${engineCount} engines agree on ${archetype.archetypes[0]} archetype`);
        } else {
            recommendations.push(`Mixed results: ${archetype.uniqueArchetypes.length} different archetypes identified - recommend additional analysis`);
        }

        if (industry.overlapPercentage > 60) {
            recommendations.push(`Good industry alignment: ${industry.overlapPercentage}% overlap across engines`);
        } else {
            recommendations.push(`Industry variation detected: Only ${industry.overlapPercentage}% overlap - consider broader search`);
        }

        if (confidence.consistency === 'High') {
            recommendations.push(`High confidence consistency: ${confidence.consistency} variation (±${confidence.standardDeviation}%)`);
        } else {
            recommendations.push(`Variable confidence levels: ${confidence.consistency} consistency - validate findings carefully`);
        }

        return recommendations;
    }

    getDefaultEngine() {
        return this.defaultEngine;
    }

    setDefaultEngine(engineName) {
        if (this.engines[engineName]) {
            this.defaultEngine = engineName;
            return true;
        }
        return false;
    }
}

module.exports = MultiEngineManager;

