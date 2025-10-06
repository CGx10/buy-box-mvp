import { analysisMethods, aiModels, defaultConfig } from './config/analysisMethods.js';

export class AnalysisMethodManager {
    constructor() {
        this.selectedMethod = defaultConfig.method;
        this.selectedModel = defaultConfig.model;
        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        // Retry if elements aren't found yet
        const methodCards = document.querySelectorAll('.method-card');
        const modelCards = document.querySelectorAll('.model-card');
        
        if (methodCards.length === 0 || modelCards.length === 0) {
            console.log('🔄 Method/Model cards not found yet, retrying in 100ms...');
            setTimeout(() => this.setupEventListeners(), 100);
            return;
        }
        
        console.log(`✅ Found ${methodCards.length} method cards and ${modelCards.length} model cards`);
        
        methodCards.forEach(card => {
            card.addEventListener('click', (e) => {
                console.log('🖱️ Method card clicked:', e.currentTarget.dataset.method);
                this.selectMethod(e.currentTarget.dataset.method);
            });
        });

        modelCards.forEach(card => {
            card.addEventListener('click', (e) => {
                console.log('🖱️ Model card clicked:', e.currentTarget.dataset.model);
                this.selectModel(e.currentTarget.dataset.model);
            });
        });
    }

    selectMethod(methodId) {
        this.selectedMethod = methodId;
        const method = analysisMethods[methodId];
        if (method.requiresLLM && !method.availableModels.includes(this.selectedModel)) {
            this.selectedModel = method.availableModels[0]; // Auto-select first available model
        } else if (!method.requiresLLM) {
            this.selectedModel = null;
        }
        this.updateUI();
    }

    selectModel(modelId) {
        this.selectedModel = modelId;
        this.updateUI();
    }

    updateUI() {
        this.updateMethodSelectionDisplay();
        this.updateModelOptionsDisplay();
        this.updateModelSelectionDisplay();
        this.updateConfigurationDisplay();
    }

    updateMethodSelectionDisplay() {
        document.querySelectorAll('.method-card').forEach(card => {
            if (card.dataset.method === this.selectedMethod) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    updateModelOptionsDisplay() {
        const method = analysisMethods[this.selectedMethod];
        const modelSelectionSection = document.getElementById('modelSelection');
        const modelGrid = document.querySelector('.model-grid');

        if (method.requiresLLM) {
            modelSelectionSection.style.display = 'block';
            document.querySelectorAll('.model-card').forEach(card => {
                const modelId = card.dataset.model;
                if (method.availableModels.includes(modelId)) {
                    card.style.display = 'block';
                    card.classList.remove('disabled');
                } else {
                    card.style.display = 'none';
                    card.classList.add('disabled');
                }
            });
        } else {
            modelSelectionSection.style.display = 'none';
        }
    }

    updateModelSelectionDisplay() {
        document.querySelectorAll('.model-card').forEach(card => {
            if (card.dataset.model === this.selectedModel) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    updateConfigurationDisplay() {
        const configDisplay = document.querySelector('.config-display');
        const methodNameSpan = configDisplay.querySelector('.method-name');
        const modelNameSpan = configDisplay.querySelector('.model-name');
        const methodIconSpan = configDisplay.querySelector('.method-display .method-icon');
        const modelIconSpan = configDisplay.querySelector('.model-display .model-icon');
        const modelDisplayDiv = configDisplay.querySelector('.model-display');

        const methodConfig = analysisMethods[this.selectedMethod];
        methodNameSpan.textContent = methodConfig.name;
        methodIconSpan.textContent = methodConfig.icon;

        if (this.selectedModel) {
            const modelConfig = aiModels[this.selectedModel];
            modelNameSpan.textContent = modelConfig.name;
            modelIconSpan.textContent = modelConfig.icon;
            modelDisplayDiv.style.display = 'flex';
        } else {
            modelNameSpan.textContent = '';
            modelIconSpan.textContent = '';
            modelDisplayDiv.style.display = 'none';
        }
    }

    getAnalysisConfiguration() {
        return {
            method: this.selectedMethod,
            model: this.selectedModel,
            methodConfig: analysisMethods[this.selectedMethod],
            modelConfig: this.selectedModel ? aiModels[this.selectedModel] : null
        };
    }
}
