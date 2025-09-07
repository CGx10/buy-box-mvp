const natural = require('natural');
const compromise = require('compromise');

class AcquisitionAdvisor {
    constructor() {
        // Industry SDE multiples knowledge base
        this.industryMultiples = {
            'service': 2.5,
            'ecommerce': 3.5,
            'saas': 5.0,
            'manufacturing': 2.0,
            'retail': 2.8,
            'healthcare': 3.2,
            'technology': 4.5,
            'default': 3.0
        };

        // Operator archetype mappings
        this.archetypeMap = {
            'sales_marketing': {
                title: 'The Growth Catalyst',
                leverage: 'Weak Marketing / Strong Product'
            },
            'operations_systems': {
                title: 'The Efficiency Expert',
                leverage: 'Good Revenue / Inefficient Operations'
            },
            'product_technology': {
                title: 'The Visionary Builder',
                leverage: 'Loyal Customer Base / Outdated Products'
            },
            'team_culture': {
                title: 'The People Leader',
                leverage: 'High Turnover / Cultural Issues'
            },
            'finance_analytics': {
                title: 'The Financial Strategist',
                leverage: 'Undervalued / Financial Restructuring Opportunities'
            }
        };

        // Initialize NLP tools
        this.tokenizer = new natural.WordTokenizer();
        this.stemmer = natural.PorterStemmer;
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
        // Phase 2: Synthesis & Strategy
        
        // Step 2.1: Persona Synthesis
        const operatorArchetype = this.determineOperatorArchetype(userData);
        
        // Step 2.2: Opportunity Mapping
        const leverageThesis = this.archetypeMap[operatorArchetype.key].leverage;
        
        // Step 2.3: Industry & Theme Analysis
        const targetIndustries = this.analyzeIndustries(userData);
        
        // Step 2.4: Financial Parameter Calculation
        const financialAnalysis = this.calculateFinancialParameters(userData);
        
        // Phase 3: Report Generation
        const acquisitionThesis = this.generateAcquisitionThesis({
            operatorArchetype,
            leverageThesis,
            targetIndustries,
            userData
        });
        
        const personalizedBuybox = this.generatePersonalizedBuybox({
            targetIndustries,
            leverageThesis,
            operatorArchetype,
            financialAnalysis,
            userData
        });

        return {
            operatorArchetype,
            leverageThesis,
            targetIndustries,
            financialAnalysis,
            acquisitionThesis,
            personalizedBuybox
        };
    }

    determineOperatorArchetype(userData) {
        const competencies = {
            sales_marketing: userData.sales_marketing.rating,
            operations_systems: userData.operations_systems.rating,
            finance_analytics: userData.finance_analytics.rating,
            team_culture: userData.team_culture.rating,
            product_technology: userData.product_technology.rating
        };

        // Find highest rated competency
        let maxRating = 0;
        let topCompetency = '';
        
        for (const [key, rating] of Object.entries(competencies)) {
            if (rating > maxRating) {
                maxRating = rating;
                topCompetency = key;
            } else if (rating === maxRating && rating > 0) {
                // Tie-breaker: analyze qualitative evidence length and depth
                const currentEvidence = userData[topCompetency].evidence.length;
                const newEvidence = userData[key].evidence.length;
                if (newEvidence > currentEvidence) {
                    topCompetency = key;
                }
            }
        }

        return {
            key: topCompetency,
            title: this.archetypeMap[topCompetency].title,
            rating: maxRating,
            evidence: userData[topCompetency].evidence
        };
    }

    analyzeIndustries(userData) {
        // Combine all text inputs for NLP analysis
        const textInputs = [
            userData.interests_topics,
            userData.recent_books,
            userData.problem_to_solve
        ].join(' ');

        // Extract key themes using NLP
        const doc = compromise(textInputs);
        const topics = doc.topics().out('array');
        const nouns = doc.nouns().out('array');
        
        // Common business industry keywords
        const industryKeywords = {
            'technology': ['tech', 'software', 'ai', 'digital', 'app', 'platform', 'saas', 'startup'],
            'healthcare': ['health', 'medical', 'wellness', 'fitness', 'therapy', 'care', 'hospital'],
            'finance': ['finance', 'financial', 'money', 'investment', 'banking', 'accounting'],
            'education': ['education', 'learning', 'teaching', 'training', 'school', 'university'],
            'retail': ['retail', 'shopping', 'consumer', 'ecommerce', 'store', 'merchandise'],
            'service': ['service', 'consulting', 'professional', 'agency', 'support'],
            'manufacturing': ['manufacturing', 'production', 'factory', 'industrial', 'supply chain'],
            'real estate': ['real estate', 'property', 'housing', 'construction', 'development']
        };

        const detectedIndustries = [];
        const allTerms = [...topics, ...nouns].map(term => term.toLowerCase());

        for (const [industry, keywords] of Object.entries(industryKeywords)) {
            const matches = keywords.filter(keyword => 
                allTerms.some(term => term.includes(keyword) || keyword.includes(term))
            );
            if (matches.length > 0) {
                detectedIndustries.push({
                    industry: industry,
                    relevance: matches.length,
                    keywords: matches
                });
            }
        }

        // Sort by relevance and return top 3-5
        detectedIndustries.sort((a, b) => b.relevance - a.relevance);
        return detectedIndustries.slice(0, 5).map(item => item.industry);
    }

