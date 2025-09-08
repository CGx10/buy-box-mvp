// Methodology-specific prompt snippets for the AI-Powered Acquisition Advisor

const METHODOLOGIES = {
    hedgehog_concept: {
        name: "The Hedgehog Concept",
        author: "Jim Collins",
        description: "Find the intersection of what you're passionate about, what you can be the best at, and what drives your economic engine.",
        
        instructions: `
**FRAMEWORK:** The Hedgehog Concept (Jim Collins, "Good to Great")

Your analysis must be structured around the three circles of the Hedgehog Concept to find the ideal convergence point for the entrepreneur.

**The Three Circles:**

1. **The Passion Circle:** Based on Module B, what is the entrepreneur deeply passionate about? Your "Target Industries" must directly reflect this.

2. **The "Best At" Circle:** Based on Module A, what is the single skill or competency where the entrepreneur can be the best in the world? This defines their "Operator Archetype" and "Core Leverage."

3. **The Economic Engine Circle:** Based on Module C, what financial parameters define a viable economic engine for the entrepreneur? This will drive the SDE range and other financial metrics.

**Final Acquisition Thesis:** Your final Acquisition Thesis must explicitly reference these three circles and explain how your recommendation represents the intersection of all three.

**AI Transparency & Methodology:** For the "AI Transparency & Methodology" section, use the following text: "This analysis was conducted using the Hedgehog Concept framework, popularized by Jim Collins. This model identifies the optimal business fit at the intersection of what you're passionate about, what you can be the best at, and what drives your economic engine."`,

        transparencyText: "This analysis was conducted using the Hedgehog Concept framework, popularized by Jim Collins. This model identifies the optimal business fit at the intersection of what you're passionate about, what you can be the best at, and what drives your economic engine."
    },

    swot_analysis: {
        name: "SWOT Analysis",
        author: "Strategic Planning",
        description: "Evaluate your internal Strengths and Weaknesses against external Opportunities and Threats to identify strategic acquisition paths.",
        
        instructions: `
**FRAMEWORK:** SWOT Analysis

Your analysis must be structured as a SWOT analysis from the entrepreneur's perspective.

**The Four Points:**

1. **Strengths (Internal):** Based on Module A, what are the entrepreneur's most significant skills and experiences? This will define their "Operator Archetype" and "Core Leverage."

2. **Weaknesses (Internal):** Based on Module A, what competencies are less developed? Your "Red Flags" should include avoiding businesses that require deep expertise in these areas.

3. **Opportunities (External):** Based on the entrepreneur's interests in Module B, what market trends or underserved niches represent a clear opportunity for them to enter? This will define your "Target Industries."

4. **Threats (External):** What general market risks or challenges might this entrepreneur face in their target industries?

**Final Acquisition Thesis:** Your final Acquisition Thesis should summarize these findings.

**AI Transparency & Methodology:** For the "AI Transparency & Methodology" section, use the following text: "This analysis was conducted using the SWOT framework. This model evaluates an entrepreneur's internal Strengths and Weaknesses against external market Opportunities and Threats to identify a strategic acquisition path."`,

        transparencyText: "This analysis was conducted using the SWOT framework. This model evaluates an entrepreneur's internal Strengths and Weaknesses against external market Opportunities and Threats to identify a strategic acquisition path."
    },

    entrepreneurial_orientation: {
        name: "Entrepreneurial Orientation",
        author: "Miller (1983)",
        description: "Assess your innovativeness, proactiveness, and risk-taking tendencies to find a business environment that matches your entrepreneurial DNA.",
        
        instructions: `
**FRAMEWORK:** Entrepreneurial Orientation (EO) Scale (Miller, 1983)

Your analysis must be structured around the three core dimensions of the Entrepreneurial Orientation (EO) scale to match the entrepreneur's style to a suitable business environment.

**The Three Dimensions:**

1. **Innovativeness:** Based on Modules A and B (especially the 'problem to solve'), assess the entrepreneur's tendency to engage in and support new ideas, novelty, and creative processes. A high score suggests looking for businesses in dynamic, tech-forward industries.

2. **Proactiveness:** Based on the evidence in Module A, evaluate the entrepreneur's propensity to take initiative and act on opportunities. A high score ('Growth Catalyst,' 'Visionary Builder') indicates a fit for businesses that require forward-thinking leadership to capture market share.

3. **Risk-Taking:** Based on Module C (risk_tolerance) and their career history, assess their tendency to commit resources to projects with uncertain outcomes. This will heavily influence the 'Business Model,' 'Growth Stage,' and 'Financial Parameters' of the target business.

**Final Acquisition Thesis:** Your Acquisition Thesis must explain how your recommendations align with the entrepreneur's specific EO profile.

**AI Transparency & Methodology:** For the "AI Transparency & Methodology" section, use the following text: "This analysis was conducted using the Entrepreneurial Orientation (EO) framework, based on the research of Miller (1983). This model assesses an entrepreneur's orientation toward innovativeness, proactiveness, and risk-taking to identify a business environment that aligns with their personal style."`,

        transparencyText: "This analysis was conducted using the Entrepreneurial Orientation (EO) framework, based on the research of Miller (1983). This model assesses an entrepreneur's orientation toward innovativeness, proactiveness, and risk-taking to identify a business environment that aligns with their personal style."
    },

    traditional_ma_analysis: {
        name: "Traditional M&A Analysis",
        author: "Expert M&A Advisory",
        description: "Comprehensive M&A analysis using proven methodologies for operator archetype identification and strategic acquisition targeting.",
        
        instructions: `
**FRAMEWORK:** Traditional M&A Analysis (Expert M&A Advisory)

Your analysis must be structured using proven M&A methodologies to identify the optimal acquisition target for the entrepreneur.

**The Analysis Process:**

1. **Operator Archetype Identification:** Based on Module A, identify the entrepreneur's single most dominant strength and classify them into one of five archetypes: "The Growth Catalyst" (Sales/Marketing), "The Efficiency Expert" (Ops/Systems), "The Visionary Builder" (Product/Tech), "The People Leader" (Team/Culture), or "The Financial Strategist" (Finance/Analytics).

2. **Core Leverage Definition:** Determine the corresponding business opportunity based on the identified archetype. For example, if they are "The Growth Catalyst," their leverage lies in acquiring a business with a great product but poor marketing.

3. **Target Industry Identification:** Analyze Module B text inputs to identify 3-5 specific, niche industries or business models that align with their passions and where their operator archetype would be most impactful.

4. **Financial Parameter Calculation:** Analyze Module C financial inputs to calculate a realistic target Seller Discretionary Earnings (SDE) range, accounting for liquid capital, loan potential, and debt service requirements.

5. **Geographic Preference Analysis:** Identify location preferences and formulate a clear statement summarizing this.

**Final Acquisition Thesis:** Your final Acquisition Thesis must explain how your recommendations align with the entrepreneur's specific archetype and leverage points.

**AI Transparency & Methodology:** For the "AI Transparency & Methodology" section, use the following text: "This analysis was conducted using Traditional M&A Analysis methodologies. This approach uses proven frameworks for operator archetype identification, core leverage definition, and strategic acquisition targeting to identify the optimal business fit for the entrepreneur."`,

        transparencyText: "This analysis was conducted using Traditional M&A Analysis methodologies. This approach uses proven frameworks for operator archetype identification, core leverage definition, and strategic acquisition targeting to identify the optimal business fit for the entrepreneur."
    }
};

module.exports = METHODOLOGIES;
