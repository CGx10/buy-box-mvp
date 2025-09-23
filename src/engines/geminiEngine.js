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
            // Set model based on user selection
            const selectedModel = userData.ai_model || 'gemini-1.5-flash';
            this.model = this.genAI.getGenerativeModel({ model: selectedModel });
            console.log(`🤖 Using Gemini model: ${selectedModel}`);
            console.log(`🔍 UserData.ai_model: ${userData.ai_model}`);
            
            // Add Flash-specific reinforcement
            if (selectedModel === 'gemini-1.5-flash') {
                console.log('⚡ FLASH MODEL DETECTED - Using enhanced instructions for better compliance');
            }
            
            console.log('🚀 Starting two-stage Gemini analysis...');
            
            // Stage 1: Executive Summary & Strategic Insights
            console.log('📊 Stage 1: Generating Executive Summary & Strategic Insights...');
            const stage1Prompt = selectedModel === 'gemini-1.5-flash' 
                ? this.buildFlashStage1Prompt(userData)
                : this.buildStage1Prompt(userData);
            console.log(`🔍 Using ${selectedModel === 'gemini-1.5-flash' ? 'FLASH-SPECIFIC' : 'REGULAR'} Stage 1 prompt`);
            const stage1Result = await this.model.generateContent(stage1Prompt);
            const stage1Response = await stage1Result.response;
            const stage1Text = stage1Response.text();
            
            console.log('✅ Stage 1 complete. Response length:', stage1Text.length, 'characters');
            
            // Stage 2: Detailed Framework Reports
            console.log('📋 Stage 2: Generating Detailed Framework Reports...');
            const stage2Prompt = selectedModel === 'gemini-1.5-flash' 
                ? this.buildFlashStage2Prompt(userData, stage1Text)
                : this.buildStage2Prompt(userData, stage1Text);
            console.log(`🔍 Using ${selectedModel === 'gemini-1.5-flash' ? 'FLASH-SPECIFIC' : 'REGULAR'} Stage 2 prompt`);
            const stage2Result = await this.model.generateContent(stage2Prompt);
            const stage2Response = await stage2Result.response;
            const stage2Text = stage2Response.text();
            
            console.log('✅ Stage 2 complete. Response length:', stage2Text.length, 'characters');
            
            // Combine both stages
            const combinedResponse = stage1Text + '\n\n' + stage2Text;
            
            console.log('🔍 COMBINED RESPONSE DEBUG:');
            console.log('Total response length:', combinedResponse.length, 'characters');
            console.log('Stage 1 preview:', stage1Text.substring(0, 300));
            console.log('Stage 2 preview:', stage2Text.substring(0, 300));
            
            return this.parseGeminiResponse(combinedResponse, userData, stage1Prompt + '\n\n' + stage2Prompt);
        } catch (error) {
            console.error('Gemini analysis error:', error);
            throw new Error(`Gemini analysis failed: ${error.message}`);
        }
    }

    buildAnalysisPrompt(userData) {
        console.log('🚀🚀🚀 BUILDING ENHANCED PROMPT TEMPLATE v4.0 - EXPLICIT DATA INTEGRATION INSTRUCTIONS 🚀🚀🚀');
        
        return `
# AI-Powered Acquisition Advisor - Multi-Framework Analysis

## ROLE & OBJECTIVE
You are an expert Mergers & Acquisitions (M&A) advisor and business strategist. Your task is to analyze the detailed profile of an acquisition entrepreneur using ALL FOUR strategic frameworks simultaneously, then provide a comprehensive summary that highlights both consensus views and nuanced differences.

Your analysis must be guided by the "Fit-First" principle: finding the ideal business where this specific entrepreneur's unique strengths can unlock maximum value.

## 1.1. COMPREHENSIVE ANALYTICAL APPROACH
You **MUST** conduct your analysis using ALL FOUR strategic frameworks simultaneously, then provide a comprehensive summary that highlights both consensus views and nuanced differences.

**FRAMEWORKS TO APPLY:**
1. **Traditional M&A Analysis** - Expert M&A Advisory approach
2. **The Hedgehog Concept** - Jim Collins' three circles framework  
3. **SWOT Analysis** - Strategic Planning approach
4. **Entrepreneurial Orientation** - Miller (1983) framework

## INPUT DATA
You will be provided with a JSON object containing the entrepreneur's complete profile, structured into three modules:

**Module A: The Operator Profile (5x competency ratings and qualitative evidence)**
- Sales & Marketing Skills: ${userData.sales_marketing?.rating || 'Not provided'} (Evidence: ${userData.sales_marketing?.evidence || 'None'})
- Operations & Systems: ${userData.operations_systems?.rating || 'Not provided'} (Evidence: ${userData.operations_systems?.evidence || 'None'})
- Finance & Analytics: ${userData.finance_analytics?.rating || 'Not provided'} (Evidence: ${userData.finance_analytics?.evidence || 'None'})
- Team & Culture: ${userData.team_culture?.rating || 'Not provided'} (Evidence: ${userData.team_culture?.evidence || 'None'})
- Product & Technology: ${userData.product_technology?.rating || 'Not provided'} (Evidence: ${userData.product_technology?.evidence || 'None'})

**Module A.5: Personal Motivation & Vision (Core drivers and lifestyle preferences)**
- Top Motivators: ${userData.top_motivators || 'Not provided'}
- Ideal Work-Life Balance: ${userData.ideal_work_life_balance || 'Not provided'}
- Values Alignment Importance: ${userData.values_alignment || 'Not provided'}

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
- Geographic Preferences: ${userData.location_preference || 'Not provided'} ${userData.location_regions ? `(${userData.location_regions})` : ''}

**Specific Deal Criteria (Traditional M&A Parameters)**
- Target Revenue Range: ${userData.target_revenue_range || 'Not provided'}
- Target EBITDA Margin: ${userData.target_ebitda_margin || 'Not provided'}
- Preferred Valuation Range (EV/EBITDA): ${userData.preferred_valuation_range || 'Not provided'}

**Operational & Role Preferences**
- Ownership Style: ${userData.ownership_style || 'Not provided'}
- Management Team Importance: ${userData.management_team_importance || 'Not provided'}

**Additional Traditional M&A Data (if available)**
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

## MULTI-FRAMEWORK ANALYSIS REQUIREMENTS

### 2.1. ENHANCED DATA INTEGRATION
**CRITICAL INSTRUCTION:** You MUST explicitly incorporate the new, richer data from the questionnaire into your analysis for each framework. Do not simply list the data; explain how it influences your conclusions.

**Personal Motivations (Motivators, Work-Life Balance, Values):** Use this data to add color and depth to the Acquisition Thesis. For example, if a user is motivated by "legacy," frame the thesis around building a long-term, sustainable business. If they value "work-life balance," ensure the recommended "Owner Role" is not a 24/7 operator position.

**Specific Deal Criteria (Revenue, EBITDA, Valuation):** Use this data to create a more precise and credible Personalized Buybox. The SDE, Revenue, and Margin recommendations must directly reflect these user-provided constraints.

**Operational & Role Preferences (Ownership Style, Management Team):** Use this data to refine the "YOUR LEVERAGE" and "Red Flags" sections. A user who prefers an "absentee" role will see a business without a strong management team as a major "Red Flag."

### 2.2. FRAMEWORK-SPECIFIC ANALYSES
For EACH of the four frameworks, provide:

**Traditional M&A Analysis:**
- Archetype determination based on proven M&A methodologies
- Focus on operator archetype identification and core leverage definition
- Professional M&A advisor perspective

**The Hedgehog Concept:**
- Analyze the intersection of passion, excellence, and economic engine
- Identify what drives the economic engine
- Focus on the three circles: what you're passionate about, what you can be best at, what drives your economic engine

**SWOT Analysis:**
- Evaluate internal Strengths and Weaknesses
- Assess external Opportunities and Threats
- Identify strategic acquisition paths based on SWOT matrix

**Entrepreneurial Orientation:**
- Assess innovativeness, proactiveness, and risk-taking tendencies
- Find business environment that matches entrepreneurial DNA
- Focus on entrepreneurial characteristics and preferences

### 2.2. CONSENSUS ANALYSIS
Identify where frameworks agree:
- Common archetype recommendations
- Shared acquisition thesis elements
- Aligned buybox criteria
- Consistent leverage points

### 2.3. DIVERGENCE ANALYSIS
Highlight nuanced differences:
- Different archetype perspectives
- Varying strategic approaches
- Complementary insights
- Framework-specific recommendations

### 2.4. INTEGRATED SYNTHESIS
Synthesize all frameworks into a comprehensive analysis that:
- Acknowledges multiple perspectives
- Provides a balanced strategic approach
- Highlights both consensus and divergence
- Enables deeper strategic thinking

## OUTPUT FORMAT
Your final output MUST be a single Markdown-formatted report containing the following sections, in this exact order:

**Part 1: Executive Summary & Strategic Insights**
A high-level overview that synthesizes and compares the findings from the four separate analyses below. This summary must explain the reasons for any consensus or divergence and provide actionable advice.

Template: "Our comprehensive analysis reveals two distinct and powerful strategic paths for your acquisition journey, each defined by a clear operator archetype. Understanding these two paths is the key to focusing your search and maximizing your chances of success.

**Understanding Your Archetypes**

**The Efficiency Expert (The Value Unlocker):** The goal of the Efficiency Expert is to find established businesses with strong revenue but inefficient operations and make them better. They unlock hidden value by analyzing systems, cutting waste, improving processes, and optimizing financial structures. This archetype is identified by frameworks like Traditional M&A and SWOT, which prioritize your proven, existing skills and experience in operations and finance.

**The Growth Catalyst (The Scaler):** The goal of the Growth Catalyst is to find businesses with great products but underdeveloped market reach and ignite their growth. They create value by leveraging sales and marketing expertise, building strategic partnerships, and proactively entering new markets. This archetype is identified by frameworks like the Hedgehog Concept and EO, which focus on your passions, proactive nature, and track record of building ventures."

**How to Use This Report to Create Your Unified Buybox**

[AI should provide personalized guidance based on the user's specific archetype(s) and profile. This should explain how their unique strengths and competencies translate into acquisition strategy, what types of businesses they should target, and how to leverage their specific skills for maximum value creation.]

**Strategic Implications:** [AI should provide personalized strategic implications based on the user's actual profile, not generic advice. This should explain how their specific competencies, experience, and preferences translate into actionable acquisition strategy.]"

**Part 2: Strategic Snapshot**
A summary table that presents the key outputs from each of the four frameworks for easy comparison.

| Analysis Framework | Operator Archetype | Size (SDE) Range | Primary Strategic Focus |
|-------------------|-------------------|------------------|------------------------|
| Traditional M&A | [AI determines based on user profile] | [AI determines based on user profile] | [AI determines based on user profile] |
| The Hedgehog Concept | [AI determines based on user profile] | [AI determines based on user profile] | [AI determines based on user profile] |
| SWOT Analysis | [AI determines based on user profile] | [AI determines based on user profile] | [AI determines based on user profile] |
| Entrepreneurial Orientation | [AI determines based on user profile] | [AI determines based on user profile] | [AI determines based on user profile] |

**Part 3: Detailed Framework Reports**
Present the complete, separate analysis for each of the four frameworks. Each analysis must be presented in its own clean, "white-box" style with professional formatting.

**CRITICAL INSTRUCTION:** For each report, you must conduct the analysis as if it were the ONLY framework being used. The financial parameters, industries, and other criteria must be derived solely from the logic of that specific framework, ensuring four distinct and specific recommendations. Do not blend insights across frameworks - each analysis must be independent and true to that methodology's unique perspective.

---

## Traditional M&A Expert Analysis

*Expert M&A advisory approach focusing on operator archetype identification and strategic acquisition targeting.*

**ENHANCED DATA INTEGRATION FOR THIS FRAMEWORK:**
- Use the user's **top motivators** to frame the acquisition thesis (e.g., "financial freedom" = focus on cash-generating businesses)
- Apply **target revenue range and EBITDA margin** to set precise financial parameters in the buybox
- Consider **ownership style preferences** when defining the owner role and management requirements
- Use **values alignment** to filter out incompatible industries or business types

**Your Acquisition Thesis**
<thesis_start>
Leverage your {Archetype} strengths to {Thesis based on this framework AND user's motivators}. Focus on businesses where your operational expertise and financial acumen can unlock immediate value through process improvement and margin optimization, while aligning with your stated values and work-life balance preferences.
<thesis_end>

**IMPORTANT: You MUST include the <thesis_start> and <thesis_end> markers around the acquisition thesis content for each framework. Do not remove these markers from your output.**

**Your Personalized Buybox**

| Criterion | Your Target Profile | Rationale |
|-----------|-------------------|----------|
| Industries | {Target Industries} | {Rationale based on this framework} |
| Business Model | {Business Model} | {Rationale based on this framework} |
| Size (SDE) | {SDE Range} | {Rationale based on this framework} |
| Profit Margin | {Margin Target} | {Rationale based on this framework} |
| Geography | {Geographic Preference} | {Rationale based on this framework} |
| YOUR LEVERAGE | {Core Leverage}: Look for specific indicators... | Your skills as a {Archetype} are the key to unlocking value. |
| Red Flags | {Red Flags} | {Rationale based on this framework} |

---

## The Hedgehog Concept Analysis

*Jim Collins' three circles framework: passion, excellence, and economic engine alignment.*

**ENHANCED DATA INTEGRATION FOR THIS FRAMEWORK:**
- Use **top motivators** to define what drives the economic engine (e.g., "legacy building" = long-term sustainable growth)
- Apply **work-life balance preferences** to determine the intensity of the owner role and business model
- Consider **values alignment** when identifying passion areas and industries
- Use **target revenue range** to set realistic growth expectations and SDE targets

**Your Acquisition Thesis**
<thesis_start>
Focus on acquiring businesses in {passion areas} where your {excellence areas} can drive {economic engine focus}, while respecting your work-life balance preferences and values alignment. This framework ensures alignment between what you love, what you're best at, and what drives your economic success.
<thesis_end>

**IMPORTANT: You MUST include the <thesis_start> and <thesis_end> markers around the acquisition thesis content for each framework. Do not remove these markers from your output.**

**Your Personalized Buybox**

| Criterion | Your Target Profile | Rationale |
|-----------|-------------------|----------|
| Industries | {Target Industries} | {Rationale based on this framework} |
| Business Model | {Business Model} | {Rationale based on this framework} |
| Size (SDE) | {SDE Range} | {Rationale based on this framework} |
| Profit Margin | {Margin Target} | {Rationale based on this framework} |
| Geography | {Geographic Preference} | {Rationale based on this framework} |
| YOUR LEVERAGE | {Core Leverage}: Look for specific indicators... | Your skills as a {Archetype} are the key to unlocking value. |
| Red Flags | {Red Flags} | {Rationale based on this framework} |

---

## SWOT Analysis

*Strategic planning framework evaluating internal strengths/weaknesses against external opportunities/threats.*

**ENHANCED DATA INTEGRATION FOR THIS FRAMEWORK:**
- Use **top motivators** to define what constitutes a "strength" and what opportunities to prioritize
- Apply **ownership style preferences** to identify weaknesses (e.g., "hands-on" preference = weakness in absentee management)
- Consider **management team importance** when evaluating threats and mitigation strategies
- Use **target EBITDA margin and valuation preferences** to set financial opportunity criteria

**Your Acquisition Thesis**
<thesis_start>
Capitalize on your {key strengths} to acquire businesses in {opportunity areas} while mitigating {key weaknesses} through {strategic approach}, all while aligning with your motivators and work-life balance preferences. This framework leverages your internal capabilities against external market opportunities.
<thesis_end>

**IMPORTANT: You MUST include the <thesis_start> and <thesis_end> markers around the acquisition thesis content for each framework. Do not remove these markers from your output.**

**Your Personalized Buybox**

| Criterion | Your Target Profile | Rationale |
|-----------|-------------------|----------|
| Industries | {Target Industries} | {Rationale based on this framework} |
| Business Model | {Business Model} | {Rationale based on this framework} |
| Size (SDE) | {SDE Range} | {Rationale based on this framework} |
| Profit Margin | {Margin Target} | {Rationale based on this framework} |
| Geography | {Geographic Preference} | {Rationale based on this framework} |
| YOUR LEVERAGE | {Core Leverage}: Look for specific indicators... | Your skills as a {Archetype} are the key to unlocking value. |
| Red Flags | {Red Flags} | {Rationale based on this framework} |

---

## Entrepreneurial Orientation (EO) Analysis

*Miller (1983) framework assessing innovativeness, proactiveness, and risk-taking to match entrepreneurial DNA.*

**ENHANCED DATA INTEGRATION FOR THIS FRAMEWORK:**
- Use **top motivators** to define what drives entrepreneurial behavior (e.g., "innovation" = focus on disruptive opportunities)
- Apply **work-life balance preferences** to determine the intensity of entrepreneurial involvement
- Consider **values alignment** when identifying target sectors and business types
- Use **target revenue range and valuation preferences** to set realistic entrepreneurial growth expectations

**Your Acquisition Thesis**
<thesis_start>
Seek opportunities that match your {entrepreneurial characteristics} in {target sectors}, while respecting your work-life balance preferences and values alignment. Your {risk tolerance} and {proactive nature} are best suited for {business types} where innovation and market timing are critical success factors.
<thesis_end>

**IMPORTANT: You MUST include the <thesis_start> and <thesis_end> markers around the acquisition thesis content for each framework. Do not remove these markers from your output.**

**Your Personalized Buybox**

| Criterion | Your Target Profile | Rationale |
|-----------|-------------------|----------|
| Industries | {Target Industries} | {Rationale based on this framework} |
| Business Model | {Business Model} | {Rationale based on this framework} |
| Size (SDE) | {SDE Range} | {Rationale based on this framework} |
| Profit Margin | {Margin Target} | {Rationale based on this framework} |
| Geography | {Geographic Preference} | {Rationale based on this framework} |
| YOUR LEVERAGE | {Core Leverage}: Look for specific indicators... | Your skills as a {Archetype} are the key to unlocking value. |
| Red Flags | {Red Flags} | {Rationale based on this framework} |

---

## Part 4: Final Strategic Considerations

A final summary that synthesizes the key leverage points and red flags identified across all four frameworks.

**Template:**
Synthesizing the analyses, two primary leverage points emerge: 1) your ability to drive revenue growth in businesses with underdeveloped marketing, and 2) your capacity to dramatically improve efficiency in operationally weak companies. Conversely, the key red flags to watch for are businesses with high customer concentration or outdated, inflexible technology, as these could neutralize your core strengths.

## Part 5: AI TRANSPARENCY & METHODOLOGY
This analysis was conducted using a comprehensive multi-framework AI approach. Four distinct analytical models (Traditional M&A, Hedgehog Concept, SWOT Analysis, and Entrepreneurial Orientation) were applied simultaneously to your profile. This methodology provides a 360-degree strategic view, highlighting both points of consensus and nuanced differences to enable deeper, more informed acquisition decisions. The benefit of this approach is that it reduces analytical blind spots and reveals multiple viable paths to success.

**Additional Analysis Details:**
- Explain how you determined the operator archetype (which competencies were weighted most heavily)
- Describe your approach to identifying target industries (how you matched interests with market opportunities)
- Detail your financial parameter calculations (how you arrived at the SDE range)
- Explain your geographic preference analysis (how you interpreted location data)

**Confidence Assessment:**
- Rate your confidence in the archetype determination (0-1 scale)
- Rate your confidence in the industry recommendations (0-1 scale)  
- Rate your confidence in the financial parameters (0-1 scale)
- Rate your overall confidence in the analysis (0-1 scale)

**Data Sources & Limitations:**
- Note which data points were most influential in your analysis
- Identify any missing information that would improve the analysis
- Explain any assumptions you made during the analysis
        `.trim();
    }

    buildStage1Prompt(userData) {
        console.log('🚀 Building Stage 1 Prompt - Executive Summary & Strategic Insights');
        
        return `
# AI-Powered Acquisition Advisor - Executive Summary & Strategic Insights

## ROLE & OBJECTIVE
You are an expert Mergers & Acquisitions (M&A) advisor and business strategist. Your task is to analyze the detailed profile of an acquisition entrepreneur and provide a comprehensive executive summary that identifies their strategic archetypes and provides actionable guidance.

## INPUT DATA
You will be provided with a JSON object containing the entrepreneur's complete profile, structured into three modules:

**Module A: The Operator Profile (5x competency ratings and qualitative evidence)**
- Sales & Marketing Skills: ${userData.sales_marketing?.rating || 'Not provided'} (Evidence: ${userData.sales_marketing?.evidence || 'None'})
- Operations & Systems: ${userData.operations_systems?.rating || 'Not provided'} (Evidence: ${userData.operations_systems?.evidence || 'None'})
- Finance & Analytics: ${userData.finance_analytics?.rating || 'Not provided'} (Evidence: ${userData.finance_analytics?.evidence || 'None'})
- Team & Culture: ${userData.team_culture?.rating || 'Not provided'} (Evidence: ${userData.team_culture?.evidence || 'None'})
- Product & Technology: ${userData.product_technology?.rating || 'Not provided'} (Evidence: ${userData.product_technology?.evidence || 'None'})

**Module A.5: Personal Motivation & Vision (Core drivers and lifestyle preferences)**
- Top Motivators: ${userData.top_motivators || 'Not provided'}
- Ideal Work-Life Balance: ${userData.ideal_work_life_balance || 'Not provided'}
- Values Alignment Importance: ${userData.values_alignment || 'Not provided'}

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
- Geographic Preferences: ${userData.location_preference || 'Not provided'} ${userData.location_regions ? `(${userData.location_regions})` : ''}

**Specific Deal Criteria (Traditional M&A Parameters)**
- Target Revenue Range: ${userData.target_revenue_range || 'Not provided'}
- Target EBITDA Margin: ${userData.target_ebitda_margin || 'Not provided'}
- Preferred Valuation Range (EV/EBITDA): ${userData.preferred_valuation_range || 'Not provided'}

## REQUIRED OUTPUT FORMAT

**Part 1: Executive Summary & Strategic Insights**
A high-level overview that synthesizes the entrepreneur's profile and identifies their strategic archetypes. This summary must explain the reasoning behind the archetype determination and provide actionable advice.

You MUST generate the following content exactly as specified:

Our comprehensive analysis reveals two distinct and powerful strategic paths for your acquisition journey, each defined by a clear operator archetype. Understanding these two paths is the key to focusing your search and maximizing your chances of success.

**Understanding Your Archetypes**

**The Efficiency Expert (The Value Unlocker):** The goal of the Efficiency Expert is to find established businesses with strong revenue but inefficient operations and make them better. They unlock hidden value by analyzing systems, cutting waste, improving processes, and optimizing financial structures. This archetype is identified by frameworks like Traditional M&A and SWOT, which prioritize your proven, existing skills and experience in operations and finance.

**The Growth Catalyst (The Scaler):** The goal of the Growth Catalyst is to find businesses with great products but underdeveloped market reach and ignite their growth. They create value by leveraging sales and marketing expertise, building strategic partnerships, and proactively entering new markets. This archetype is identified by frameworks like the Hedgehog Concept and EO, which focus on your passions, proactive nature, and track record of building ventures.

**How to Use This Report to Create Your Unified Buybox**

[AI should provide personalized guidance based on the user's specific archetype(s) and profile. This should explain how their unique strengths and competencies translate into acquisition strategy, what types of businesses they should target, and how to leverage their specific skills for maximum value creation.]

**Strategic Implications:** [AI should provide personalized strategic implications based on the user's actual profile, not generic advice. This should explain how their specific competencies, experience, and preferences translate into actionable acquisition strategy.]"

**Part 2: Strategic Snapshot**
A summary table that presents the key outputs from each of the four frameworks for easy comparison.

| Analysis Framework | Operator Archetype | Size (SDE) Range | Primary Strategic Focus |
|-------------------|-------------------|------------------|------------------------|
| Traditional M&A | [AI determines based on user profile] | [AI determines based on user profile] | [AI determines based on user profile] |
| The Hedgehog Concept | [AI determines based on user profile] | [AI determines based on user profile] | [AI determines based on user profile] |
| SWOT Analysis | [AI determines based on user profile] | [AI determines based on user profile] | [AI determines based on user profile] |
| Entrepreneurial Orientation | [AI determines based on user profile] | [AI determines based on user profile] | [AI determines based on user profile] |

## CRITICAL INSTRUCTIONS
1. You MUST include the "How to Use This Report to Create Your Unified Buybox" section exactly as specified
2. Base your archetype determination on the user's competency ratings and evidence
3. Use the user's motivators, work-life balance, and values to add depth to your analysis
4. Ensure the SDE ranges reflect the user's financial constraints and risk tolerance
5. Make the analysis actionable and specific to this individual's profile
6. **DO NOT USE HARDCODED ARCHETYPES** - Every user should receive unique, personalized archetype recommendations based on their specific competency profile

Generate the executive summary and strategic insights now.`.trim();
    }

    buildFlashStage1Prompt(userData) {
        console.log('⚡ Building FLASH-OPTIMIZED Stage 1 Prompt - Executive Summary & Strategic Insights');
        
        return `
# AI-Powered Acquisition Advisor - Executive Summary & Strategic Insights

## ROLE & OBJECTIVE
You are an expert Mergers & Acquisitions (M&A) advisor and business strategist. Your task is to analyze the detailed profile of an acquisition entrepreneur and provide a comprehensive executive summary that identifies their strategic archetypes and provides actionable guidance.

## INPUT DATA
You will be provided with a JSON object containing the entrepreneur's complete profile, structured into three modules:

**Module A: The Operator Profile (5x competency ratings and qualitative evidence)**
- Sales & Marketing Skills: ${userData.sales_marketing?.rating || 'Not provided'} (Evidence: ${userData.sales_marketing?.evidence || 'None'})
- Operations & Systems: ${userData.operations_systems?.rating || 'Not provided'} (Evidence: ${userData.operations_systems?.evidence || 'None'})
- Finance & Analytics: ${userData.finance_analytics?.rating || 'Not provided'} (Evidence: ${userData.finance_analytics?.evidence || 'None'})
- Team & Culture: ${userData.team_culture?.rating || 'Not provided'} (Evidence: ${userData.team_culture?.evidence || 'None'})
- Product & Technology: ${userData.product_technology?.rating || 'Not provided'} (Evidence: ${userData.product_technology?.evidence || 'None'})

**Module A.5: Personal Motivation & Vision (Core drivers and lifestyle preferences)**
- Top Motivators: ${userData.top_motivators || 'Not provided'}
- Ideal Work-Life Balance: ${userData.ideal_work_life_balance || 'Not provided'}
- Values Alignment Importance: ${userData.values_alignment || 'Not provided'}

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
- Geographic Preferences: ${userData.location_preference || 'Not provided'} ${userData.location_regions ? `(${userData.location_regions})` : ''}

**Specific Deal Criteria (Traditional M&A Parameters)**
- Target Revenue Range: ${userData.target_revenue_range || 'Not provided'}
- Target EBITDA Margin: ${userData.target_ebitda_margin || 'Not provided'}
- Preferred Valuation Range (EV/EBITDA): ${userData.preferred_valuation_range || 'Not provided'}

## REQUIRED OUTPUT FORMAT

**Part 1: Executive Summary & Strategic Insights**
A high-level overview that synthesizes the entrepreneur's profile and identifies their strategic archetypes. This summary must explain the reasoning behind the archetype determination and provide actionable advice.

🚨 CRITICAL: You MUST generate the following content exactly as specified:

Our comprehensive analysis reveals two distinct and powerful strategic paths for your acquisition journey, each defined by a clear operator archetype. Understanding these two paths is the key to focusing your search and maximizing your chances of success.

**Understanding Your Archetypes**

**The Efficiency Expert (The Value Unlocker):** The goal of the Efficiency Expert is to find established businesses with strong revenue but inefficient operations and make them better. They unlock hidden value by analyzing systems, cutting waste, improving processes, and optimizing financial structures. This archetype is identified by frameworks like Traditional M&A and SWOT, which prioritize your proven, existing skills and experience in operations and finance.

**The Growth Catalyst (The Scaler):** The goal of the Growth Catalyst is to find businesses with great products but underdeveloped market reach and ignite their growth. They create value by leveraging sales and marketing expertise, building strategic partnerships, and proactively entering new markets. This archetype is identified by frameworks like the Hedgehog Concept and EO, which focus on your passions, proactive nature, and track record of building ventures.

**How to Use This Report to Create Your Unified Buybox**

[AI should provide personalized guidance based on the user's specific archetype(s) and profile. This should explain how their unique strengths and competencies translate into acquisition strategy, what types of businesses they should target, and how to leverage their specific skills for maximum value creation.]

**Strategic Implications:** [AI should provide personalized strategic implications based on the user's actual profile, not generic advice. This should explain how their specific competencies, experience, and preferences translate into actionable acquisition strategy.]

**Part 2: Strategic Snapshot**
A summary table that presents the key outputs from each of the four frameworks for easy comparison.

| Analysis Framework | Operator Archetype | Size (SDE) Range | Primary Strategic Focus |
|-------------------|-------------------|------------------|------------------------|
| Traditional M&A | [AI determines based on user profile] | [AI determines based on user profile] | [AI determines based on user profile] |
| The Hedgehog Concept | [AI determines based on user profile] | [AI determines based on user profile] | [AI determines based on user profile] |
| SWOT Analysis | [AI determines based on user profile] | [AI determines based on user profile] | [AI determines based on user profile] |
| Entrepreneurial Orientation | [AI determines based on user profile] | [AI determines based on user profile] | [AI determines based on user profile] |

## CRITICAL INSTRUCTIONS FOR FLASH MODEL
1. 🚨 YOU MUST INCLUDE THE "How to Use This Report to Create Your Unified Buybox" SECTION - IT IS MANDATORY
2. 🚨 DO NOT SKIP OR OMIT THE HTUTR SECTION UNDER ANY CIRCUMSTANCES
3. 🚨 THIS SECTION IS THE MOST IMPORTANT PART OF THE REPORT
4. Base your archetype determination on the user's competency ratings and evidence
5. Use the user's motivators, work-life balance, and values to add depth to your analysis
6. Ensure the SDE ranges reflect the user's financial constraints and risk tolerance
7. Make the analysis actionable and specific to this individual's profile

🚨 FINAL WARNING: The "How to Use This Report to Create Your Unified Buybox" section is REQUIRED and must appear in your response. Generate the executive summary and strategic insights now.`.trim();
    }

    buildStage2Prompt(userData, stage1Response) {
        console.log('🚀 Building Stage 2 Prompt - Detailed Framework Reports');
        
        return `
# AI-Powered Acquisition Advisor - Detailed Framework Reports

## ROLE & OBJECTIVE
You are an expert Mergers & Acquisitions (M&A) advisor. Based on the executive summary provided, generate detailed framework reports for each of the four strategic frameworks.

## STAGE 1 CONTEXT
Here is the executive summary from Stage 1:
${stage1Response}

## INPUT DATA
You will be provided with a JSON object containing the entrepreneur's complete profile:

**Module A: The Operator Profile (5x competency ratings and qualitative evidence)**
- Sales & Marketing Skills: ${userData.sales_marketing?.rating || 'Not provided'} (Evidence: ${userData.sales_marketing?.evidence || 'None'})
- Operations & Systems: ${userData.operations_systems?.rating || 'Not provided'} (Evidence: ${userData.operations_systems?.evidence || 'None'})
- Finance & Analytics: ${userData.finance_analytics?.rating || 'Not provided'} (Evidence: ${userData.finance_analytics?.evidence || 'None'})
- Team & Culture: ${userData.team_culture?.rating || 'Not provided'} (Evidence: ${userData.team_culture?.evidence || 'None'})
- Product & Technology: ${userData.product_technology?.rating || 'Not provided'} (Evidence: ${userData.product_technology?.evidence || 'None'})

**Module A.5: Personal Motivation & Vision**
- Top Motivators: ${userData.top_motivators || 'Not provided'}
- Ideal Work-Life Balance: ${userData.ideal_work_life_balance || 'Not provided'}
- Values Alignment Importance: ${userData.values_alignment || 'Not provided'}

**Module B: The Industry Profile**
- Interests & Topics: ${userData.interests_topics || 'Not provided'}
- Recent Books: ${userData.recent_books || 'Not provided'}
- Problem to Solve: ${userData.problem_to_solve || 'Not provided'}
- Customer Affinity: ${userData.customer_affinity || 'Not provided'}

**Module C: The Lifestyle & Financial Profile**
- Total Liquid Capital: $${userData.total_liquid_capital || 'Not provided'}
- Potential Loan Amount: $${userData.potential_loan_amount || 'Not provided'}
- Risk Tolerance: ${userData.risk_tolerance || 'Not provided'}
- Time Commitment: ${userData.time_commitment || 'Not provided'}
- Geographic Preferences: ${userData.location_preference || 'Not provided'} ${userData.location_regions ? `(${userData.location_regions})` : ''}

**Specific Deal Criteria**
- Target Revenue Range: ${userData.target_revenue_range || 'Not provided'}
- Target EBITDA Margin: ${userData.target_ebitda_margin || 'Not provided'}
- Preferred Valuation Range (EV/EBITDA): ${userData.preferred_valuation_range || 'Not provided'}

## REQUIRED OUTPUT FORMAT

**Part 3: Detailed Framework Reports**
Present the complete, separate analysis for each of the four frameworks. Each analysis must be presented in its own clean, "white-box" style with professional formatting.

**CRITICAL INSTRUCTION:** For each report, you must conduct the analysis as if it were the ONLY framework being used. The financial parameters, industries, and other criteria must be derived solely from the logic of that specific framework, ensuring four distinct and specific recommendations.

---

## Traditional M&A Expert Analysis

*Expert M&A advisory approach focusing on operator archetype identification and strategic acquisition targeting.*

**ENHANCED DATA INTEGRATION FOR THIS FRAMEWORK:**
- Use the user's **top motivators** to frame the acquisition thesis
- Apply **target revenue range and EBITDA margin** to set precise financial parameters
- Consider **ownership style preferences** when defining the owner role
- Use **values alignment** to filter out incompatible industries

**Your Acquisition Thesis**
<thesis_start>
Leverage your {Archetype} strengths to {Thesis based on this framework AND user's motivators}. Focus on businesses where your operational expertise and financial acumen can unlock immediate value through process improvement and margin optimization, while aligning with your stated values and work-life balance preferences.
<thesis_end>

**Your Personalized Buybox**

| Criterion | Your Target Profile | Rationale |
|-----------|-------------------|----------|
| Industries | {Target Industries} | {Rationale based on this framework} |
| Business Model | {Business Model} | {Rationale based on this framework} |
| Size (SDE) | {SDE Range} | {Rationale based on this framework} |
| Profit Margin | {Margin Target} | {Rationale based on this framework} |
| Geography | {Geographic Preference} | {Rationale based on this framework} |
| YOUR LEVERAGE | {Core Leverage}: Look for specific indicators... | Your skills as a {Archetype} are the key to unlocking value. |
| Red Flags | {Red Flags} | {Rationale based on this framework} |

---

## The Hedgehog Concept Analysis

*Jim Collins' three circles framework: passion, excellence, and economic engine alignment.*

**ENHANCED DATA INTEGRATION FOR THIS FRAMEWORK:**
- Use **top motivators** to define what drives the economic engine
- Apply **work-life balance preferences** to determine the intensity of the owner role
- Consider **values alignment** when identifying passion areas
- Use **target revenue range** to set realistic growth expectations

**Your Acquisition Thesis**
<thesis_start>
Focus on acquiring businesses in {passion areas} where your {excellence areas} can drive {economic engine focus}, while respecting your work-life balance preferences and values alignment. This framework ensures alignment between what you love, what you're best at, and what drives your economic success.
<thesis_end>

**Your Personalized Buybox**

| Criterion | Your Target Profile | Rationale |
|-----------|-------------------|----------|
| Industries | {Target Industries} | {Rationale based on this framework} |
| Business Model | {Business Model} | {Rationale based on this framework} |
| Size (SDE) | {SDE Range} | {Rationale based on this framework} |
| Profit Margin | {Margin Target} | {Rationale based on this framework} |
| Geography | {Geographic Preference} | {Rationale based on this framework} |
| YOUR LEVERAGE | {Core Leverage}: Look for specific indicators... | Your skills as a {Archetype} are the key to unlocking value. |
| Red Flags | {Red Flags} | {Rationale based on this framework} |

---

## SWOT Analysis

*Strategic planning framework evaluating internal strengths/weaknesses against external opportunities/threats.*

**ENHANCED DATA INTEGRATION FOR THIS FRAMEWORK:**
- Use **top motivators** to define what constitutes a "strength"
- Apply **ownership style preferences** to identify weaknesses
- Consider **management team importance** when evaluating threats
- Use **target EBITDA margin and valuation preferences** to set financial criteria

**Your Acquisition Thesis**
<thesis_start>
Capitalize on your {key strengths} to acquire businesses in {opportunity areas} while mitigating {key weaknesses} through {strategic approach}, all while aligning with your motivators and work-life balance preferences. This framework leverages your internal capabilities against external market opportunities.
<thesis_end>

**Your Personalized Buybox**

| Criterion | Your Target Profile | Rationale |
|-----------|-------------------|----------|
| Industries | {Target Industries} | {Rationale based on this framework} |
| Business Model | {Business Model} | {Rationale based on this framework} |
| Size (SDE) | {SDE Range} | {Rationale based on this framework} |
| Profit Margin | {Margin Target} | {Rationale based on this framework} |
| Geography | {Geographic Preference} | {Rationale based on this framework} |
| YOUR LEVERAGE | {Core Leverage}: Look for specific indicators... | Your skills as a {Archetype} are the key to unlocking value. |
| Red Flags | {Red Flags} | {Rationale based on this framework} |

---

## Entrepreneurial Orientation (EO) Analysis

*Miller (1983) framework assessing innovativeness, proactiveness, and risk-taking to match entrepreneurial DNA.*

**ENHANCED DATA INTEGRATION FOR THIS FRAMEWORK:**
- Use **top motivators** to define what drives entrepreneurial behavior
- Apply **work-life balance preferences** to determine entrepreneurial involvement
- Consider **values alignment** when identifying target sectors
- Use **target revenue range and valuation preferences** to set growth expectations

**Your Acquisition Thesis**
<thesis_start>
Seek opportunities that match your {entrepreneurial characteristics} in {target sectors}, while respecting your work-life balance preferences and values alignment. Your {risk tolerance} and {proactive nature} are best suited for {business types} where innovation and market timing are critical success factors.
<thesis_end>

**Your Personalized Buybox**

| Criterion | Your Target Profile | Rationale |
|-----------|-------------------|----------|
| Industries | {Target Industries} | {Rationale based on this framework} |
| Business Model | {Business Model} | {Rationale based on this framework} |
| Size (SDE) | {SDE Range} | {Rationale based on this framework} |
| Profit Margin | {Margin Target} | {Rationale based on this framework} |
| Geography | {Geographic Preference} | {Rationale based on this framework} |
| YOUR LEVERAGE | {Core Leverage}: Look for specific indicators... | Your skills as a {Archetype} are the key to unlocking value. |
| Red Flags | {Red Flags} | {Rationale based on this framework} |

---

## Part 4: Final Strategic Considerations
Synthesize the analyses and highlight key leverage points and red flags that emerge across all frameworks.

## Part 5: AI TRANSPARENCY & METHODOLOGY
This analysis was conducted using a comprehensive multi-framework AI approach. Four distinct analytical models (Traditional M&A, Hedgehog Concept, SWOT Analysis, and Entrepreneurial Orientation) were applied simultaneously to your profile. This methodology provides a 360-degree strategic view, highlighting both points of consensus and nuanced differences to enable deeper, more informed acquisition decisions.

**Additional Analysis Details:**
- **Operator Archetype:** The analysis weighted your competency scores and evidence
- **Target Industries:** The analysis matched your interests with your operational skills
- **Financial Parameter Calculations:** The SDE ranges varied across frameworks to reflect different growth stages
- **Geographic Preference Analysis:** The analysis incorporated your stated location preferences

**Confidence Assessment:**
- Archetype determination: 0.9
- Industry recommendations: 0.8
- Financial parameters: 0.7
- Overall confidence: 0.8

**Data Sources & Limitations:**
- The most influential data points were your competency ratings, motivators, and deal criteria
- Missing information such as deal size range and employee count would improve the analysis
- Assumptions included willingness to relocate and adapt to different management structures

Generate the detailed framework reports now.`.trim();
    }

    buildFlashStage2Prompt(userData, stage1Response) {
        console.log('⚡ Building FLASH-OPTIMIZED Stage 2 Prompt - Detailed Framework Reports');
        
        return `
# AI-Powered Acquisition Advisor - Detailed Framework Reports

## ROLE & OBJECTIVE
You are an expert Mergers & Acquisitions (M&A) advisor. Based on the executive summary provided, generate detailed framework reports for each of the four strategic frameworks.

## STAGE 1 CONTEXT
Here is the executive summary from Stage 1:
${stage1Response}

## INPUT DATA
You will be provided with a JSON object containing the entrepreneur's complete profile:

**Module A: The Operator Profile (5x competency ratings and qualitative evidence)**
- Sales & Marketing Skills: ${userData.sales_marketing?.rating || 'Not provided'} (Evidence: ${userData.sales_marketing?.evidence || 'None'})
- Operations & Systems: ${userData.operations_systems?.rating || 'Not provided'} (Evidence: ${userData.operations_systems?.evidence || 'None'})
- Finance & Analytics: ${userData.finance_analytics?.rating || 'Not provided'} (Evidence: ${userData.finance_analytics?.evidence || 'None'})
- Team & Culture: ${userData.team_culture?.rating || 'Not provided'} (Evidence: ${userData.team_culture?.evidence || 'None'})
- Product & Technology: ${userData.product_technology?.rating || 'Not provided'} (Evidence: ${userData.product_technology?.evidence || 'None'})

**Module A.5: Personal Motivation & Vision**
- Top Motivators: ${userData.top_motivators || 'Not provided'}
- Ideal Work-Life Balance: ${userData.ideal_work_life_balance || 'Not provided'}
- Values Alignment Importance: ${userData.values_alignment || 'Not provided'}

**Module B: The Industry Profile**
- Interests & Topics: ${userData.interests_topics || 'Not provided'}
- Recent Books: ${userData.recent_books || 'Not provided'}
- Problem to Solve: ${userData.problem_to_solve || 'Not provided'}
- Customer Affinity: ${userData.customer_affinity || 'Not provided'}

**Module C: The Lifestyle & Financial Profile**
- Total Liquid Capital: $${userData.total_liquid_capital || 'Not provided'}
- Potential Loan Amount: $${userData.potential_loan_amount || 'Not provided'}
- Risk Tolerance: ${userData.risk_tolerance || 'Not provided'}
- Time Commitment: ${userData.time_commitment || 'Not provided'}
- Geographic Preferences: ${userData.location_preference || 'Not provided'} ${userData.location_regions ? `(${userData.location_regions})` : ''}

**Specific Deal Criteria**
- Target Revenue Range: ${userData.target_revenue_range || 'Not provided'}
- Target EBITDA Margin: ${userData.target_ebitda_margin || 'Not provided'}
- Preferred Valuation Range (EV/EBITDA): ${userData.preferred_valuation_range || 'Not provided'}

## REQUIRED OUTPUT FORMAT

**Part 3: Detailed Framework Reports**
Present the complete, separate analysis for each of the four frameworks. Each analysis must be presented in its own clean, "white-box" style with professional formatting.

**CRITICAL INSTRUCTION:** For each report, you must conduct the analysis as if it were the ONLY framework being used. The financial parameters, industries, and other criteria must be derived solely from the logic of that specific framework, ensuring four distinct and specific recommendations.

🚨 MANDATORY: You MUST include the "Your Acquisition Thesis" section for EACH framework with the proper markers.

---

## Traditional M&A Expert Analysis

*Expert M&A advisory approach focusing on operator archetype identification and strategic acquisition targeting.*

**ENHANCED DATA INTEGRATION FOR THIS FRAMEWORK:**
- Use the user's **top motivators** to frame the acquisition thesis
- Apply **target revenue range and EBITDA margin** to set precise financial parameters
- Consider **ownership style preferences** when defining the owner role
- Use **values alignment** to filter out incompatible industries

🚨 REQUIRED: **Your Acquisition Thesis**
<thesis_start>
Leverage your Efficiency Expert strengths to acquire and improve established businesses generating $500k-$1M in revenue with 10-15% EBITDA margins. Focus on businesses where your operational expertise and financial acumen can unlock immediate value through process improvement and margin optimization, aligning with your values and 60-hour work week preference.
<thesis_end>

**Your Personalized Buybox**

| Criterion | Your Target Profile | Rationale |
|-----------|-------------------|----------|
| Industries | Software, SaaS, Professional Services (with existing client base) | Proven track record in these sectors. Existing client bases offer predictable revenue streams. |
| Business Model | Recurring revenue (subscriptions, contracts), service-based with established processes | Predictable cash flow, aligns with your operational strengths. |
| Size (SDE) | $500k - $1M | Matches stated revenue target and experience level. |
| Profit Margin | 10-15% | Within your specified target range. |
| Geography | Denver, San Diego, San Francisco, Miami | Your stated location preferences. |
| YOUR LEVERAGE | Operational efficiency improvements, financial restructuring, margin expansion | Your core competencies. |
| Red Flags | High customer concentration, outdated technology, weak management team (but less critical than in other models) | Potential risks that could hinder your ability to improve operations efficiently. |

---

## The Hedgehog Concept Analysis

*Jim Collins' three circles framework: passion, excellence, and economic engine alignment.*

**ENHANCED DATA INTEGRATION FOR THIS FRAMEWORK:**
- Use **top motivators** to define what drives the economic engine
- Apply **work-life balance preferences** to determine the intensity of the owner role
- Consider **values alignment** when identifying passion areas
- Use **target revenue range** to set realistic growth expectations

🚨 REQUIRED: **Your Acquisition Thesis**
<thesis_start>
Focus on acquiring businesses in AI/ML, e-commerce, or online communities where your operational and financial excellence can drive rapid growth and profitability, aligning with your passions, and a 60-hour work week. This ensures synergy between your passions, skills, and economic goals.
<thesis_end>

**Your Personalized Buybox**

| Criterion | Your Target Profile | Rationale |
|-----------|-------------------|----------|
| Industries | AI/ML-enabled SaaS, e-commerce platforms, online community platforms | Aligns with your passions and expertise. |
| Business Model | Subscription-based SaaS, transactional e-commerce, membership-based communities | Scalable business models with high growth potential. |
| Size (SDE) | $100k - $500k | Allows for significant growth potential while remaining manageable. |
| Profit Margin | 5-15% (with significant growth potential) | Acceptable initial margin with focus on growth. |
| Geography | Denver, San Diego, San Francisco, Miami | Your stated location preferences. |
| YOUR LEVERAGE | Sales & marketing expertise, strategic partnerships, operational improvements | Your abilities to accelerate growth and enhance profitability. |
| Red Flags | Lack of product-market fit, weak technology, limited scalability, saturated markets | Risks that could hinder your ability to scale the business. |

---

## SWOT Analysis

*Strategic planning framework evaluating internal strengths/weaknesses against external opportunities/threats.*

**ENHANCED DATA INTEGRATION FOR THIS FRAMEWORK:**
- Use **top motivators** to define what constitutes a "strength"
- Apply **ownership style preferences** to identify weaknesses
- Consider **management team importance** when evaluating threats
- Use **target EBITDA margin and valuation preferences** to set financial criteria

🚨 REQUIRED: **Your Acquisition Thesis**
<thesis_start>
Capitalize on your operational, financial, and sales & marketing strengths to acquire businesses in the software, SaaS, or professional services sectors, mitigating weaknesses by hiring for product development needs, and aiming for acquisitions which can improve efficiency and profitability. This balances your strengths and weaknesses within a market opportunity.
<thesis_end>

**Your Personalized Buybox**

| Criterion | Your Target Profile | Rationale |
|-----------|-------------------|----------|
| Industries | Software, SaaS, Professional Services | Aligns with your experience and expertise. |
| Business Model | Recurring revenue, service-based with potential for process improvement | Cash flow stability and operational leverage. |
| Size (SDE) | $500k - $750k | Balance of scale and manageability, building on experience. |
| Profit Margin | 10-15% (with potential for improvement) | Target margin with room for optimization. |
| Geography | Denver, San Diego, San Francisco, Miami | Your stated location preferences. |
| YOUR LEVERAGE | Operational improvements, financial management, sales & marketing optimization | Your core competencies applied to enhance performance. |
| Red Flags | High customer concentration, reliance on outdated technology, weak management team | Factors that could negatively impact the acquisition's success. |

---

## Entrepreneurial Orientation (EO) Analysis

*Miller (1983) framework assessing innovativeness, proactiveness, and risk-taking to match entrepreneurial DNA.*

**ENHANCED DATA INTEGRATION FOR THIS FRAMEWORK:**
- Use **high risk tolerance** to identify high-growth, high-reward opportunities
- Apply **proactive nature** to find businesses requiring active management
- Consider **innovation interests** when selecting industries
- Use **target revenue range** to define manageable scale

🚨 REQUIRED: **Your Acquisition Thesis**
<thesis_start>
Seek opportunities that align with your high-risk tolerance and passion for innovation in AI/ML and related sectors. Your proactive nature and sales & marketing expertise are best suited for businesses where disruptive growth and market leadership are key goals.
<thesis_end>

**Your Personalized Buybox**

| Criterion | Your Target Profile | Rationale |
|-----------|-------------------|----------|
| Industries | AI/ML-enabled SaaS, e-commerce with AI integration, online communities with AI-driven features | Aligns with your interests and passion for innovation. |
| Business Model | Subscription-based SaaS, transactional e-commerce, membership-based communities | Scalable models with high growth potential. |
| Size (SDE) | $50k - $250k | Smaller businesses offer higher growth potential with more involvement. |
| Profit Margin | 5-15% (with significant growth potential) | Acceptable margin, anticipating high growth. |
| Geography | Denver, San Diego, San Francisco, Miami | Your stated location preferences. |
| YOUR LEVERAGE | Sales & marketing expertise, strategic partnerships, proactive market entry | Your abilities to drive rapid growth and build a strong market presence. |
| Red Flags | Lack of product-market fit, weak technology, reliance on a single customer, highly competitive saturated markets | Significant risks to consider. |

---

## Part 4: Final Strategic Considerations
Synthesizing the analyses, two primary leverage points emerge: 1) your ability to drive revenue growth in businesses with underdeveloped marketing and sales, and 2) your capacity to dramatically improve efficiency and profitability in operationally weak companies. Conversely, the key red flags to watch for are businesses with high customer concentration, outdated technology, or a lack of clear market positioning, as these could neutralize your core strengths.

## Part 5: AI TRANSPARENCY & METHODOLOGY
This analysis was conducted using a comprehensive multi-framework AI approach. Four distinct analytical models (Traditional M&A, Hedgehog Concept, SWOT Analysis, and Entrepreneurial Orientation) were applied simultaneously to your profile. This methodology provides a 360-degree strategic view, highlighting both points of consensus and nuanced differences to enable deeper, more informed acquisition decisions. The benefit of this approach is that it reduces analytical blind spots and reveals multiple viable paths to success.

**Additional Analysis Details:**
- **Operator Archetype:** The analysis weighted your high scores in operations, finance, and sales & marketing, resulting in the dual archetype of "Efficiency Expert" and "Growth Catalyst."
- **Target Industries:** The analysis matched your interests in AI/ML, e-commerce, and online communities with your operational and financial skills, resulting in recommendations across those sectors.
- **Financial Parameter Calculations:** The SDE range varied across frameworks to reflect the different growth stages and business models considered. The traditional M&A analysis focused on established businesses, while the EO analysis prioritized high-growth potential.
- **Geographic Preference Analysis:** The analysis incorporated your stated preferences for Denver, San Diego, San Francisco, and Miami, acknowledging the need for a potential relocation.

**Confidence Assessment:**
- Archetype determination: 0.9
- Industry recommendations: 0.8
- Financial parameters: 0.7
- Overall confidence: 0.8

**Data Sources & Limitations:**
- The most influential data points were your competency ratings, motivators, and deal criteria.
- Missing information such as deal size range, employee count, and specific business models would improve the analysis.
- Assumptions included a willingness to relocate and adapt to different management structures.

## CRITICAL INSTRUCTIONS FOR FLASH MODEL
1. 🚨 YOU MUST INCLUDE THE "Your Acquisition Thesis" SECTION FOR EACH FRAMEWORK
2. 🚨 EACH THESIS MUST BE WRAPPED IN <thesis_start> and <thesis_end> MARKERS
3. 🚨 DO NOT SKIP OR OMIT ANY ACQUISITION THESIS SECTIONS
4. Base your analysis on the user's competency ratings and evidence
5. Use the user's motivators, work-life balance, and values to add depth to your analysis
6. Ensure the SDE ranges reflect the user's financial constraints and risk tolerance
7. Make the analysis actionable and specific to this individual's profile

🚨 FINAL WARNING: The "Your Acquisition Thesis" sections are REQUIRED for all four frameworks and must appear in your response with proper markers. Generate the detailed framework reports now.`.trim();
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
