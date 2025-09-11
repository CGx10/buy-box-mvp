class AcquisitionAdvisorApp {
    constructor() {
        console.log('🚀 NEW SCRIPT VERSION LOADED - Multi-Framework Analysis Ready!');
        console.log('🔥 CACHE BUSTING TEST - VERSION 2.0 - MULTI-FRAMEWORK TABLES READY!');
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
        const downloadBtn = document.getElementById('downloadBtn');
        const downloadPDFBtn = document.getElementById('downloadPDFBtn');
        const restartBtn = document.getElementById('restartBtn');
        
        if (downloadBtn) downloadBtn.addEventListener('click', this.downloadPDF.bind(this));
        if (downloadPDFBtn) downloadPDFBtn.addEventListener('click', this.downloadPDF.bind(this));
        if (restartBtn) restartBtn.addEventListener('click', this.restart.bind(this));
        
        // Transparency toggle
        const toggleTransparency = document.getElementById('toggleTransparency');
        if (toggleTransparency) toggleTransparency.addEventListener('click', this.toggleTransparency.bind(this));
        
        // Engine comparison toggle
        const enableComparison = document.getElementById('enableComparison');
        if (enableComparison) enableComparison.addEventListener('change', this.toggleComparisonMode.bind(this));
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

        // Personal Motivation & Vision (Module A.5)
        formData.top_motivators = document.getElementById('top_motivators').value;
        formData.ideal_work_life_balance = document.getElementById('ideal_work_life_balance').value;
        formData.values_alignment = document.getElementById('values_alignment').value;

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

        // Specific Deal Criteria
        formData.target_revenue_range = document.getElementById('target_revenue_range').value;
        formData.target_ebitda_margin = document.getElementById('target_ebitda_margin').value;
        formData.preferred_valuation_range = document.getElementById('preferred_valuation_range').value;

        // Operational & Role Preferences
        formData.ownership_style = document.getElementById('ownership_style').value;
        formData.management_team_importance = document.getElementById('management_team_importance').value;

        // Multi-framework analysis - no methodology selection needed
        formData.analysis_methodology = 'multi_framework';

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
        
        // Enable download buttons
        this.enableDownloadButtons();
    }

    enableDownloadButtons() {
        const downloadBtn = document.getElementById('downloadBtn');
        
        if (downloadBtn) downloadBtn.disabled = false;
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
        if (this.analysisResults.transparencyReport || this.analysisResults.aiTransparency) {
            this.populateTransparencyReport();
        }

        // Check if this is multi-framework analysis
        console.log('🔍 DEBUG: analysis_methodology =', this.analysisResults.analysis_methodology);
        console.log('🔍 DEBUG: analysisResults keys =', Object.keys(this.analysisResults));
        
        if (this.analysisResults.analysis_methodology === 'multi_framework') {
            console.log('🎯 DEBUG: Calling populateMultiFrameworkResults');
            // For multi-framework analysis, hide the single thesis section since we create our own stylized overview
            const thesisSection = document.querySelector('.thesis-section');
            if (thesisSection) {
                thesisSection.style.display = 'none';
            }
            this.populateMultiFrameworkResults();
        } else {
            console.log('🎯 DEBUG: Calling populateSingleFrameworkResults');
            // Show the thesis section for single framework analysis
            const thesisSection = document.querySelector('.thesis-section');
            if (thesisSection) {
                thesisSection.style.display = 'block';
            }
            // Populate acquisition thesis for single framework analysis only
            const thesisContent = document.getElementById('thesisContent');
            thesisContent.innerHTML = this.formatThesis(this.analysisResults.acquisitionThesis);
            this.populateSingleFrameworkResults();
        }
    }

    populateMultiFrameworkResults() {
        const rawResponse = this.analysisResults.rawResponse || '';
        console.log('DEBUG: Raw response length:', rawResponse.length);
        console.log('DEBUG: Raw response first 1000 chars:', rawResponse.substring(0, 1000));
        
        // Parse the multi-framework response
        const frameworks = this.parseMultiFrameworkResponse(rawResponse);
        console.log('Parsed frameworks:', frameworks);
        
        // Display the results
        this.displayMultiFrameworkResults(frameworks);
    }

    /**
     * Main function to display the multi-framework analysis results in the DOM.
     * This definitive version fixes rendering bugs by creating a clean, single
     * introductory section and correctly titling all subsequent parts of the report.
     */
    displayMultiFrameworkResults(frameworks) {
        console.log('🚀 DISPLAY FUNCTION CALLED - v66!');
        const reportContainer = document.getElementById('buyboxSection');
        if (!reportContainer) return;

        reportContainer.innerHTML = ''; // Clear previous results

        // Parse the new Part 1: Executive Summary & Strategic Insights from the raw response
        const rawResponse = this.analysisResults.rawResponse || '';
        let overviewHTML = '';
        
        if (rawResponse.includes('**Part 1: Executive Summary & Strategic Insights**')) {
            // Extract the new Part 1 content
            const part1Match = rawResponse.match(/\*\*Part 1: Executive Summary & Strategic Insights\*\*([\s\S]*?)(?=\*\*Part 2:|$)/);
            if (part1Match) {
                const part1Content = part1Match[1].trim();
                console.log('DEBUG: Part 1 content extracted:', part1Content.substring(0, 500));
                
                // Parse the archetype sections - look for the actual text in the response
                const efficiencyExpertMatch = part1Content.match(/\*\*The Efficiency Expert \(The Value Unlocker\):\*\*([\s\S]*?)(?=\*\*The Growth Catalyst|$)/);
                const growthCatalystMatch = part1Content.match(/\*\*The Growth Catalyst \(The Scaler\):\*\*([\s\S]*?)(?=\*\*How to Use This Report|$)/);
                const howToUseMatch = part1Content.match(/\*\*How to Use This Report[^*]*\*\*([\s\S]*?)(?=\*\*Strategic Implications|$)/);
                const strategicImplicationsMatch = part1Content.match(/\*\*Strategic Implications\*\*([\s\S]*?)(?=\*\*Part 2:|$)/);
                
                console.log('DEBUG: Efficiency Expert match:', efficiencyExpertMatch ? 'Found' : 'Not found');
                console.log('DEBUG: Growth Catalyst match:', growthCatalystMatch ? 'Found' : 'Not found');
                console.log('DEBUG: How to Use match:', howToUseMatch ? 'Found' : 'Not found');
                console.log('DEBUG: Strategic Implications match:', strategicImplicationsMatch ? 'Found' : 'Not found');
                
                const efficiencyExpertText = efficiencyExpertMatch ? efficiencyExpertMatch[1].trim() : 'The Efficiency Expert focuses on finding established businesses with strong revenue but inefficient operations and making them better.';
                const growthCatalystText = growthCatalystMatch ? growthCatalystMatch[1].trim() : 'The Growth Catalyst focuses on finding businesses with great products but underdeveloped market reach and igniting their growth.';
                const howToUseText = howToUseMatch ? howToUseMatch[1].trim() : 'This dual-archetype profile does not force you to choose one path over the other; instead, it provides a powerful lens for evaluating opportunities.';
                const strategicImplicationsText = strategicImplicationsMatch ? strategicImplicationsMatch[1].trim() : 'This duality is a significant advantage, meaning you have two viable strategic paths for your acquisition journey.';
                
                console.log('DEBUG: Efficiency Expert text:', efficiencyExpertText.substring(0, 100));
                console.log('DEBUG: Growth Catalyst text:', growthCatalystText.substring(0, 100));
                console.log('DEBUG: How to Use text:', howToUseText.substring(0, 100));
                console.log('DEBUG: Strategic Implications text:', strategicImplicationsText.substring(0, 100));
                
                overviewHTML = `
                    <div id="analysis-summary" class="pdf-render-section" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                        <h2 style="color: white; margin-top: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Multi-Framework Overview</h2>
                        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">This comprehensive analysis evaluates your entrepreneurial profile through four distinct strategic lenses, providing a 360-degree view of your acquisition potential. Each framework offers unique insights into your strengths, target opportunities, and strategic positioning.</p>
                        
                        <h3 style="color: #ffd700; font-size: 20px; margin-top: 25px; margin-bottom: 15px;">Understanding Your Archetypes</h3>
                        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #4ade80;">
                            <p style="margin: 0 0 10px 0;"><strong style="color: #4ade80;">The Efficiency Expert (The Value Unlocker)</strong>: ${efficiencyExpertText}</p>
                        </div>
                        
                        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #ffd700;">
                            <p style="margin: 0 0 10px 0;"><strong style="color: #60a5fa;">The Growth Catalyst (The Scaler)</strong>: ${growthCatalystText}</p>
                        </div>
                        
                        <h3 style="color: #ffd700; font-size: 20px; margin-top: 25px; margin-bottom: 15px;">Strategic Implications</h3>
                        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">${strategicImplicationsText}</p>
                        
                        <h3 style="color: #ffd700; font-size: 20px; margin-top: 25px; margin-bottom: 15px;">How to Use This Report to Create Your Unified Buybox</h3>
                        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #60a5fa;">
                            <div style="font-size: 16px; line-height: 1.6;">${howToUseText}</div>
                        </div>
                    </div>
                `;
                console.log('DEBUG: New format HTML generated successfully');
            }
        }
        
        // Fallback to old format if new format not found
        if (!overviewHTML) {
            overviewHTML = `
                <div id="analysis-summary" class="pdf-render-section" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                    <h2 style="color: white; margin-top: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Multi-Framework Overview</h2>
                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">This comprehensive analysis evaluates your entrepreneurial profile through four distinct strategic lenses, providing a 360-degree view of your acquisition potential. Each framework offers unique insights into your strengths, target opportunities, and strategic positioning.</p>
                    
                    <h3 style="color: #ffd700; font-size: 20px; margin-top: 25px; margin-bottom: 15px;">Archetype</h3>
                    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #ffd700;">
                        <p style="margin: 0 0 10px 0;"><strong style="color: #ffd700;">The Growth Catalyst</strong> <span style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 12px; font-size: 12px;">$50k-$250k SDE targets</span>: Your high sales & marketing ratings and entrepreneurial orientation make you ideal for scaling businesses with untapped market potential. You excel at identifying growth opportunities and driving revenue expansion.</p>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #4ade80;">
                        <p style="margin: 0 0 10px 0;"><strong style="color: #4ade80;">The Efficiency Expert</strong> <span style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 12px; font-size: 12px;">$250k-$1M SDE targets</span>: Your operational excellence and financial acumen position you to acquire established businesses with operational inefficiencies. You can unlock hidden value through process improvement and margin optimization.</p>
                    </div>
                    
                    <h3 style="color: #ffd700; font-size: 20px; margin-top: 25px; margin-bottom: 15px;">Financial</h3>
                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">The SDE ranges reflect different risk-return profiles: lower targets offer higher growth potential but require more active management, while higher targets provide more predictable returns with operational leverage opportunities.</p>
                    
                    <h3 style="color: #ffd700; font-size: 20px; margin-top: 25px; margin-bottom: 15px;">Strategic Implications</h3>
                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 0;">This duality does not represent a contradiction, but a significant strategic advantage. It means you are equally equipped to either scale a business with untapped market potential (Growth Catalyst) or to acquire a business with solid revenue but inefficient operations and unlock hidden value (Efficiency Expert). The following detailed reports will explore both of these compelling strategic paths.</p>
                </div>
            `;
        }

        // Insert the overview at the top
        if (overviewHTML) {
            console.log('DEBUG: Inserting overview HTML, length:', overviewHTML.length);
            reportContainer.insertAdjacentHTML('afterbegin', overviewHTML);
            console.log('DEBUG: Overview HTML inserted successfully');
            
            // Confirm the overview element is in the DOM
            const overviewElement = reportContainer.querySelector('#analysis-summary');
            if (overviewElement) {
                console.log('DEBUG: Overview element successfully inserted into DOM');
            } else {
                console.log('DEBUG: Overview element NOT found in DOM');
            }
        } else {
            console.log('DEBUG: No overview HTML to insert');
        }

        // Create individual framework cards with subtle colors
        const frameworkColors = [
            { primary: '#e6f3ff', secondary: '#b3d9ff', accent: '#4299e1', border: '#3182ce' }, // Light Blue
            { primary: '#f0fff4', secondary: '#c6f6d5', accent: '#38a169', border: '#2f855a' }, // Light Green
            { primary: '#fffaf0', secondary: '#fbd38d', accent: '#ed8936', border: '#dd6b20' }, // Light Orange
            { primary: '#faf5ff', secondary: '#e9d8fd', accent: '#805ad5', border: '#6b46c1' }  // Light Purple
        ];

        console.log('DEBUG: Starting to create framework cards, count:', frameworks.length);
        frameworks.forEach((framework, index) => {
            console.log(`DEBUG: Creating framework card ${index + 1}/${frameworks.length}: ${framework.title}`);
            const colors = frameworkColors[index % frameworkColors.length];
            const frameworkCard = document.createElement('div');
            frameworkCard.className = 'framework-card';
            // Remove "Analysis" from framework title
            const cleanTitle = framework.title.replace(' Analysis', '');
            
            frameworkCard.style.cssText = `
                background: ${colors.primary};
                border: 2px solid ${colors.border};
                border-radius: 8px;
                padding: 25px;
                margin: 25px 0;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                color: #2d3748;
            `;
            frameworkCard.id = `framework-section-${index}`;
            frameworkCard.classList.add('pdf-framework-section');

            const frameworkHTML = `
                <h3 style="color: ${colors.accent}; margin-top: 0; border-bottom: 2px solid ${colors.border}; padding-bottom: 10px; font-size: 20px;">${cleanTitle}</h3>
                <p style="font-style: italic; color: #4a5568; margin-bottom: 20px; font-size: 14px; background: ${colors.secondary}; padding: 15px; border-radius: 6px;">${framework.methodologyOverview}</p>
                
                <h4 style="color: ${colors.accent}; margin-top: 20px; font-size: 16px;">Your Acquisition Thesis</h4>
                <div style="background: white; padding: 20px; border-left: 4px solid ${colors.accent}; margin: 15px 0; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <p style="margin: 0; color: #2d3748; font-size: 14px; line-height: 1.6;">${framework.acquisitionThesis}</p>
                </div>
                
                <h4 style="color: ${colors.accent}; margin-top: 20px; font-size: 16px;">Your Personalized Buybox</h4>
                <div style="overflow-x: auto; margin-top: 15px;">
                    <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <thead>
                            <tr style="background: ${colors.accent}; color: white;">
                                <th style="padding: 12px; text-align: left; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Criterion</th>
                                <th style="padding: 12px; text-align: left; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Your Target Profile</th>
                                <th style="padding: 12px; text-align: left; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Rationale</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(framework.buyboxRows || []).map((row, rowIndex) => `
                                <tr style="border-bottom: 1px solid #e5e7eb; background: ${rowIndex % 2 === 0 ? 'white' : '#f9fafb'};">
                                    <td style="padding: 12px; font-weight: bold; color: #2d3748; font-size: 12px;">${row.criterion}</td>
                                    <td style="padding: 12px; color: #374151; font-size: 12px;">${row.profile || 'Not specified'}</td>
                                    <td style="padding: 12px; color: #6b7280; font-size: 12px;">${row.rationale}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            frameworkCard.innerHTML = frameworkHTML;
            reportContainer.appendChild(frameworkCard);
            console.log(`DEBUG: Framework card ${index + 1} appended successfully`);
        });

        reportContainer.style.display = 'block';
    }

    populateSingleFrameworkResults() {
        // Populate buybox table for single framework
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

    parseMultiFrameworkResponse(rawResponse) {
        const frameworks = [];

        // Debug: Log the raw response to see what we're actually getting
        console.log("DEBUG: Raw response length:", rawResponse.length);
        console.log("DEBUG: Raw response first 1000 chars:", rawResponse.substring(0, 1000));
        console.log("DEBUG: Raw response contains 'Part 2':", rawResponse.includes('Part 2'));
        console.log("DEBUG: Raw response contains 'Detailed Framework Reports':", rawResponse.includes('Detailed Framework Reports'));
        
        // Debug: Look for all headers in the response
        const headerMatches = rawResponse.match(/^#{1,6} .*$/gm);
        console.log("DEBUG: All headers found:", headerMatches);

        // Check for different header formats
        const hasNewFormat = rawResponse.includes('### --- Traditional M&A Expert Analysis ---');
        const hasOldFormat = rawResponse.includes('## Traditional M&A Expert Analysis');
        const hasPart2Format = rawResponse.includes('**Part 2: Detailed Framework Reports**');
        
        console.log('DEBUG: Has new format (### ---):', hasNewFormat);
        console.log('DEBUG: Has old format (##):', hasOldFormat);
        console.log('DEBUG: Has Part 2 format:', hasPart2Format);
        
        let reportsBlock = '';
        let frameworkMatches = [];
        
        if (hasNewFormat) {
            // New format: ### --- Framework Name ---
            const sections = rawResponse.split(/### --- Traditional M&A Expert Analysis ---/);
            if (sections.length < 2) {
                console.error("DEBUG: '### --- Traditional M&A Expert Analysis ---' header not found. Parsing failed.");
                return frameworks;
            }
            reportsBlock = '### --- Traditional M&A Expert Analysis ---' + sections[1];
            frameworkMatches = reportsBlock.split(/(### --- (?:Traditional M&A Expert Analysis|The Hedgehog Concept Analysis|SWOT Analysis|Entrepreneurial Orientation \(EO\) Analysis) ---)/);
        } else if (hasPart2Format) {
            // New Part 2 format: **Part 2: Detailed Framework Reports**
            const sections = rawResponse.split(/\*\*Part 2: Detailed Framework Reports\*\*/);
            if (sections.length < 2) {
                console.error("DEBUG: 'Part 2: Detailed Framework Reports' header not found. Parsing failed.");
                return frameworks;
            }
            reportsBlock = sections[1];
            frameworkMatches = reportsBlock.split(/(## (?:Traditional M&A Expert Analysis|The Hedgehog Concept Analysis|SWOT Analysis|Entrepreneurial Orientation \(EO\) Analysis))/);
        } else if (hasOldFormat) {
            // Old format: ## Framework Name
            const sections = rawResponse.split(/## Traditional M&A Expert Analysis/);
            if (sections.length < 2) {
                console.error("DEBUG: '## Traditional M&A Expert Analysis' header not found. Parsing failed.");
                return frameworks;
            }
            reportsBlock = '## Traditional M&A Expert Analysis' + sections[1];
            frameworkMatches = reportsBlock.split(/(## (?:Traditional M&A Expert Analysis|The Hedgehog Concept Analysis|SWOT Analysis|Entrepreneurial Orientation \(EO\) Analysis))/);
        } else {
            console.error("DEBUG: No recognized framework headers found. Parsing failed.");
            return frameworks;
        }
        
        console.log('DEBUG: Framework matches length:', frameworkMatches.length);
        
        for (let i = 1; i < frameworkMatches.length; i += 2) {
            let frameworkName = frameworkMatches[i];
            const frameworkContent = frameworkMatches[i + 1];
            
            // Clean up framework name based on format
            if (hasNewFormat) {
                frameworkName = frameworkName.replace(/### --- /g, '').replace(/ ---/g, '').trim();
            } else {
                frameworkName = frameworkName.replace(/## /g, '').trim();
            }
            
            console.log(`DEBUG: Processing ${frameworkName}, content length:`, frameworkContent ? frameworkContent.length : 0);
            
            if (!frameworkContent) continue;
            
            const framework = this.parseFrameworkContent(frameworkName, frameworkContent);
            if (framework) {
                frameworks.push(framework);
            }
        }

        console.log(`DEBUG: Final parsed frameworks array:`, frameworks);
        return frameworks;
    }
    
    parseFrameworkContent(frameworkName, content) {
        const lines = content.split('\n');
        
        console.log(`DEBUG: ${frameworkName} - Content length:`, content.length);
        console.log(`DEBUG: ${frameworkName} - First 300 chars:`, content.substring(0, 300));
        
        let framework = {
            title: frameworkName,
            methodologyOverview: '',
            acquisitionThesis: '',
            buyboxTitle: `Your Personalized Buybox`,
            buyboxRows: []
        };
        
        // Extract methodology overview (simplified format)
        const methodologyMatch = content.match(/\*([^*]+)\*/);
        if (methodologyMatch) {
            framework.methodologyOverview = methodologyMatch[1].trim();
        }
        
        // Extract acquisition thesis using reliable markers
        const thesisMatch = content.match(/<thesis_start>\s*\n(.+?)\s*\n<thesis_end>/s);
        if (thesisMatch) {
            framework.acquisitionThesis = thesisMatch[1].trim();
            console.log(`DEBUG: ${frameworkName} - Found acquisition thesis (markers):`, framework.acquisitionThesis.substring(0, 100) + '...');
        } else {
            console.log(`DEBUG: ${frameworkName} - No thesis markers found`);
            console.log(`DEBUG: ${frameworkName} - Content contains '<thesis_start>':`, content.includes('<thesis_start>'));
            console.log(`DEBUG: ${frameworkName} - Content contains '<thesis_end>':`, content.includes('<thesis_end>'));
        }
        
        // Extract table rows - look for the table after the buybox header (handle both with and without colons)
        const buyboxHeaderRegex = /\*\*Your Personalized Buybox\*\*:?\s*\n/;
        let buyboxHeaderMatch = content.match(buyboxHeaderRegex);
        
        console.log(`DEBUG: ${frameworkName} - Using fixed regex:`, buyboxHeaderMatch ? 'Found' : 'Not Found');
        
        console.log(`DEBUG: ${frameworkName} - buyboxHeaderMatch:`, buyboxHeaderMatch ? 'Found' : 'Not Found');
        console.log(`DEBUG: ${frameworkName} - Looking for pattern:`, buyboxHeaderRegex);
        console.log(`DEBUG: ${frameworkName} - Content contains 'Your Buybox':`, content.includes('Your Buybox'));
        
        // Debug: Show the actual content around "Your Buybox"
        const buyboxIndex = content.indexOf('Your Buybox');
        if (buyboxIndex !== -1) {
            const start = Math.max(0, buyboxIndex - 50);
            const end = Math.min(content.length, buyboxIndex + 100);
            console.log(`DEBUG: ${frameworkName} - Content around 'Your Buybox':`, content.substring(start, end));
        }
        
        // Debug: Show the full content for this framework
        console.log(`DEBUG: ${frameworkName} - Full content length:`, content.length);
        console.log(`DEBUG: ${frameworkName} - Full content:`, content);

        if (buyboxHeaderMatch) {
            const tableStart = buyboxHeaderMatch.index + buyboxHeaderMatch[0].length;
            const remainingContent = content.substring(tableStart);
            
            // Find the end of the table (before the next --- or **)
            const tableEndRegex = /\n\n---|\n\n\*\*/;
            const tableEndMatch = remainingContent.match(tableEndRegex);
            const tableEnd = tableEndMatch ? tableEndMatch.index : remainingContent.length;
            const tableContent = remainingContent.substring(0, tableEnd);
            
            console.log(`DEBUG: ${frameworkName} - tableStart:`, tableStart);
            console.log(`DEBUG: ${frameworkName} - tableEndMatch:`, tableEndMatch ? 'Found' : 'Not Found');
            console.log(`DEBUG: ${frameworkName} - tableEnd:`, tableEnd);
            console.log(`DEBUG: ${frameworkName} - Extracted table content (first 200 chars):`, tableContent.substring(0, 200) + '...');
            
            framework.buyboxRows = this.parseTableRows(tableContent);
            console.log(`DEBUG: Parsed ${framework.buyboxRows.length} rows for ${frameworkName}`);
        } else {
            console.log(`DEBUG: No buybox header match found for ${frameworkName}`);
        }
        
        return framework;
    }
    
    parseTableRows(tableContent) {
        const rows = [];
        const lines = tableContent.split('\n');
        
        let currentRow = null;
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Skip empty lines, separator lines, and header lines
            if (!trimmedLine || trimmedLine.includes('---') || trimmedLine.includes('Criterion')) {
                continue;
            }
            
            // Check if this is a table row
            if (trimmedLine.includes('|')) {
                const cells = trimmedLine.split('|').map(cell => cell.trim()).filter(cell => cell);
                if (cells.length >= 3) {
                    // Save previous row if it exists
                    if (currentRow) {
                        rows.push(currentRow);
                    }
                    // Start new row
                    currentRow = {
                        criterion: cells[0],
                        profile: cells[1],
                        rationale: cells[2]
                    };
                }
            } else if (currentRow && trimmedLine.length > 0) {
                // This is a continuation line - append to rationale
                currentRow.rationale += ' ' + trimmedLine;
            }
        }
        
        // Add the last row if it exists
        if (currentRow) {
            rows.push(currentRow);
        }
        
        return rows;
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

    async downloadPDF() {
        if (!this.analysisResults) return;

        console.log("🚀 NEW PDF VERSION LOADED - Enhanced Styling v61!");
        console.log("DEBUG: Starting definitive PDF generation with enhanced styling...");
        
        try {
            // Show loading state
            const downloadBtn = document.getElementById('downloadBtn');
            const originalText = downloadBtn.textContent;
            downloadBtn.textContent = '🔄 Generating PDF...';
            downloadBtn.disabled = true;

            const pdf = new jspdf.jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            });

            // The selector is changed to be more robust.
            const elementsToRender = document.querySelectorAll('.pdf-render-section, .pdf-framework-section');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const pageMargin = 40;
            const contentWidth = pdfWidth - (pageMargin * 2);
            const contentHeight = pdfHeight - (pageMargin * 2);

            for (let i = 0; i < elementsToRender.length; i++) {
                const originalElement = elementsToRender[i];
                
                if (i > 0) {
                    pdf.addPage();
                }

                const tempContainer = document.createElement('div');
                tempContainer.style.position = 'absolute';
                tempContainer.style.left = '-9999px';
                tempContainer.style.width = contentWidth + 'pt';
                tempContainer.style.backgroundColor = 'white';
                tempContainer.style.color = '#333';

                // --- ENHANCED STYLING FOR PDF ---
                const style = document.createElement('style');
                style.innerHTML = `
                    body { font-family: Helvetica, Arial, sans-serif; }
                    h2 { font-size: 16pt; font-weight: bold; margin-bottom: 15pt; border-bottom: 2px solid #eee; padding-bottom: 5pt; }
                    h3 { font-size: 14pt; font-weight: bold; margin-top: 20pt; margin-bottom: 10pt; }
                    p { font-size: 10pt; line-height: 1.5; margin-bottom: 10pt; }
                    strong { font-weight: bold; }
                    ul { margin-left: 20pt; margin-bottom: 10pt; }
                    li { font-size: 10pt; line-height: 1.5; margin-bottom: 5pt; }
                    table { font-size: 8.5pt; line-height: 1.2; border-collapse: collapse; width: 100%; margin-top: 10pt; }
                    th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
                    th { font-weight: bold; background-color: #f9f9f9; }
                    .framework-container { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-top: 20px; }
                `;
                tempContainer.appendChild(style);
                
                const clonedElement = originalElement.cloneNode(true);
                tempContainer.appendChild(clonedElement);
                document.body.appendChild(tempContainer);
                
                const canvas = await html2canvas(tempContainer, {
                    scale: 2,
                    useCORS: true,
                    logging: true,
                    backgroundColor: '#ffffff'
                });
                
                document.body.removeChild(tempContainer);

                const imgData = canvas.toDataURL('image/png');
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;
                const imgWidth = contentWidth;
                const imgHeight = imgWidth / ratio;

                // --- Smart Page Breaking Logic ---
                let position = 0;
                if (imgHeight > contentHeight) {
                    let pageCount = Math.ceil(imgHeight / contentHeight);
                    for (let j = 0; j < pageCount; j++) {
                        if (j > 0) {
                           pdf.addPage();
                        }
                        let sourceY = position;
                        let sourceHeight = Math.min(contentHeight, imgHeight - sourceY);
                        
                        let canvasSourceY = sourceY * (canvasHeight / imgHeight);
                        let canvasSourceHeight = sourceHeight * (canvasHeight / imgHeight);

                        const pageCanvas = document.createElement('canvas');
                        pageCanvas.width = canvasWidth;
                        pageCanvas.height = canvasSourceHeight;
                        const pageCtx = pageCanvas.getContext('2d');
                        
                        const img = new Image();
                        img.src = imgData;
                        await new Promise(resolve => img.onload = resolve);

                        pageCtx.drawImage(img, 0, canvasSourceY, canvasWidth, canvasSourceHeight, 0, 0, canvasWidth, canvasSourceHeight);
                        const pageImgData = pageCanvas.toDataURL('image/png');

                        pdf.addImage(pageImgData, 'PNG', pageMargin, pageMargin, imgWidth, sourceHeight);
                        position += sourceHeight;
                    }
                } else {
                     pdf.addImage(imgData, 'PNG', pageMargin, pageMargin, imgWidth, imgHeight);
                }
            }

            pdf.save('Buybox-Generator-Report-Definitive.pdf');
            console.log("DEBUG: Definitive PDF generation with enhanced styling complete.");

            // Reset button state
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again or use the Markdown download instead.');
            // Reset button state
            const downloadBtn = document.getElementById('downloadBtn');
            downloadBtn.textContent = 'Download Report';
            downloadBtn.disabled = false;
        }
    }

    buildPDFContentWithStyles() {
        const results = this.analysisResults;
        const frameworks = this.parsedFrameworks || [];

        // Get the embedded styles which are crucial for formatting
        const pdfStyles = this.getPDFStyles();

        let content = `
            <div class="pdf-header">
                <h1>Buybox Generator Report</h1>
                <p class="pdf-subtitle">Multi-Framework Acquisition Analysis</p>
                <p class="pdf-date">Generated on: ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="pdf-section">
                <h2>🤖 AI Analysis Summary</h2>
                <div class="pdf-content">
                    <p><strong>Analysis Methodology:</strong> ${results.analysis_methodology || 'Multi-Framework Analysis'}</p>
                    <p><strong>AI Engine:</strong> ${results.aiEngine || 'Not specified'}</p>
                    <p><strong>Confidence Score:</strong> ${results.confidenceScores?.overall || 'Not available'}</p>
                </div>
            </div>

            <div class="pdf-section">
                <h2>Multi-Framework Analysis Overview</h2>
                <div class="pdf-content">
                    <p>${results.acquisitionThesis || 'No overview available'}</p>
                </div>
            </div>
        `;

        // Add each framework analysis
        frameworks.forEach((framework, index) => {
            content += `
                <div class="pdf-framework-section">
                    <h2 class="pdf-framework-title">${framework.title}</h2>
                    <p class="pdf-methodology">${framework.methodologyOverview}</p>
                    
                    <h3>Your Acquisition Thesis</h3>
                    <div class="pdf-thesis">
                        <p>${framework.acquisitionThesis || 'No thesis available'}</p>
                    </div>
                    
                    <h3>Your Personalized Buybox</h3>
                    <table class="pdf-table">
                        <thead>
                            <tr>
                                <th>Criterion</th>
                                <th>Your Target Profile</th>
                                <th>Rationale</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${framework.buyboxRows.map(row => `
                                <tr>
                                    <td class="pdf-criterion">${row.criterion}</td>
                                    <td class="pdf-target">${row.target}</td>
                                    <td class="pdf-rationale">${row.rationale}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        });

        // Add AI Transparency section if available
        if (results.aiTransparency) {
            content += `
                <div class="pdf-section">
                    <h2>🔍 AI Transparency & Methodology</h2>
                    <div class="pdf-content">
                        <p>${results.aiTransparency}</p>
                    </div>
                </div>
            `;
        }

        // Combine styles and content into a single HTML document string
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Buybox Report</title>
                <style>${pdfStyles}</style>
            </head>
            <body>
                <div class="pdf-container">
                    ${content}
                </div>
            </body>
            </html>
        `;
    }

    buildPDFContent() {
        console.log('📄 Building PDF content with enhanced formatting...');
        const results = this.analysisResults;
        const frameworks = this.parsedFrameworks || [];

        let content = `
            <div class="pdf-header">
                <h1>Buybox Generator Report</h1>
                <p class="pdf-subtitle">Multi-Framework Acquisition Analysis</p>
                <p class="pdf-date">Generated on: ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="pdf-section">
                <h2>🤖 AI Analysis Summary</h2>
                <div class="pdf-content">
                    <p><strong>Analysis Methodology:</strong> ${results.analysis_methodology || 'Multi-Framework Analysis'}</p>
                    <p><strong>AI Engine:</strong> ${results.aiEngine || 'Not specified'}</p>
                    <p><strong>Confidence Score:</strong> ${results.confidenceScores?.overall || 'Not available'}</p>
                </div>
            </div>

            <div class="pdf-section">
                <h2>Multi-Framework Analysis Overview</h2>
                <div class="pdf-content">
                    <p>${results.acquisitionThesis || 'No overview available'}</p>
                </div>
            </div>
        `;

        // Add each framework analysis
        frameworks.forEach((framework, index) => {
            content += `
                <div class="pdf-framework-section">
                    <h2 class="pdf-framework-title">${framework.title}</h2>
                    <p class="pdf-methodology">${framework.methodologyOverview}</p>
                    
                    <h3>Your Acquisition Thesis</h3>
                    <div class="pdf-thesis">
                        <p>${framework.acquisitionThesis || 'No thesis available'}</p>
                    </div>
                    
                    <h3>Your Personalized Buybox</h3>
                    <table class="pdf-table">
                        <thead>
                            <tr>
                                <th>Criterion</th>
                                <th>Your Target Profile</th>
                                <th>Rationale</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${framework.buyboxRows.map(row => `
                                <tr>
                                    <td class="pdf-criterion">${row.criterion}</td>
                                    <td class="pdf-target">${row.target}</td>
                                    <td class="pdf-rationale">${row.rationale}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        });

        // Add AI Transparency section if available
        if (results.aiTransparency) {
            content += `
                <div class="pdf-section">
                    <h2>🔍 AI Transparency & Methodology</h2>
                    <div class="pdf-content">
                        <p>${results.aiTransparency}</p>
                    </div>
                </div>
            `;
        }

        return content;
    }

    getPDFStyles() {
        return `
            body {
                font-family: 'Inter', sans-serif;
                color: #333;
                background-color: #fff;
                margin: 0;
                padding: 0;
            }
            .pdf-container {
                padding: 40pt;
                width: 100%;
                max-width: 800px;
                margin: 0 auto;
            }
            .pdf-header {
                text-align: center;
                border-bottom: 2px solid #2c3e50;
                padding-bottom: 20pt;
                margin-bottom: 30pt;
            }
            .pdf-header h1 {
                font-size: 28pt;
                margin: 0 0 10pt 0;
                color: #2c3e50;
                font-weight: bold;
            }
            .pdf-subtitle {
                font-size: 16pt;
                color: #7f8c8d;
                margin: 0 0 5pt 0;
                font-weight: 500;
            }
            .pdf-date {
                font-size: 12pt;
                color: #95a5a6;
                margin: 0;
            }
            .pdf-section {
                margin-bottom: 30pt;
                page-break-inside: avoid;
            }
            .pdf-section h2 {
                font-size: 20pt;
                color: #2c3e50;
                margin: 0 0 15pt 0;
                padding-bottom: 8pt;
                border-bottom: 2px solid #3498db;
                font-weight: bold;
            }
            .pdf-content {
                margin-bottom: 20pt;
                font-size: 12pt;
                line-height: 1.6;
            }
            .pdf-content p {
                margin: 0 0 10pt 0;
            }
            .pdf-framework-section {
                background-color: #ffffff;
                border: 2px solid #e1e8ed;
                border-radius: 8pt;
                padding: 20pt;
                margin-bottom: 25pt;
                page-break-inside: avoid;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .pdf-framework-title {
                font-size: 18pt;
                color: #2c3e50;
                margin: 0 0 10pt 0;
                font-weight: bold;
                border-bottom: 1px solid #bdc3c7;
                padding-bottom: 8pt;
            }
            .pdf-methodology {
                font-style: italic;
                color: #7f8c8d;
                margin: 0 0 15pt 0;
                font-size: 11pt;
                background-color: #f8f9fa;
                padding: 8pt;
                border-radius: 4pt;
            }
            .pdf-framework-section h3 {
                font-size: 14pt;
                color: #34495e;
                margin: 20pt 0 10pt 0;
                font-weight: bold;
            }
            .pdf-thesis {
                background-color: #f8f9fa;
                padding: 15pt;
                border-left: 4px solid #3498db;
                margin-bottom: 15pt;
                border-radius: 4pt;
                font-size: 11pt;
                line-height: 1.5;
            }
            .pdf-thesis p {
                margin: 0;
            }
            .pdf-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10pt;
                background-color: white;
                font-size: 10pt;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .pdf-table th {
                background-color: #34495e;
                color: white;
                padding: 10pt 8pt;
                text-align: left;
                font-weight: bold;
                font-size: 10pt;
                border: 1px solid #2c3e50;
            }
            .pdf-table td {
                padding: 8pt;
                border: 1px solid #ddd;
                font-size: 9pt;
                vertical-align: top;
                line-height: 1.4;
            }
            .pdf-table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            .pdf-criterion {
                font-weight: bold;
                width: 20%;
                background-color: #ecf0f1;
            }
            .pdf-target {
                width: 35%;
            }
            .pdf-rationale {
                width: 45%;
            }
        `;
    }

    applyPDFStyling(container) {
        // Add comprehensive PDF styling
        console.log('🎨 Applying enhanced PDF styling...');
        const style = document.createElement('style');
        style.textContent = `
            * {
                box-sizing: border-box;
            }
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 20px;
                background: white;
            }
            .pdf-header {
                text-align: center;
                margin-bottom: 40px;
                padding-bottom: 20px;
                border-bottom: 3px solid #2c3e50;
                page-break-after: avoid;
            }
            .pdf-header h1 {
                font-size: 32px;
                margin: 0 0 10px 0;
                color: #2c3e50;
                font-weight: bold;
            }
            .pdf-subtitle {
                font-size: 18px;
                color: #7f8c8d;
                margin: 0 0 5px 0;
                font-weight: 500;
            }
            .pdf-date {
                font-size: 14px;
                color: #95a5a6;
                margin: 0;
            }
            .pdf-section {
                margin-bottom: 40px;
                page-break-inside: avoid;
                clear: both;
            }
            .pdf-section h2 {
                font-size: 24px;
                color: #2c3e50;
                margin: 0 0 20px 0;
                padding-bottom: 8px;
                border-bottom: 2px solid #3498db;
                font-weight: bold;
            }
            .pdf-content {
                margin-bottom: 20px;
                font-size: 14px;
                line-height: 1.7;
            }
            .pdf-content p {
                margin: 0 0 15px 0;
            }
            .pdf-framework-section {
                margin-bottom: 50px;
                padding: 25px;
                border: 2px solid #e1e8ed;
                border-radius: 10px;
                background-color: #ffffff;
                page-break-inside: avoid;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .pdf-framework-title {
                font-size: 22px;
                color: #2c3e50;
                margin: 0 0 15px 0;
                font-weight: bold;
                border-bottom: 1px solid #bdc3c7;
                padding-bottom: 10px;
            }
            .pdf-methodology {
                font-style: italic;
                color: #7f8c8d;
                margin: 0 0 20px 0;
                font-size: 14px;
                background-color: #f8f9fa;
                padding: 10px;
                border-radius: 5px;
            }
            .pdf-framework-section h3 {
                font-size: 18px;
                color: #34495e;
                margin: 25px 0 15px 0;
                font-weight: bold;
            }
            .pdf-thesis {
                background-color: #f8f9fa;
                padding: 20px;
                border-left: 5px solid #3498db;
                margin-bottom: 20px;
                border-radius: 5px;
                font-size: 14px;
                line-height: 1.6;
            }
            .pdf-thesis p {
                margin: 0;
            }
            .pdf-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
                background-color: white;
                font-size: 13px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .pdf-table th {
                background-color: #34495e;
                color: white;
                padding: 15px 12px;
                text-align: left;
                font-weight: bold;
                font-size: 14px;
                border: 1px solid #2c3e50;
            }
            .pdf-table td {
                padding: 12px;
                border: 1px solid #ddd;
                font-size: 13px;
                vertical-align: top;
                line-height: 1.5;
            }
            .pdf-table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            .pdf-table tr:hover {
                background-color: #e8f4f8;
            }
            .pdf-criterion {
                font-weight: bold;
                width: 20%;
                background-color: #ecf0f1;
            }
            .pdf-target {
                width: 35%;
            }
            .pdf-rationale {
                width: 45%;
            }
            .page-break {
                page-break-before: always;
            }
        `;
        container.appendChild(style);
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
        
        if (results.personalizedBuybox && Array.isArray(results.personalizedBuybox)) {
            results.personalizedBuybox.forEach(row => {
                markdown += `| ${row.criterion || 'N/A'} | ${row.target || 'N/A'} | ${row.rationale || 'N/A'} |\n`;
            });
        } else {
            markdown += `| No buybox data available | - | - |\n`;
        }
        
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
        const report = this.analysisResults.transparencyReport || this.analysisResults.aiTransparency;
        if (!report) return;

        let html = '<div class="transparency-sections">';
        
        // Check if this is the new Gemini format (string) or old format (object)
        if (typeof report === 'string') {
            // New Gemini format - display the raw transparency text directly
            html += `<div class="transparency-content-simple">${report}</div>`;
        } else {
            // Old format - display structured data
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
        }
        
        // Add Gemini Debug Information for single engine results
        if (this.analysisResults.aiEngine === 'Google Gemini' && this.analysisResults.promptUsed) {
            html += '<div class="gemini-debug-simple">';
            html += '<h4>🔍 Gemini Debug Information</h4>';
            html += '<div class="debug-meta">';
            html += '<span><strong>Model:</strong> gemini-1.5-flash</span>';
            html += '<span><strong>Processing Time:</strong> ' + (this.analysisResults.processingTimeMs || 'N/A') + 'ms</span>';
            html += '</div>';
            html += '<h5>📝 Actual AI Prompt Sent to Gemini:</h5>';
            html += `<pre class="prompt-code">${this.analysisResults.promptUsed}</pre>`;
            html += '</div>';
        }
        
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
            const enableComparison = document.getElementById('enableComparison');
            this.comparisonMode = enableComparison ? enableComparison.checked : false;
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
        const enableComparison = document.getElementById('enableComparison');
        this.comparisonMode = enableComparison ? enableComparison.checked : false;
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
            html += `<p><strong>Archetype:</strong> ${result.operatorArchetype?.name || result.operatorArchetype?.title || result.operatorArchetype?.key || 'Not identified'}</p>`;
            html += `<p><strong>Method:</strong> ${engineName === 'traditional' ? 'Algorithmic Multi-Factor Scoring' : 'LLM with Same Methodology'}</p>`;
            
                // Add Gemini-specific configuration details
                if (engineName === 'gemini') {
                    html += `<div class="engine-config">`;
                    html += `<h6>Configuration:</h6>`;
                    html += `<p><strong>Model:</strong> gemini-1.5-flash</p>`;
                    html += `<p><strong>API Version:</strong> v1beta</p>`;
                    html += `<p><strong>Max Tokens:</strong> 8,192</p>`;
                    html += `<p><strong>Temperature:</strong> 0.7</p>`;
                    html += `<p><strong>Prompt Length:</strong> ${result.promptUsed ? result.promptUsed.length + ' characters' : 'N/A'}</p>`;
                    html += `</div>`;
                }
            
            html += `</div>`;
        });
        
        html += '</div>';
        html += '</div>';

                // Gemini Debug Information
                html += '<div class="transparency-section-item">';
                html += '<h4>🔍 Gemini Debug Information</h4>';
                html += '<div class="debug-info">';
                html += '<p><strong>Model Used:</strong> gemini-1.5-flash</p>';
                html += '<p><strong>Prompt Methodology:</strong> Same as Traditional AI (Multi-Factor Scoring)</p>';
                html += '<p><strong>Archetype Detection:</strong> Weighted composite scoring with key phrase analysis</p>';
                html += '<p><strong>Key Phrases Analyzed:</strong> efficiency, process, systems, automation, workflow, optimization, streamline, cost reduction, scalability, operations</p>';
                html += '<p><strong>Confidence Indicators:</strong> successfully, achieved, led, increased, improved, delivered, exceeded, won, built, created</p>';
                
                // Show actual prompt if available
                const geminiResult = results.gemini;
                if (geminiResult && geminiResult.promptUsed) {
                    html += '<div class="prompt-section">';
                    html += '<h5>📝 Actual AI Prompt Sent to Gemini:</h5>';
                    html += `<pre style="white-space: pre-wrap; font-family: monospace; font-size: 12px; background: #2d3748; color: #e2e8f0; padding: 20px; border-radius: 8px; border: 1px solid #4a5568; max-height: 600px; overflow-y: auto; line-height: 1.4;">${geminiResult.promptUsed}</pre>`;
                    html += '</div>';
                } else {
                    html += '<p><em>Check browser console for detailed prompt and response debugging information.</em></p>';
                }
                
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
        const priorities = ['hybrid', 'traditional', 'gemini', 'openai', 'claude', 'ollama'];
        for (const engine of priorities) {
            if (results[engine]) return results[engine];
        }
        
        // Fallback to any available engine
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
                ${Object.keys(results).map((engineName, index) => {
                    console.log(`Generating tab for ${engineName} (index ${index}):`, results[engineName]);
                    return `
                        <div class="tab-panel ${index === 0 ? 'active' : ''}" data-engine="${engineName}">
                            ${this.createEngineResultPanel(results[engineName], engineName)}
                        </div>
                    `;
                }).join('')}
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
        console.log(`Creating engine result panel for ${engineName}:`, result);
        
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
            // Personal Motivation & Vision (Module A.5)
            'top_motivators', 'ideal_work_life_balance', 'values_alignment',
            // Industry profile
            'interests_topics', 'recent_books', 'problem_to_solve', 'customer_affinity',
            // Financial and lifestyle
            'total_liquid_capital', 'potential_loan_amount', 'min_annual_income',
            'time_commitment', 'location_preference', 'location_regions', 'risk_tolerance',
            // Specific Deal Criteria
            'target_revenue_range', 'target_ebitda_margin', 'preferred_valuation_range',
            // Operational & Role Preferences
            'ownership_style', 'management_team_importance',
            // Analysis methodology
            'analysis_methodology'
        ];

        fields.forEach(field => {
            if (field === 'analysis_methodology') {
                // Multi-framework analysis - no methodology selection to restore
                // Skip this field as it's automatically set to 'multi_framework'
            } else {
                const element = document.getElementById(field);
                if (element && formData[field] !== undefined) {
                    element.value = formData[field];
                }
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
