class AcquisitionAdvisorApp {
    constructor() {
        this.currentPhase = 1;
        this.analysisResults = null;
        this.availableEngines = {};
        this.selectedEngine = 'traditional';
        this.selectedEngines = [];
        this.comparisonMode = false;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.updateProgress();
        await this.loadAvailableEngines();
        this.setupEngineSelection();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('discoveryForm').addEventListener('submit', this.handleFormSubmit.bind(this));

        // Rating sliders
        this.setupRatingSliders();

        // Time commitment slider
        const timeSlider = document.getElementById('time_commitment');
        const timeValue = document.getElementById('time_commitment_value');
        timeSlider.addEventListener('input', (e) => {
            timeValue.textContent = `${e.target.value} hours/week`;
        });

        // Location preference handler
        const locationSelect = document.getElementById('location_preference');
        const locationDetails = document.getElementById('location_details');
        locationSelect.addEventListener('change', (e) => {
            if (e.target.value === 'willing_to_relocate' || e.target.value === 'local_only') {
                locationDetails.style.display = 'block';
                document.getElementById('location_regions').required = true;
            } else {
                locationDetails.style.display = 'none';
                document.getElementById('location_regions').required = false;
            }
        });

        // Character counters
        this.setupCharacterCounters();

        // Action buttons
        document.getElementById('downloadBtn').addEventListener('click', this.downloadReport.bind(this));
        document.getElementById('restartBtn').addEventListener('click', this.restart.bind(this));
        
        // Transparency toggle
        document.getElementById('toggleTransparency').addEventListener('click', this.toggleTransparency.bind(this));
        
        // Engine comparison toggle
        document.getElementById('enableComparison').addEventListener('change', this.toggleComparisonMode.bind(this));
    }

    setupRatingSliders() {
        const competencies = ['sales_marketing', 'operations_systems', 'finance_analytics', 'team_culture', 'product_technology'];
        
        competencies.forEach(competency => {
            const slider = document.getElementById(`${competency}_rating`);
            const valueDisplay = document.getElementById(`${competency}_value`);
            
            slider.addEventListener('input', (e) => {
                valueDisplay.textContent = e.target.value;
                this.updateSliderPosition(slider, valueDisplay);
            });

            // Initial position
            this.updateSliderPosition(slider, valueDisplay);
        });
    }

    updateSliderPosition(slider, valueDisplay) {
        const value = slider.value;
        const min = slider.min;
        const max = slider.max;
        const percentage = ((value - min) / (max - min)) * 100;
        valueDisplay.style.left = `${percentage}%`;
    }

    setupCharacterCounters() {
        const competencies = ['sales_marketing', 'operations_systems', 'finance_analytics', 'team_culture', 'product_technology'];
        
        competencies.forEach(competency => {
            const textarea = document.getElementById(`${competency}_evidence`);
            const counter = document.getElementById(`${competency}_counter`);
            
            textarea.addEventListener('input', (e) => {
                const length = e.target.value.length;
                counter.textContent = `${length}/200`;
                
                if (length >= 200) {
                    counter.classList.add('valid');
                } else {
                    counter.classList.remove('valid');
                }
            });
        });
    }

    setupFormValidation() {
        const form = document.getElementById('discoveryForm');
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const inputGroup = field.closest('.input-group') || field.closest('.competency');
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (field.required && !field.value.trim()) {
            isValid = false;
            errorMessage = 'This field is required.';
        }

        // Minimum length validation for text areas
        if (field.type === 'textarea' && field.hasAttribute('minlength')) {
            const minLength = parseInt(field.getAttribute('minlength'));
            if (field.value.length < minLength) {
                isValid = false;
                errorMessage = `Minimum ${minLength} characters required.`;
            }
        }

        // Number validation
        if (field.type === 'number' && field.value) {
            const value = parseFloat(field.value);
            if (isNaN(value) || value < 0) {
                isValid = false;
                errorMessage = 'Please enter a valid positive number.';
            }
        }

        this.setFieldValidation(inputGroup, isValid, errorMessage);
        return isValid;
    }

