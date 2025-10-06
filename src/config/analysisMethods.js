export const analysisMethods = {
    traditional: {
        name: "Traditional Analysis",
        description: "Classic NLP approach with local processing",
        category: 'local',
        requiresLLM: false,
        availableModels: null,
        icon: '🔧',
        features: ['Local', 'No API costs', 'Privacy focused']
    },
    single_stage: {
        name: "Single-Stage Analysis",
        description: "Comprehensive prompt in one pass",
        category: 'comprehensive',
        requiresLLM: true,
        availableModels: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gpt-4', 'claude-3.5-sonnet'],
        icon: '⚡',
        features: ['Fast processing', 'Comprehensive output', 'Single API call']
    },
    two_stage_optimized: {
        name: "Two-Stage Optimized",
        description: "Quick overview → Detailed analysis",
        category: 'optimized',
        requiresLLM: true,
        availableModels: ['gemini-2.5-flash', 'gemini-2.5-pro'],
        icon: '🚀',
        features: ['Balanced speed/quality', 'Cost effective', 'Structured output']
    },
    hybrid_staged: {
        name: "Hybrid Staged",
        description: "Different models for different stages",
        category: 'hybrid',
        requiresLLM: true,
        availableModels: ['gemini-2.5-flash', 'gemini-2.5-pro'],
        multiModel: true,
        icon: '🔄',
        features: ['Multi-model approach', 'Optimized for each stage', 'Advanced reasoning']
    },
    progressive_refinement: {
        name: "Progressive Refinement",
        description: "Iterative analysis with feedback loops",
        category: 'advanced',
        requiresLLM: true,
        availableModels: ['gemini-2.5-pro', 'gpt-4', 'claude-3.5-sonnet'],
        icon: '🎯',
        features: ['Iterative improvement', 'High accuracy', 'Advanced reasoning']
    }
};

export const aiModels = {
    'gemini-2.5-flash': {
        name: "Gemini 2.5 Flash",
        provider: "Google",
        speed: "Fast",
        cost: "Low",
        capabilities: ["General analysis", "Quick responses", "Cost-effective"],
        icon: '⚡',
        color: '#4285f4'
    },
    'gemini-2.5-pro': {
        name: "Gemini 2.5 Pro",
        provider: "Google",
        speed: "Medium",
        cost: "Medium",
        capabilities: ["Advanced analysis", "Complex reasoning", "High accuracy"],
        icon: '🧠',
        color: '#34a853'
    },
    'gpt-4': {
        name: "GPT-4",
        provider: "OpenAI",
        speed: "Medium",
        cost: "High",
        capabilities: ["Advanced reasoning", "Complex analysis", "High accuracy"],
        icon: '🤖',
        color: '#6b7280'
    },
    'claude-3.5-sonnet': {
        name: "Claude 3.5 Sonnet",
        provider: "Anthropic",
        speed: "Fast",
        cost: "Medium",
        capabilities: ["Balanced performance", "Good reasoning", "Cost-effective"],
        icon: '🎭',
        color: '#8b5cf6'
    }
};

export const methodCategories = {
    local: { name: "Local", color: '#e2e8f0' },
    comprehensive: { name: "Comprehensive", color: '#bfdbfe' },
    optimized: { name: "Optimized", color: '#dcfce7' },
    hybrid: { name: "Hybrid", color: '#e9d5ff' },
    advanced: { name: "Advanced", color: '#fed7aa' }
};

// Default configuration
export const defaultConfig = {
    method: 'two_stage_optimized',
    model: 'gemini-2.5-flash'
};
