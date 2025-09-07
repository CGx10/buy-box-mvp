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

        // Save/Load functionality
        this.setupSaveLoadButtons();

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
        if (inputGroup) {
            inputGroup.classList.remove('error');
        }
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

        // Update engine selection before collecting form data
        this.updateEngineSelection();
        
        const formData = this.collectFormData();
        
        // Debug: Log the form data being sent
        console.log('Form data being sent:', formData);
        console.log('Selected engines:', this.selectedEngines);
        console.log('Comparison mode:', this.comparisonMode);
        
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
            
            // Debug: Log the server response
            console.log('Server response:', result);
            
            if (result.success) {
                console.log('Setting analysisResults to:', result.data);
                console.log('result.data keys:', Object.keys(result.data));
                this.analysisResults = result.data;
                console.log('this.analysisResults after setting:', this.analysisResults);
                setTimeout(() => {
                    this.showResults();
                }, 3000); // Show results after animation completes
            } else {
                console.error('Analysis failed:', result.error, result.details);
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
            const ratingElement = document.getElementById(`${competency}_rating`);
            const evidenceElement = document.getElementById(`${competency}_evidence`);
            
            console.log(`Collecting ${competency}:`, {
                ratingElement: ratingElement,
                evidenceElement: evidenceElement,
                ratingValue: ratingElement ? ratingElement.value : 'NOT FOUND',
                evidenceValue: evidenceElement ? evidenceElement.value : 'NOT FOUND'
            });
            
            formData[competency] = {
                rating: ratingElement ? parseInt(ratingElement.value) : 0,
                evidence: evidenceElement ? evidenceElement.value : ''
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
        console.log('populateResults called with analysisResults:', this.analysisResults);
        
        if (!this.analysisResults) {
            console.log('No analysisResults, returning');
            return;
        }

        // Debug: Log the analysis results structure
        console.log('Analysis results structure:', {
            hasResults: !!this.analysisResults.results,
            hasComparison: !!this.analysisResults.comparison,
            resultsKeys: this.analysisResults.results ? Object.keys(this.analysisResults.results) : null,
            comparisonKeys: this.analysisResults.comparison ? Object.keys(this.analysisResults.comparison) : null
        });

        // Check if this is a comparison result
        if (this.analysisResults.results && this.analysisResults.comparison) {
            console.log('Populating comparison results');
            this.populateComparisonResults();
        } else {
            console.log('Populating single engine results');
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
        
        if (this.analysisResults.personalizedBuybox && Array.isArray(this.analysisResults.personalizedBuybox)) {
            this.analysisResults.personalizedBuybox.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="criterion-cell">${row.criterion || 'N/A'}</td>
                    <td class="target-cell">${row.target || 'N/A'}</td>
                    <td class="rationale-cell">${row.rationale || 'N/A'}</td>
                `;
                tableBody.appendChild(tr);
            });
        } else {
            // Show empty state if no buybox data
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td colspan="3" class="text-center text-gray-500">No buybox data available</td>
            `;
            tableBody.appendChild(tr);
        }
    }

    populateComparisonResults() {
        console.log('populateComparisonResults called');
        const results = this.analysisResults.results;
        const comparison = this.analysisResults.comparison;
        
        console.log('Results data:', results);
        console.log('Comparison data:', comparison);
        
        // Safety checks
        if (!results || typeof results !== 'object') {
            console.error('Invalid results data for comparison');
            return;
        }
        
        if (!comparison) {
            console.error('No comparison data available');
            return;
        }
        
        console.log('Safety checks passed, proceeding with comparison population');
        
        // Add comparison summary to AI insights section
        this.populateComparisonSummary(comparison);
        
        // Populate transparency report for comparison
        this.populateComparisonTransparencyReport(results, comparison);
        
        // Populate with consensus/primary result for thesis
        const primaryResult = this.selectPrimaryResult(results);
        if (primaryResult) {
            const thesisContent = document.getElementById('thesisContent');
            thesisContent.innerHTML = this.formatThesis(primaryResult.acquisitionThesis) + 
                this.generateComparisonNote(comparison);
        } else {
            // Fallback if no primary result
            const thesisContent = document.getElementById('thesisContent');
            thesisContent.innerHTML = '<p>No acquisition thesis available from selected engines.</p>';
        }

        // Populate comparison table
        this.populateComparisonTable(results, comparison);
        
        // Add engine-specific results tabs
        console.log('Calling addEngineResultsTabs with results:', results);
        this.addEngineResultsTabs(results);
        console.log('addEngineResultsTabs completed');
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
        // Safety check for undefined or null thesis
        if (!thesis) {
            return '<p>No acquisition thesis available.</p>';
        }
        
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

        // Set initial comparison mode state - use setTimeout to ensure DOM is ready
        setTimeout(() => {
            this.comparisonMode = document.getElementById('enableComparison').checked;
            console.log('Initial comparison mode from toggle:', this.comparisonMode);
            
            // Apply initial state to controls
            this.toggleComparisonMode();
        }, 100);
        
        // Set default selection
        this.updateEngineSelection();
        
        // Debug: Check initial state
        console.log('Initial comparison mode:', this.comparisonMode);
        console.log('Available engines:', this.availableEngines);
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
                <label class="engine-checkbox hidden">
                    <input type="checkbox" value="${engineKey}" ${!engine.available ? 'disabled' : ''}>
                    <span class="checkbox-custom"></span>
                    Compare
                </label>
            </div>
        `;

        // Debug: Check checkbox state after creation
        const checkbox = card.querySelector('input[type="checkbox"]');
        console.log(`Checkbox for ${engineKey}:`, {
            disabled: checkbox.disabled,
            available: engine.available,
            value: checkbox.value,
            hasDisabledAttribute: checkbox.hasAttribute('disabled'),
            outerHTML: checkbox.outerHTML
        });

        // Add click handler
        if (engine.available) {
            card.addEventListener('click', (e) => {
                console.log('Card clicked:', engineKey, 'target:', e.target, 'type:', e.target.type);
                
                // Prevent default behavior for checkbox clicks
                if (e.target.type === 'checkbox') {
                    e.preventDefault();
                    e.stopPropagation();
                }
                
                if (e.target.type !== 'radio' && e.target.type !== 'checkbox') {
                    const radio = card.querySelector('input[type="radio"]');
                    const checkbox = card.querySelector('input[type="checkbox"]');
                    
                    if (this.comparisonMode) {
                        console.log('Toggling checkbox:', engineKey, 'current state:', checkbox.checked, 'disabled:', checkbox.disabled);
                        if (!checkbox.disabled) {
                            checkbox.checked = !checkbox.checked;
                            console.log('Checkbox toggled to:', checkbox.checked);
                            this.updateEngineSelection();
                        } else {
                            console.log('Checkbox is disabled, cannot toggle');
                        }
                    } else {
                        console.log('Selecting radio:', engineKey);
                        radio.checked = true;
                        this.updateEngineSelection();
                    }
                }
            });

            // Add individual input handlers
            const radio = card.querySelector('input[type="radio"]');
            const checkbox = card.querySelector('input[type="checkbox"]');
            
            radio.addEventListener('change', () => {
                console.log('Radio changed:', engineKey);
                this.updateEngineSelection();
            });
            
            // Checkbox changes are handled by the card click handler
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
        
        radioLabels.forEach((label, index) => {
            if (this.comparisonMode) {
                label.classList.add('hidden');
                console.log(`Radio ${index} hidden`);
            } else {
                label.classList.remove('hidden');
                console.log(`Radio ${index} shown`);
            }
        });
        
        checkboxLabels.forEach((label, index) => {
            if (this.comparisonMode) {
                label.classList.remove('hidden');
                console.log(`Checkbox ${index} shown, classes:`, label.className);
            } else {
                label.classList.add('hidden');
                console.log(`Checkbox ${index} hidden, classes:`, label.className);
            }
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
        html += '<h4>🔬 AI Engine Comparison Results</h4>';
        html += `<p><strong>Engines Compared:</strong> Traditional AI + Google Gemini</p>`;
        html += `<p><strong>Archetype Agreement:</strong> ${comparison.archetypeAgreement.agreement ? 'Yes' : 'No'} (${comparison.archetypeAgreement.agreementPercentage}%)</p>`;
        html += `<p><strong>Industry Overlap:</strong> ${comparison.industryOverlap.overlapPercentage}%</p>`;
        html += `<p><strong>Confidence Consistency:</strong> ${comparison.confidenceVariation.consistency}</p>`;
        html += '<p><em>Note: The main analysis below represents a consensus view. Use the tabs below to see detailed results from each engine.</em></p>';
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

    populateComparisonTransparencyReport(results, comparison) {
        const transparencyContent = document.getElementById('transparencyContent');
        if (!transparencyContent) return;

        let html = '<div class="transparency-sections">';
        
        // Comparison Summary
        html += '<div class="transparency-section-item">';
        html += '<h4>🔬 Multi-Engine Analysis Summary</h4>';
        html += '<div class="summary-grid">';
        html += `<div class="summary-card">`;
        html += `<h5>Engines Analyzed</h5>`;
        html += `<p>${Object.keys(results).length} AI engines</p>`;
        html += `<p>Traditional AI + Google Gemini</p>`;
        html += `</div>`;
        html += `<div class="summary-card">`;
        html += `<h5>Agreement Level</h5>`;
        html += `<p>${comparison.archetypeAgreement.agreementPercentage}% archetype agreement</p>`;
        html += `<p>${comparison.industryOverlap.overlapPercentage}% industry overlap</p>`;
        html += `</div>`;
        html += `<div class="summary-card">`;
        html += `<h5>Confidence Range</h5>`;
        html += `<p>${comparison.confidenceVariation.range.min}% - ${comparison.confidenceVariation.range.max}%</p>`;
        html += `<p>Average: ${comparison.confidenceVariation.average}%</p>`;
        html += `</div>`;
        html += '</div>';
        html += '</div>';

        // Methodology explanation
        html += '<div class="transparency-section-item">';
        html += '<h4>🔬 Archetype Detection Methodology</h4>';
        html += '<div class="methodology-grid">';
        html += '<div class="methodology-card">';
        html += '<h5>Traditional AI Method</h5>';
        html += '<p><strong>Multi-Factor Scoring:</strong></p>';
        html += '<ul>';
        html += '<li>User Self-Rating (30%): Direct 1-5 competency scores</li>';
        html += '<li>Keyword Analysis (30%): Evidence text matched against archetype-specific phrases</li>';
        html += '<li>Sentiment Analysis (20%): Confidence and achievement language analysis</li>';
        html += '<li>Confidence Indicators (10%): Success vs uncertainty word detection</li>';
        html += '<li>Response Depth (10%): Specificity and detail level evaluation</li>';
        html += '</ul>';
        html += '<p><strong>Archetype Mappings:</strong></p>';
        html += '<ul>';
        html += '<li>Operations/Systems → "The Efficiency Expert"</li>';
        html += '<li>Sales/Marketing → "The Growth Catalyst"</li>';
        html += '<li>Product/Technology → "The Visionary Builder"</li>';
        html += '<li>Team/Culture → "The People Leader"</li>';
        html += '<li>Finance/Analytics → "The Financial Strategist"</li>';
        html += '</ul>';
        html += '</div>';
        html += '<div class="methodology-card">';
        html += '<h5>Gemini Method</h5>';
        html += '<p><strong>LLM Analysis:</strong></p>';
        html += '<ul>';
        html += '<li>Uses same weighted scoring methodology as Traditional AI</li>';
        html += '<li>Analyzes evidence text for key phrases and confidence indicators</li>';
        html += '<li>Applies same archetype mappings and leverage points</li>';
        html += '<li>Generates reasoning based on composite score calculations</li>';
        html += '</ul>';
        html += '<p><strong>Key Differences:</strong></p>';
        html += '<ul>';
        html += '<li>Natural language understanding vs algorithmic scoring</li>';
        html += '<li>Contextual analysis vs pattern matching</li>';
        html += '<li>Semantic comprehension vs keyword frequency</li>';
        html += '</ul>';
        html += '</div>';
        html += '</div>';
        html += '</div>';

        // Engine-specific details
        html += '<div class="transparency-section-item">';
        html += '<h4>🤖 Engine-Specific Results</h4>';
        html += '<div class="engine-comparison-grid">';
        
        Object.keys(results).forEach(engineName => {
            const result = results[engineName];
            html += `<div class="engine-card">`;
            html += `<h5>${this.getEngineDisplayName(engineName)}</h5>`;
            html += `<p><strong>Processing Time:</strong> ${result.processingTimeMs || 'N/A'}ms</p>`;
            html += `<p><strong>Confidence:</strong> ${result.confidenceScores?.overall ? Math.round(result.confidenceScores.overall * 100) + '%' : 'N/A'}</p>`;
            html += `<p><strong>Archetype:</strong> ${result.operatorArchetype?.name || 'Not identified'}</p>`;
            html += `<p><strong>Method:</strong> ${engineName === 'traditional' ? 'Algorithmic Multi-Factor Scoring' : 'LLM with Same Methodology'}</p>`;
            html += `</div>`;
        });
        
        html += '</div>';
        html += '</div>';

        html += '</div>';
        transparencyContent.innerHTML = html;
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

    addEngineResultsTabs(results) {
        console.log('addEngineResultsTabs called with results:', results);
        console.log('Results keys:', Object.keys(results));
        
        // Create tabs container
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'engine-results-tabs';
        tabsContainer.innerHTML = `
            <div class="tabs-header">
                <h3>Detailed Engine Results</h3>
                <p>Compare detailed analysis from each AI engine</p>
            </div>
            <div class="tabs-nav">
                ${Object.keys(results).map((engineName, index) => `
                    <button class="tab-button ${index === 0 ? 'active' : ''}" data-engine="${engineName}">
                        ${this.getEngineDisplayName(engineName)}
                    </button>
                `).join('')}
            </div>
            <div class="tabs-content">
                ${Object.keys(results).map((engineName, index) => `
                    <div class="tab-panel ${index === 0 ? 'active' : ''}" data-engine="${engineName}">
                        ${this.createEngineResultPanel(results[engineName], engineName)}
                    </div>
                `).join('')}
            </div>
        `;

        // Add to the results section
        const resultsSection = document.querySelector('.results-container');
        if (resultsSection) {
            console.log('Appending tabs to results container');
            resultsSection.appendChild(tabsContainer);
        } else {
            console.error('Results container not found!');
        }

        // Add tab switching functionality
        this.setupTabSwitching();
    }

    getEngineDisplayName(engineName) {
        const displayNames = {
            'traditional': 'Traditional AI',
            'openai': 'OpenAI GPT-4',
            'claude': 'Anthropic Claude',
            'gemini': 'Google Gemini',
            'ollama': 'Ollama llama3.1',
            'hybrid': 'Hybrid AI'
        };
        return displayNames[engineName] || engineName;
    }

    createEngineResultPanel(result, engineName) {
        if (!result) {
            return '<div class="no-data">No analysis data available for this engine.</div>';
        }

        return `
            <div class="engine-result-panel">
                <div class="engine-header">
                    <h4>${this.getEngineDisplayName(engineName)} Analysis</h4>
                    <div class="engine-meta">
                        <span class="processing-time">Processing: ${result.processingTimeMs || 'N/A'}ms</span>
                        <span class="confidence">Confidence: ${result.confidenceScores?.overall ? Math.round(result.confidenceScores.overall * 100) + '%' : 'N/A'}</span>
                    </div>
                </div>
                
                <div class="engine-content">
                    <div class="archetype-section">
                        <h5>Operator Archetype</h5>
                        <div class="archetype-card">
                            <div class="archetype-title">${result.operatorArchetype?.title || 'Not Identified'}</div>
                            <div class="archetype-score">Score: ${result.operatorArchetype?.compositeScore ? result.operatorArchetype.compositeScore.toFixed(2) + '/5.0' : 'N/A'}</div>
                            <div class="archetype-evidence">${result.operatorArchetype?.evidence || 'No evidence provided'}</div>
                        </div>
                    </div>

                    <div class="thesis-section">
                        <h5>Acquisition Thesis</h5>
                        <div class="thesis-content">${this.formatThesis(result.acquisitionThesis || 'No thesis available')}</div>
                    </div>

                    <div class="buybox-section">
                        <h5>Personalized Buybox</h5>
                        <div class="buybox-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Criterion</th>
                                        <th>Target Profile</th>
                                        <th>Rationale</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${result.personalizedBuybox ? result.personalizedBuybox.map(item => `
                                        <tr>
                                            <td>${item.criterion || 'N/A'}</td>
                                            <td>${item.target || 'N/A'}</td>
                                            <td>${item.rationale || 'N/A'}</td>
                                        </tr>
                                    `).join('') : '<tr><td colspan="3">No buybox data available</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="insights-section">
                        <h5>AI Insights</h5>
                        <div class="insights-content">
                            ${result.aiInsights ? `
                                <div class="insights-item">
                                    <strong>Key Strengths:</strong>
                                    <ul>${result.aiInsights.keyStrengths?.map(strength => `<li>${strength}</li>`).join('') || '<li>No strengths identified</li>'}</ul>
                                </div>
                                <div class="insights-item">
                                    <strong>Recommendations:</strong>
                                    <ul>${result.aiInsights.recommendations?.map(rec => `<li>${rec}</li>`).join('') || '<li>No recommendations available</li>'}</ul>
                                </div>
                                <div class="insights-item">
                                    <strong>Risks:</strong>
                                    <ul>${result.aiInsights.risks?.map(risk => `<li>${risk}</li>`).join('') || '<li>No risks identified</li>'}</ul>
                                </div>
                            ` : '<p>No insights available for this engine.</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const engineName = button.dataset.engine;
                
                // Remove active class from all buttons and panels
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));
                
                // Add active class to clicked button and corresponding panel
                button.classList.add('active');
                const targetPanel = document.querySelector(`.tab-panel[data-engine="${engineName}"]`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            });
        });
    }

    setupSaveLoadButtons() {
        // Save button
        document.getElementById('saveFormBtn').addEventListener('click', () => {
            this.saveFormData();
        });

        // Load button
        document.getElementById('loadFormBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        // File input handler
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.loadFormData(e.target.files[0]);
        });
    }

    saveFormData() {
        try {
            const formData = this.collectFormData();
            const dataToSave = {
                formData: formData,
                selectedEngines: this.selectedEngines,
                comparisonMode: this.comparisonMode,
                timestamp: new Date().toISOString(),
                version: '1.0'
            };

            const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `buybox-form-responses-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Show success message
            this.showNotification('Form responses saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving form data:', error);
            this.showNotification('Error saving form data. Please try again.', 'error');
        }
    }

    loadFormData(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate the data structure - handle both formats
                const formData = data.formData || data.userData;
                if (!formData) {
                    throw new Error('Invalid file format: missing formData or userData');
                }

                // Load form data
                this.populateForm(formData);

                // Load engine selection
                if (data.selectedEngines) {
                    this.selectedEngines = data.selectedEngines;
                }

                // Load comparison mode
                if (data.comparisonMode !== undefined) {
                    this.comparisonMode = data.comparisonMode;
                    const toggle = document.getElementById('enableComparison');
                    if (toggle) {
                        toggle.checked = data.comparisonMode;
                        this.toggleComparisonMode();
                    }
                }

                this.showNotification('Form responses loaded successfully!', 'success');
            } catch (error) {
                console.error('Error loading form data:', error);
                this.showNotification('Error loading form data. Please check the file format.', 'error');
            }
        };
        reader.readAsText(file);
    }

    populateForm(formData) {
        // Populate competency ratings and evidence
        const competencies = ['sales_marketing', 'operations_systems', 'finance_analytics', 'team_culture', 'product_technology'];
        competencies.forEach(competency => {
            if (formData[competency]) {
                // Set rating
                const ratingSlider = document.getElementById(`${competency}_rating`);
                if (ratingSlider && formData[competency].rating) {
                    ratingSlider.value = formData[competency].rating;
                    const valueDisplay = document.getElementById(`${competency}_value`);
                    if (valueDisplay) {
                        valueDisplay.textContent = formData[competency].rating;
                    }
                }

                // Set evidence
                const evidenceTextarea = document.getElementById(`${competency}_evidence`);
                if (evidenceTextarea && formData[competency].evidence) {
                    evidenceTextarea.value = formData[competency].evidence;
                }
            }
        });

        // Populate other form fields
        const fields = [
            'interests_topics', 'recent_books', 'problem_to_solve', 'customer_affinity',
            'total_liquid_capital', 'potential_loan_amount', 'min_annual_income',
            'time_commitment', 'location_preference', 'location_regions', 'risk_tolerance'
        ];

        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element && formData[field] !== undefined) {
                element.value = formData[field];
            }
        });

        // Update time commitment display
        const timeValue = document.getElementById('time_commitment_value');
        if (timeValue && formData.time_commitment) {
            timeValue.textContent = `${formData.time_commitment} hours/week`;
        }

        // Update location details visibility
        const locationSelect = document.getElementById('location_preference');
        const locationDetails = document.getElementById('location_details');
        if (locationSelect && locationDetails) {
            if (formData.location_preference === 'willing_to_relocate' || formData.location_preference === 'local_only') {
                locationDetails.style.display = 'block';
                document.getElementById('location_regions').required = true;
            } else {
                locationDetails.style.display = 'none';
                document.getElementById('location_regions').required = false;
            }
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        // Set background color based on type
        const colors = {
            success: '#48bb78',
            error: '#f56565',
            info: '#4299e1'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AcquisitionAdvisorApp();
});