    setFieldValidation(inputGroup, isValid, errorMessage) {
        if (isValid) {
            inputGroup.classList.remove('error');
        } else {
            inputGroup.classList.add('error');
            
            // Add error message if it doesn't exist
            let errorElement = inputGroup.querySelector('.error-message');
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                inputGroup.appendChild(errorElement);
            }
            errorElement.textContent = errorMessage;
        }
    }

    clearFieldError(field) {
        const inputGroup = field.closest('.input-group') || field.closest('.competency');
        inputGroup.classList.remove('error');
    }

    validateForm() {
        const form = document.getElementById('discoveryForm');
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        // Additional validation for evidence fields
        const competencies = ['sales_marketing', 'operations_systems', 'finance_analytics', 'team_culture', 'product_technology'];
        competencies.forEach(competency => {
            const evidence = document.getElementById(`${competency}_evidence`);
            if (evidence.value.length < 200) {
                isValid = false;
                this.setFieldValidation(evidence.closest('.competency'), false, 'Evidence must be at least 200 characters.');
            }
        });

        return isValid;
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            alert('Please fill in all required fields correctly.');
            return;
        }

        const formData = this.collectFormData();
        
        // Move to analysis phase
        this.currentPhase = 2;
        this.updateProgress();
        this.showPhase('analysisPhase');
        
        // Start analysis animation
        this.startAnalysisAnimation();
        
        try {
            let response, result;
            
            if (this.comparisonMode && this.selectedEngines.length > 1) {
                // Multi-engine comparison
                response = await fetch('/api/analyze/compare', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userData: formData,
                        engines: this.selectedEngines
                    })
                });
            } else {
                // Single engine analysis
                response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userData: formData,
                        engine: this.selectedEngine
                    })
                });
            }

            result = await response.json();
            
            if (result.success) {
                this.analysisResults = result.data;
                setTimeout(() => {
                    this.showResults();
                }, 3000); // Show results after animation completes
            } else {
                throw new Error(result.error || 'Analysis failed');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            alert(`Sorry, there was an error analyzing your profile: ${error.message}`);
            this.currentPhase = 1;
            this.updateProgress();
            this.showPhase('discoveryPhase');
        }
    }

    collectFormData() {
        const formData = {};
        
        // Competency ratings and evidence
        const competencies = ['sales_marketing', 'operations_systems', 'finance_analytics', 'team_culture', 'product_technology'];
        competencies.forEach(competency => {
            formData[competency] = {
                rating: parseInt(document.getElementById(`${competency}_rating`).value),
                evidence: document.getElementById(`${competency}_evidence`).value
            };
        });

        // Industry profile
        formData.interests_topics = document.getElementById('interests_topics').value;
        formData.recent_books = document.getElementById('recent_books').value;
        formData.problem_to_solve = document.getElementById('problem_to_solve').value;
        formData.customer_affinity = document.getElementById('customer_affinity').value;

        // Financial and lifestyle
        formData.total_liquid_capital = parseFloat(document.getElementById('total_liquid_capital').value);
        formData.potential_loan_amount = parseFloat(document.getElementById('potential_loan_amount').value);
        formData.min_annual_income = parseFloat(document.getElementById('min_annual_income').value);
        formData.time_commitment = parseInt(document.getElementById('time_commitment').value);
        formData.location_preference = document.getElementById('location_preference').value;
        formData.location_regions = document.getElementById('location_regions').value;
        formData.risk_tolerance = document.getElementById('risk_tolerance').value;

        return formData;
    }

    startAnalysisAnimation() {
        const steps = document.querySelectorAll('.step');
        let currentStep = 0;

        const animateStep = () => {
            if (currentStep > 0) {
                steps[currentStep - 1].classList.remove('active');
            }
            
            if (currentStep < steps.length) {
                steps[currentStep].classList.add('active');
                currentStep++;
                setTimeout(animateStep, 600);
            }
        };

        animateStep();
    }

    showResults() {
        this.currentPhase = 3;
        this.updateProgress();
        this.showPhase('strategyPhase');
        this.populateResults();
    }

    populateResults() {
        if (!this.analysisResults) return;

        // Check if this is a comparison result
        if (this.analysisResults.results && this.analysisResults.comparison) {
            this.populateComparisonResults();
        } else {
            this.populateSingleEngineResults();
        }
    }

    populateSingleEngineResults() {
        // Populate AI insights if available
        if (this.analysisResults.aiInsights) {
            this.populateAIInsights();
        }

        // Populate transparency report if available
        if (this.analysisResults.transparencyReport) {
            this.populateTransparencyReport();
        }

        // Populate acquisition thesis
        const thesisContent = document.getElementById('thesisContent');
        thesisContent.innerHTML = this.formatThesis(this.analysisResults.acquisitionThesis);

        // Populate buybox table
        const tableBody = document.getElementById('buyboxTableBody');
        tableBody.innerHTML = '';
        
        this.analysisResults.personalizedBuybox.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="criterion-cell">${row.criterion}</td>
                <td class="target-cell">${row.target}</td>
                <td class="rationale-cell">${row.rationale}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    populateComparisonResults() {
        const results = this.analysisResults.results;
        const comparison = this.analysisResults.comparison;
        
        // Add comparison summary to AI insights section
        this.populateComparisonSummary(comparison);
        
        // Populate with consensus/primary result for thesis
        const primaryResult = this.selectPrimaryResult(results);
        if (primaryResult) {
            const thesisContent = document.getElementById('thesisContent');
            thesisContent.innerHTML = this.formatThesis(primaryResult.acquisitionThesis) + 
                this.generateComparisonNote(comparison);
        }

        // Populate comparison table
        this.populateComparisonTable(results, comparison);
        
        // Add engine-specific results tabs
        this.addEngineResultsTabs(results);
    }

    populateAIInsights() {
        const insights = this.analysisResults.aiInsights;
        const confidenceScores = this.analysisResults.confidenceScores;
        
        let html = '<div class="ai-insights-grid">';
        
        // Confidence Summary
        html += '<div class="insight-card confidence-card">';
        html += '<h4>📊 Analysis Confidence</h4>';
        html += `<div class="confidence-meter">`;
        html += `<div class="confidence-bar" style="width: ${Math.round(confidenceScores.overall * 100)}%"></div>`;
        html += `</div>`;
        html += `<p>Overall: ${Math.round(confidenceScores.overall * 100)}% confident</p>`;
        html += `<small>Archetype: ${Math.round(confidenceScores.archetype * 100)}% | Industry: ${Math.round(confidenceScores.industry * 100)}% | Data Quality: ${Math.round(confidenceScores.dataQuality * 100)}%</small>`;
        html += '</div>';
        
        // Key Strengths
        html += '<div class="insight-card strengths-card">';
        html += '<h4>💪 Key Strengths</h4>';
        html += '<ul>';
        insights.keyStrengths.forEach(strength => {
            html += `<li>${strength}</li>`;
        });
        html += '</ul>';
        html += '</div>';
        
        // AI Recommendations
        html += '<div class="insight-card recommendations-card">';
        html += '<h4>🎯 AI Recommendations</h4>';
        html += '<ul>';
        insights.recommendations.forEach(rec => {
            html += `<li>${rec}</li>`;
        });
        html += '</ul>';
        html += '</div>';
        
        // Risk Factors
        if (insights.risks.length > 0) {
            html += '<div class="insight-card risks-card">';
            html += '<h4>⚠️ Considerations</h4>';
            html += '<ul>';
            insights.risks.forEach(risk => {
                html += `<li>${risk}</li>`;
            });
            html += '</ul>';
            html += '</div>';
        }
        
        html += '</div>';
        
        const aiInsightsContent = document.getElementById('aiInsightsContent');
        if (aiInsightsContent) {
            aiInsightsContent.innerHTML = html;
        }
    }

    formatThesis(thesis) {
        // Convert markdown-style bold text to HTML
        return thesis.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .split('\n\n')
                    .map(paragraph => `<p>${paragraph}</p>`)
                    .join('');
    }

    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        const phases = document.querySelectorAll('.phase');
        
        // Update progress bar
        const progressPercentage = (this.currentPhase / 3) * 100;
        progressFill.style.width = `${progressPercentage}%`;
        
        // Update phase indicators
        phases.forEach((phase, index) => {
            if (index < this.currentPhase) {
                phase.classList.add('active');
            } else {
                phase.classList.remove('active');
            }
        });
    }

    showPhase(phaseId) {
        const phases = document.querySelectorAll('.phase-content');
        phases.forEach(phase => {
            phase.classList.remove('active');
        });
        
        document.getElementById(phaseId).classList.add('active');
    }

    downloadReport() {
        if (!this.analysisResults) return;

        const reportContent = this.generateMarkdownReport();
        const blob = new Blob([reportContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'buybox-generator-report.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    generateMarkdownReport() {
        const results = this.analysisResults;
        const timestamp = new Date().toLocaleDateString();
        
        let markdown = `# Buybox Generator Report\n\n`;
        markdown += `**Generated on:** ${timestamp}\n\n`;
        markdown += `## Your Acquisition Thesis\n\n`;
        markdown += `${results.acquisitionThesis}\n\n`;
        markdown += `## Your Personalized Buybox\n\n`;
        markdown += `| Criterion | Your Target Profile | Rationale |\n`;
        markdown += `|-----------|-------------------|----------|\n`;
        
        results.personalizedBuybox.forEach(row => {
            markdown += `| ${row.criterion} | ${row.target} | ${row.rationale} |\n`;
        });
        
        markdown += `\n---\n\n`;
        markdown += `*This report was generated by the Buybox Generator based on your unique profile and preferences.*`;
        
        return markdown;
    }

    restart() {
        // Reset form
        document.getElementById('discoveryForm').reset();
        
        // Reset phase
        this.currentPhase = 1;
        this.analysisResults = null;
        
        // Update UI
        this.updateProgress();
        this.showPhase('discoveryPhase');
        
        // Reset sliders and counters
        this.setupRatingSliders();
        
        // Reset character counters
        const counters = document.querySelectorAll('.char-counter');
        counters.forEach(counter => {
            counter.textContent = '0/200';
            counter.classList.remove('valid');
        });
        
        // Reset time commitment
        document.getElementById('time_commitment_value').textContent = '40 hours/week';
        
        // Clear validation errors
        const errorGroups = document.querySelectorAll('.input-group.error, .competency.error');
        errorGroups.forEach(group => {
            group.classList.remove('error');
        });
    }

    toggleTransparency() {
        const content = document.getElementById('transparencyContent');
        const button = document.getElementById('toggleTransparency');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            button.textContent = 'Hide Detailed AI Analysis';
        } else {
            content.style.display = 'none';
            button.textContent = 'Show Detailed AI Analysis';
        }
    }

    populateTransparencyReport() {
        const report = this.analysisResults.transparencyReport;
        if (!report) return;

        let html = '<div class="transparency-sections">';
        
        // Executive Summary
        html += '<div class="transparency-section-item">';
        html += '<h4>📊 Executive Summary</h4>';
        html += '<div class="summary-grid">';
        html += `<div class="summary-card">`;
        html += `<h5>Primary Archetype</h5>`;
        html += `<p><strong>${report.executiveSummary.primaryArchetype.type}</strong></p>`;
        html += `<p>Confidence: ${report.executiveSummary.primaryArchetype.confidence}</p>`;
        html += `<p>Composite Score: ${report.executiveSummary.primaryArchetype.compositeScore}</p>`;
        html += `</div>`;
        html += `<div class="summary-card">`;
        html += `<h5>Algorithm Consensus</h5>`;
        html += `<p>Agreement: ${report.executiveSummary.algorithmConsensus.agreementLevel}</p>`;
        html += `<p>Primary Drivers: ${report.executiveSummary.algorithmConsensus.primaryDrivers.join(', ')}</p>`;
        html += `</div>`;
        html += `<div class="summary-card">`;
        html += `<h5>Data Reliability</h5>`;
        html += `<p>Overall: ${report.executiveSummary.dataReliability.overall}</p>`;
        html += `</div>`;
        html += '</div></div>';
        
        // Algorithm Breakdown
        html += '<div class="transparency-section-item">';
        html += '<h4>🔬 Algorithm Breakdown</h4>';
        html += '<div class="algorithm-details">';
        html += '<table class="transparency-table">';
        html += '<thead><tr><th>Component</th><th>Value</th><th>Weight</th><th>Contribution</th><th>Interpretation</th></tr></thead>';
        html += '<tbody>';
        
        const breakdown = report.algorithmBreakdown;
        if (breakdown && breakdown.detailedScoring) {
            Object.entries(breakdown.detailedScoring).forEach(([key, data]) => {
                html += '<tr>';
                html += `<td><strong>${this.formatComponentName(key)}</strong></td>`;
                html += `<td>${data.value}</td>`;
                html += `<td>${data.weight}</td>`;
                html += `<td>${data.contribution}</td>`;
                html += `<td>${data.interpretation}</td>`;
                html += '</tr>';
            });
        }
        
        html += '</tbody></table>';
        html += '</div></div>';
        
        // Methodology References
        html += '<div class="transparency-section-item">';
        html += '<h4>📚 Methodology & References</h4>';
        html += '<div class="methodology-content">';
        html += '<h5>Academic Foundations:</h5>';
        html += '<ul>';
        report.methodologyReferences.academicFoundations.forEach(ref => {
            html += `<li>${ref}</li>`;
        });
        html += '</ul>';
        html += '<h5>Industry Data Sources:</h5>';
        html += '<ul>';
        report.methodologyReferences.industryReports.forEach(ref => {
            html += `<li>${ref}</li>`;
        });
        html += '</ul>';
        html += '</div></div>';
        
        // Limitations
        html += '<div class="transparency-section-item">';
        html += '<h4>⚠️ Limitations & Considerations</h4>';
        html += '<div class="limitations-content">';
        html += '<h5>Algorithmic Limitations:</h5>';
        html += '<ul>';
        report.limitationsAndBiases.algorithmicLimitations.forEach(limitation => {
            html += `<li>${limitation}</li>`;
        });
        html += '</ul>';
        html += '<h5>Data Limitations:</h5>';
        html += '<ul>';
        report.limitationsAndBiases.dataLimitations.forEach(limitation => {
            html += `<li>${limitation}</li>`;
        });
        html += '</ul>';
        html += '</div></div>';
        
        html += '</div>';
        
        document.getElementById('transparencyContent').innerHTML = html;
    }

    formatComponentName(key) {
        const names = {
            'userRating': 'User Self-Rating',
            'sentimentAnalysis': 'Sentiment Analysis',
            'keywordRelevance': 'Keyword Relevance',
            'confidenceIndicators': 'Confidence Indicators',
            'depthAnalysis': 'Response Depth'
        };
        return names[key] || key;
    }

    // Engine Management Methods
    async loadAvailableEngines() {
        try {
            const response = await fetch('/api/engines');
            const result = await response.json();
            
            if (result.success) {
                this.availableEngines = result.engines;
                this.selectedEngine = result.defaultEngine;
            }
        } catch (error) {
            console.error('Failed to load engines:', error);
            // Fallback to traditional engine
            this.availableEngines = {
                traditional: { name: 'Traditional AI', enabled: true, available: true }
            };
        }
    }

    setupEngineSelection() {
        const engineGrid = document.getElementById('engineGrid');
        if (!engineGrid) return;

        engineGrid.innerHTML = '';
        
        Object.entries(this.availableEngines).forEach(([key, engine]) => {
            const engineCard = this.createEngineCard(key, engine);
            engineGrid.appendChild(engineCard);
        });

        // Set default selection
        this.updateEngineSelection();
    }

    createEngineCard(engineKey, engine) {
        const card = document.createElement('div');
        card.className = `engine-card ${engine.available ? 'available' : 'unavailable'}`;
        card.dataset.engine = engineKey;
        
        const statusIcon = engine.available ? '✅' : '❌';
        const statusText = engine.available ? 'Available' : 'Not Available';
        
        console.log(`Creating engine card for ${engineKey}:`, {
            available: engine.available,
            enabled: engine.enabled,
            name: engine.name
        });
        
        card.innerHTML = `
            <div class="engine-header">
                <h4>${engine.name} ${statusIcon}</h4>
                <span class="engine-status ${engine.available ? 'available' : 'unavailable'}">${statusText}</span>
            </div>
            <div class="engine-details">
                <p><strong>Type:</strong> ${engine.type || 'AI Engine'}</p>
                <p><strong>Provider:</strong> ${engine.provider || 'Local'}</p>
                ${engine.capabilities ? `
                    <div class="engine-capabilities">
                        <strong>Capabilities:</strong>
                        <ul>
                            ${engine.capabilities.slice(0, 3).map(cap => `<li>${cap}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
            <div class="engine-actions">
                <label class="engine-radio">
                    <input type="radio" name="engineSelect" value="${engineKey}" ${engineKey === this.selectedEngine ? 'checked' : ''} ${!engine.available ? 'disabled' : ''}>
                    <span class="radio-custom"></span>
                    Select
                </label>
                <label class="engine-checkbox" style="display: none;">
                    <input type="checkbox" value="${engineKey}" ${!engine.available ? 'disabled' : ''}>
                    <span class="checkbox-custom"></span>
                    Compare
                </label>
            </div>
        `;

        // Add click handler
        if (engine.available) {
            card.addEventListener('click', (e) => {
                if (e.target.type !== 'radio' && e.target.type !== 'checkbox') {
                    const radio = card.querySelector('input[type="radio"]');
                    const checkbox = card.querySelector('input[type="checkbox"]');
                    
                    if (this.comparisonMode) {
                        checkbox.checked = !checkbox.checked;
                        this.updateEngineSelection();
                    } else {
                        radio.checked = true;
                        this.updateEngineSelection();
                    }
                }
            });

            // Add individual input handlers
            const radio = card.querySelector('input[type="radio"]');
            const checkbox = card.querySelector('input[type="checkbox"]');
            
            radio.addEventListener('change', () => this.updateEngineSelection());
            checkbox.addEventListener('change', () => this.updateEngineSelection());
        }

        return card;
    }

    toggleComparisonMode() {
        this.comparisonMode = document.getElementById('enableComparison').checked;
        console.log('Comparison mode toggled:', this.comparisonMode);
        
        // Show/hide appropriate controls
        const radioLabels = document.querySelectorAll('.engine-radio');
        const checkboxLabels = document.querySelectorAll('.engine-checkbox');
        
        console.log('Found radio labels:', radioLabels.length);
        console.log('Found checkbox labels:', checkboxLabels.length);
        
        radioLabels.forEach(label => {
            label.style.display = this.comparisonMode ? 'none' : 'flex';
        });
        
        checkboxLabels.forEach(label => {
            label.style.display = this.comparisonMode ? 'flex' : 'none';
            console.log('Checkbox label display set to:', label.style.display);
        });

        this.updateEngineSelection();
    }

    updateEngineSelection() {
        if (this.comparisonMode) {
            // Multi-selection mode
            const checkboxes = document.querySelectorAll('input[type="checkbox"][value]');
            this.selectedEngines = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);
        } else {
            // Single selection mode
            const selectedRadio = document.querySelector('input[type="radio"][name="engineSelect"]:checked');
            this.selectedEngine = selectedRadio ? selectedRadio.value : 'traditional';
            this.selectedEngines = [this.selectedEngine];
        }

        this.updateAnalyzeButton();
    }

    updateAnalyzeButton() {
        const button = document.getElementById('analyzeBtn');
        const buttonText = document.getElementById('analyzeButtonText');
        const selectedEngines = document.getElementById('selectedEngines');
        
        if (this.comparisonMode && this.selectedEngines.length > 1) {
            buttonText.textContent = 'Compare AI Methods';
            selectedEngines.textContent = ` (${this.selectedEngines.length} engines)`;
            button.classList.add('comparison-mode');
        } else if (this.comparisonMode && this.selectedEngines.length === 1) {
            buttonText.textContent = 'Analyze My Profile';
            selectedEngines.textContent = ` (${this.availableEngines[this.selectedEngines[0]]?.name || 'AI'})`;
            button.classList.remove('comparison-mode');
        } else {
            buttonText.textContent = 'Analyze My Profile';
            selectedEngines.textContent = ` (${this.availableEngines[this.selectedEngine]?.name || 'AI'})`;
            button.classList.remove('comparison-mode');
        }
    }

    // Comparison Dashboard Methods
    populateComparisonSummary(comparison) {
        const aiInsightsContent = document.getElementById('aiInsightsContent');
        if (!aiInsightsContent) return;

        let html = '<div class="comparison-insights">';
        
        // Comparison Overview
        html += '<div class="comparison-overview">';
        html += '<h4>🔬 Multi-Engine Analysis Overview</h4>';
        html += `<p><strong>Engines Analyzed:</strong> ${comparison.engineCount}</p>`;
        html += `<p><strong>Archetype Agreement:</strong> ${comparison.archetypeAgreement.agreement ? 'Yes' : 'No'} (${comparison.archetypeAgreement.agreementPercentage}%)</p>`;
        html += `<p><strong>Industry Overlap:</strong> ${comparison.industryOverlap.overlapPercentage}%</p>`;
        html += `<p><strong>Confidence Consistency:</strong> ${comparison.confidenceVariation.consistency}</p>`;
        html += '</div>';

        // Recommendations
        html += '<div class="comparison-recommendations">';
        html += '<h4>💡 Analysis Recommendations</h4>';
        html += '<ul>';
        comparison.recommendations.forEach(rec => {
            html += `<li>${rec}</li>`;
        });
        html += '</ul>';
        html += '</div>';

        html += '</div>';
        aiInsightsContent.innerHTML = html;
    }

    selectPrimaryResult(results) {
        // Select the result with highest confidence or traditional as fallback
        const engineKeys = Object.keys(results);
        if (engineKeys.length === 0) return null;
        
        // Prefer traditional or hybrid engines, then highest confidence
        const priorities = ['hybrid', 'traditional', 'openai', 'claude', 'ollama'];
        for (const engine of priorities) {
            if (results[engine]) return results[engine];
        }
        
        return results[engineKeys[0]];
    }

    generateComparisonNote(comparison) {
        return `<div class="comparison-note">
            <h4>🔍 Multi-Engine Analysis Note</h4>
            <p>This analysis represents a ${comparison.engineCount}-engine comparison. 
            ${comparison.archetypeAgreement.agreement ? 
                `All engines agree on the primary archetype with ${comparison.archetypeAgreement.agreementPercentage}% consensus.` :
                `Engines show mixed results across ${comparison.archetypeAgreement.uniqueArchetypes} different archetypes.`
            }
            Industry recommendations show ${comparison.industryOverlap.overlapPercentage}% overlap.</p>
        </div>`;
    }

    populateComparisonTable(results, comparison) {
        const tableBody = document.getElementById('buyboxTableBody');
        tableBody.innerHTML = '';

        // Create comparison-specific table headers
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <td class="criterion-cell"><strong>Engine Comparison</strong></td>
            <td class="target-cell"><strong>Results</strong></td>
            <td class="rationale-cell"><strong>Analysis</strong></td>
        `;
        tableBody.appendChild(headerRow);

        // Archetype comparison
        const archetypeRow = document.createElement('tr');
        const archetypes = Object.entries(results).map(([engine, result]) => 
            `${engine}: ${result.operatorArchetype?.title || 'Unknown'}`
        ).join('<br>');
        archetypeRow.innerHTML = `
            <td class="criterion-cell">Operator Archetype</td>
            <td class="target-cell">${archetypes}</td>
            <td class="rationale-cell">${comparison.archetypeAgreement.agreement ? 'Strong consensus' : 'Mixed results - requires attention'}</td>
        `;
        tableBody.appendChild(archetypeRow);

        // Industry comparison
        const industryRow = document.createElement('tr');
        const industries = comparison.industryOverlap.industries.length > 0 ?
            comparison.industryOverlap.industries.join(', ') :
            'No common industries identified';
        industryRow.innerHTML = `
            <td class="criterion-cell">Target Industries</td>
            <td class="target-cell">${industries}</td>
            <td class="rationale-cell">${comparison.industryOverlap.overlapPercentage}% overlap across engines</td>
        `;
        tableBody.appendChild(industryRow);

        // Confidence comparison
        const confidenceRow = document.createElement('tr');
        confidenceRow.innerHTML = `
            <td class="criterion-cell">Confidence Levels</td>
            <td class="target-cell">Range: ${comparison.confidenceVariation.range.min}% - ${comparison.confidenceVariation.range.max}%</td>
            <td class="rationale-cell">Average: ${comparison.confidenceVariation.average}% (${comparison.confidenceVariation.consistency} consistency)</td>
        `;
        tableBody.appendChild(confidenceRow);
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AcquisitionAdvisorApp();
});