    calculateFinancialParameters(userData) {
        const totalLiquidCapital = parseFloat(userData.total_liquid_capital);
        const potentialLoanAmount = parseFloat(userData.potential_loan_amount);
        const minAnnualIncome = parseFloat(userData.min_annual_income);

        // Calculate max purchase price (10% equity injection for SBA loan)
        const maxPurchasePrice = totalLiquidCapital / 0.10;

        // Calculate SDE range using 3.0x multiple
        let sdeMin = totalLiquidCapital * 2.0;
        const sdeMax = maxPurchasePrice / 3.0;

        // Validation check for minimum income requirements
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
            potentialLoanAmount: potentialLoanAmount
        };
    }

    generateAcquisitionThesis({ operatorArchetype, leverageThesis, targetIndustries, userData }) {
        const topCompetencyDescription = this.getCompetencyDescription(operatorArchetype.key);
        const industriesText = targetIndustries.length > 0 ? targetIndustries.join(', ') : 'businesses that align with your interests';

        return `Based on your profile, you are a **${operatorArchetype.title}**. Your greatest strength lies in ${topCompetencyDescription}. The ideal business for you is one that has already achieved product-market fit but has stagnated due to ${leverageThesis.toLowerCase()}. You are uniquely positioned to unlock value in a company that needs your specific expertise in this area.

Your search should focus on the following industries: ${industriesText}. These sectors align with your demonstrated interests and passion areas, giving you the domain knowledge and motivation needed to drive meaningful improvements.

The businesses you acquire should have solid fundamentals but clear opportunities for the specific value-add you bring as a ${operatorArchetype.title}. This "fit-first" approach ensures you're not just buying a business, but acquiring an opportunity where your unique skills can create immediate and sustainable value.`;
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

    generatePersonalizedBuybox({ targetIndustries, leverageThesis, operatorArchetype, financialAnalysis, userData }) {
        const industriesText = targetIndustries.length > 0 ? targetIndustries.join(', ') : 'Aligned with your interests';
        
        return [
            {
                criterion: 'Industries',
                target: industriesText,
                rationale: 'Aligns with your stated passions and interests.'
            },
            {
                criterion: 'Business Model',
                target: 'Recurring Revenue (e.g., Service Contracts, Subscriptions > 60%)',
                rationale: `Provides stability and aligns with your risk tolerance of ${userData.risk_tolerance}.`
            },
            {
                criterion: 'Size (SDE)',
                target: financialAnalysis.sdeRange,
                rationale: `Based on your $${financialAnalysis.totalLiquidCapital.toLocaleString()} down payment and loan potential.`
            },
            {
                criterion: 'Profit Margin',
                target: '> 20% Net Margin',
                rationale: 'Indicates a healthy, fundamentally sound business with operational efficiency.'
            },
            {
                criterion: 'Geography',
                target: userData.location_preference,
                rationale: 'Matches your specified lifestyle requirements.'
            },
            {
                criterion: 'Owner Role',
                target: 'Owner is not the primary operator/technician',
                rationale: 'Ensures you are buying a scalable system, not just a job.'
            },
            {
                criterion: 'Team Structure',
                target: 'Key manager(s) in place, low employee turnover',
                rationale: 'Provides a foundation for a smooth transition and future growth.'
            },
            {
                criterion: 'YOUR LEVERAGE',
                target: `${leverageThesis}: Look for specific indicators like low web traffic, poor SEO, undeveloped SOPs, or outdated technology.`,
                rationale: `Your skills as a ${operatorArchetype.title} are the key to unlocking immediate value here.`
            },
            {
                criterion: 'Red Flags',
                target: 'High customer concentration (>20%), declining multi-year revenue, owner-dependent operations, businesses outside your core competencies.',
                rationale: 'Avoids businesses with existential risks that do not align with your operator profile.'
            }
        ];
    }
}

module.exports = AcquisitionAdvisor;
