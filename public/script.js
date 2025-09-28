class AcquisitionAdvisorApp {
    constructor() {
        // Dynamically extract version from script tag
        this.scriptVersion = this.getScriptVersion();
        // Debug flag - set to false for production
        this.debugMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        // API Configuration
        this.apiBaseUrl = this.getApiBaseUrl();
        
        if (this.debugMode) {
            console.log('🚀 NEW SCRIPT VERSION LOADED - Multi-Framework Analysis Ready!');
            console.log(`🔥 CACHE BUSTING TEST - VERSION ${this.scriptVersion} - MULTI-FRAMEWORK TABLES READY!`);
            console.log(`🌐 API Base URL: ${this.apiBaseUrl}`);
        }
        
        this.currentPhase = 1;
        this.analysisResults = null;
        this.availableEngines = {};
        this.availableModels = [];
        this.selectedEngine = 'traditional';
        this.selectedEngines = [];
        this.comparisonMode = false;
        this.init();
        
        // Initialize admin manager if available
        if (window.adminManager) {
            window.adminManager.init();
        }
    }

    // Debug helper method
    debugLog(message, ...args) {
        if (this.debugMode) {
            console.log(message, ...args);
        }
    }

    // Check if current user is admin
    async checkIfAdmin() {
        if (window.authDashboardManager && window.authDashboardManager.currentUser) {
            const userEmail = window.authDashboardManager.currentUser.email;
            
            // First check email (fast check)
            if (userEmail === 'capitalgainsx10@gmail.com') {
                return true;
            }
            
            // For other users, check database role (more secure)
            try {
                const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
                const userDoc = await getDoc(doc(window.Firebase.getFirestore(), 'users', window.authDashboardManager.currentUser.uid));
                
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    return userData.role === 'admin';
                }
            } catch (error) {
                console.error('❌ Error checking admin status:', error);
            }
        }
        return false;
    }

    // Refresh engine selection based on admin status
    async refreshEngineSelection() {
        console.log('🔄 Refreshing engine selection based on admin status...');
        await this.setupEngineSelection();
    }

    // Reset form state for new analysis
    resetFormState() {
        console.log('🔄 Resetting form state...');
        
        // Clear analysis results
        this.analysisResults = null;
        
        // Reset to phase 1
        this.currentPhase = 1;
        this.updateProgress();
        
        // Show questionnaire phase
        this.showPhase('discoveryPhase');
        
        // Reset form
        const form = document.getElementById('discoveryForm');
        if (form) {
            form.reset();
        }
        
        // Clear results display
        const resultsContainer = document.getElementById('resultsContainer');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
            resultsContainer.style.display = 'none';
        }
        
        // Hide strategy phase
        const strategyPhase = document.getElementById('strategyPhase');
        if (strategyPhase) {
            strategyPhase.style.display = 'none';
        }
        
        console.log('✅ Form state reset complete');
    }

    async init() {
        console.log('🚀 AcquisitionAdvisorApp init called');
        console.log('Current phase:', this.currentPhase);
        console.log('Analysis results:', this.analysisResults);
        
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupLinkedInUpload();
        this.setupModelSelection();
        this.updateProgress();
        await this.loadAvailableEngines();
        this.setupEngineSelection();
        
        console.log('✅ AcquisitionAdvisorApp init complete');
        console.log('Current phase after init:', this.currentPhase);
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
            console.log(`Validating ${competency} evidence:`, evidence ? `length=${evidence.value.length}` : 'NOT FOUND');
            if (evidence && evidence.value.length < 200) {
                isValid = false;
                this.setFieldValidation(evidence.closest('.competency'), false, 'Evidence must be at least 200 characters.');
            }
        });

        return isValid;
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        // Temporarily bypass validation for testing
        console.log('DEBUG: Bypassing form validation for testing');
        // if (!this.validateForm()) {
        //     alert('Please fill in all required fields correctly.');
        //     return;
        // }

        // Update engine selection before collecting form data
        this.updateEngineSelection();
        
        const formData = this.collectFormData();
        
        // Store form data for later use in display functions
        this.currentFormData = formData;
        
        // Debug: Log the form data being sent
        console.log('Form data being sent:', formData);
        console.log('Selected engines:', this.selectedEngines);
        console.log('Selected engine (single):', this.selectedEngine);
        console.log('Comparison mode:', this.comparisonMode);
        console.log('Available engines:', Object.keys(this.availableEngines));
        
        // Debug: Check if all required fields are present
        const requiredFields = ['interests_topics', 'recent_books', 'problem_to_solve', 'customer_affinity', 'total_liquid_capital', 'potential_loan_amount', 'min_annual_income', 'risk_tolerance'];
        requiredFields.forEach(field => {
            console.log(`${field}:`, formData[field] || 'MISSING');
        });
        
        // Debug: Check competencies structure
        console.log('Competencies structure:', formData.competencies || 'MISSING');
        if (formData.competencies) {
            Object.keys(formData.competencies).forEach(comp => {
                console.log(`${comp}:`, formData.competencies[comp]);
            });
        } else {
            console.error('ERROR: competencies object is missing from form data!');
        }
        
        // Debug: Check evidence field lengths
        const competencies = ['sales_marketing', 'operations_systems', 'finance_analytics', 'team_culture', 'product_technology'];
        competencies.forEach(competency => {
            const evidence = document.getElementById(`${competency}_evidence`);
            console.log(`${competency} evidence length:`, evidence ? evidence.value.length : 'NOT FOUND');
        });
        
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
                response = await fetch(`${this.apiBaseUrl}/api/analyze/compare`, {
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
                response = await fetch(`${this.apiBaseUrl}/api/analyze`, {
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

            // Check if response is valid JSON
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers.get('content-type'));
            
            if (!response.ok) {
                console.error('API response not OK:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('Error response body:', errorText);
                
                // If it's a 500 error, use fallback mode instead of throwing
                if (response.status === 500) {
                    console.warn('500 error detected, using fallback mode');
                    const formData = this.collectFormData();
                    const fallbackResult = this.generateFallbackAnalysis(formData);
                    this.analysisResults = fallbackResult.data;
                    this.showResults();
                    return;
                }
                
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            
            if (!response.headers.get('content-type')?.includes('application/json')) {
                console.warn('API not returning JSON, using fallback mode');
                result = this.generateFallbackAnalysis(formData);
            } else {
                result = await response.json();
            }
            
            // Debug: Log the server response
            console.log('Server response:', result);
            console.log('Engine used:', result.data?.engineUsed || result.data?.aiEngine || 'unknown');
            console.log('Analysis methodology:', result.data?.analysis_methodology || 'unknown');
            
            if (result.success) {
                console.log('Setting analysisResults to:', result.data);
                console.log('result.data keys:', Object.keys(result.data));
                this.analysisResults = result.data;
                console.log('this.analysisResults after setting:', this.analysisResults);
                
                // Save report to user's account if authenticated
                console.log('🔍 Checking authentication for report saving...');
                console.log('authDashboardManager available:', !!window.authDashboardManager);
                console.log('currentUser:', window.authDashboardManager?.currentUser);
                
                if (window.authDashboardManager && window.authDashboardManager.currentUser) {
                    const reportData = {
                        title: `Buybox Analysis - ${new Date().toLocaleDateString()}`,
                        formData: formData,
                        analysisResults: result.data,
                        aiModel: formData.ai_model || 'gemini-1.0-pro-002',
                        version: '1.0',
                        tags: ['buybox-analysis', formData.ai_model || 'gemini-1.0-pro-002'],
                        notes: ''
                    };
                    
                    console.log('💾 Attempting to save report:', reportData.title);
                    try {
                        const saveResult = await window.authDashboardManager.saveCurrentReport(reportData);
                        console.log('✅ Report save result:', saveResult);
                    } catch (error) {
                        console.error('❌ Failed to save report:', error);
                    }
                } else {
                    console.log('⚠️ User not authenticated, skipping report save');
                }
                
                setTimeout(() => {
                    this.showResults();
                }, 3000); // Show results after animation completes
            } else {
                console.error('Analysis failed:', result.error, result.details);
                throw new Error(result.error || 'Analysis failed');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            
            // If it's a network error (Failed to fetch), use fallback mode
            if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
                console.warn('Network error detected, using fallback mode');
                const formData = this.collectFormData();
                const fallbackResult = this.generateFallbackAnalysis(formData);
                this.analysisResults = fallbackResult.data;
                this.showResults();
                return;
            }
            
            alert(`Sorry, there was an error analyzing your profile: ${error.message}`);
            this.currentPhase = 1;
            this.updateProgress();
            this.showPhase('discoveryPhase');
        }
    }

    collectFormData() {
        const formData = {};
        
        // Competency ratings and evidence - create competencies object
        const competencyNames = ['sales_marketing', 'operations_systems', 'finance_analytics', 'team_culture', 'product_technology'];
        formData.competencies = {};
        
        competencyNames.forEach(competency => {
            const ratingElement = document.getElementById(`${competency}_rating`);
            const evidenceElement = document.getElementById(`${competency}_evidence`);
            
            console.log(`Collecting ${competency}:`, {
                ratingElement: ratingElement,
                evidenceElement: evidenceElement,
                ratingValue: ratingElement ? ratingElement.value : 'NOT FOUND',
                evidenceValue: evidenceElement ? evidenceElement.value : 'NOT FOUND'
            });
            
            formData.competencies[competency] = {
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
        
        // Get selected AI model - check both old and new selectors
        let selectedModel = document.querySelector('input[name="ai_model"]:checked');
        if (!selectedModel) {
            // Try the new engine selection format
            selectedModel = document.querySelector('input[name="engineSelect"]:checked');
        }
        
        // For non-admin users, default to Gemini
        if (!selectedModel && !this.checkIfAdmin()) {
            formData.ai_model = 'gemini-1.0-pro-002';
        } else {
            formData.ai_model = selectedModel ? selectedModel.value : 'gemini-1.0-pro-002';
        }

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
        this.debugLog('🔍 DEBUG: analysis_methodology =', this.analysisResults.analysis_methodology);
        this.debugLog('🔍 DEBUG: analysisResults keys =', Object.keys(this.analysisResults));
        
        if (this.analysisResults.analysis_methodology === 'multi_framework') {
            this.debugLog('🎯 DEBUG: Calling populateMultiFrameworkResults');
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
        this.debugLog('DEBUG: Raw response length:', rawResponse.length);
        this.debugLog('DEBUG: Raw response first 1000 chars:', rawResponse.substring(0, 1000));
        
        // Parse the multi-framework response
        const frameworks = this.parseMultiFrameworkResponse(rawResponse);
        this.debugLog('Parsed frameworks:', frameworks);
        
        // Display the results
        this.displayMultiFrameworkResults(frameworks);
    }

    /**
     * Main function to display the multi-framework analysis results in the DOM.
     * This definitive version fixes rendering bugs by creating a clean, single
     * introductory section and correctly titling all subsequent parts of the report.
     */
    displayMultiFrameworkResults(frameworks) {
        console.log(`🚀 DISPLAY FUNCTION CALLED - v${this.scriptVersion}!`);
        const reportContainer = document.getElementById('buyboxSection');
        if (!reportContainer) {
            console.error('Report container not found');
            return;
        }
        
        console.log('DEBUG: Report container found:', reportContainer);
        console.log('DEBUG: Report container display:', reportContainer.style.display);
        console.log('DEBUG: Report container visibility:', reportContainer.style.visibility);
        console.log('DEBUG: Report container height:', reportContainer.style.height);
        
        reportContainer.innerHTML = ''; // Clear previous results

        // Parse the new Part 1: Executive Summary & Strategic Insights from the raw response
        const rawResponse = this.analysisResults.rawResponse || '';
        let overviewHTML = '';
        
        console.log('DEBUG: Raw response length:', rawResponse.length);
        console.log('DEBUG: Raw response first 500 chars:', rawResponse.substring(0, 500));
        console.log('DEBUG: Looking for Part 1 header...');
        
        // Generate personalized archetype names based on user's competency ratings
        const personalizedArchetypes = generatePersonalizedArchetypeNames(this.currentFormData);
        
        if (rawResponse.includes('**Part 1: Executive Summary & Strategic Insights**')) {
            console.log('DEBUG: Found Part 1 header');
            // Extract the new Part 1 content
            const part1Match = rawResponse.match(/\*\*Part 1: Executive Summary & Strategic Insights\*\*([\s\S]*?)(?=\*\*Part 2:|$)/);
            if (part1Match) {
                const part1Content = part1Match[1].trim();
                console.log('DEBUG: Part 1 content extracted:', part1Content.substring(0, 500));
                
                // Parse the archetype sections - look for the actual text in the response
                const efficiencyExpertMatch = part1Content.match(/\*\*The Efficiency Expert \(The Value Unlocker\):\*\*([\s\S]*?)(?=\*\*The Growth Catalyst|$)/);
                const growthCatalystMatch = part1Content.match(/\*\*The Growth Catalyst \(The Scaler\):\*\*([\s\S]*?)(?=\*\*How to Use This Report|$)/);
                const howToUseMatch = part1Content.match(/\*\*How to Use This Report[^*]*\*\*([\s\S]*?)(?=\*\*Part 2:|$)/);
                
                console.log('DEBUG: Efficiency Expert match:', efficiencyExpertMatch ? 'Found' : 'Not found');
                console.log('DEBUG: Growth Catalyst match:', growthCatalystMatch ? 'Found' : 'Not found');
                console.log('DEBUG: How to Use match:', howToUseMatch ? 'Found' : 'Not found');
                
                // If we can't find the specific patterns, use the raw Part 1 content directly
                if (!efficiencyExpertMatch && !growthCatalystMatch) {
                    console.log('DEBUG: Using raw Part 1 content for overview');
                    overviewHTML = `
                        <div class="overview-section">
                            <h2>Multi-Framework Overview</h2>
                            <div class="overview-content">
                                ${part1Content.replace(/\*\*/g, '').replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}
                            </div>
                        </div>
                    `;
                } else {
                
                let efficiencyExpertText = efficiencyExpertMatch ? efficiencyExpertMatch[1].trim() : 'The Efficiency Expert focuses on finding established businesses with strong revenue but inefficient operations and making them better.';
                let growthCatalystText = growthCatalystMatch ? growthCatalystMatch[1].trim() : 'The Growth Catalyst focuses on finding businesses with great products but underdeveloped market reach and igniting their growth.';
                
                // Replace old archetype names in descriptions with personalized names
                efficiencyExpertText = efficiencyExpertText
                    .replace(/The Efficiency Expert/g, personalizedArchetypes.archetype1)
                    .replace(/Efficiency Expert/g, personalizedArchetypes.archetype1);
                    
                growthCatalystText = growthCatalystText
                    .replace(/The Growth Catalyst/g, personalizedArchetypes.archetype2)
                    .replace(/Growth Catalyst/g, personalizedArchetypes.archetype2);
                    
                let howToUseText = howToUseMatch ? howToUseMatch[1].trim() : 'This dual-archetype profile does not force you to choose one path over the other; instead, it provides a powerful lens for evaluating opportunities.';
                
                // Replace old archetype names in the "How to Use" section as well
                howToUseText = howToUseText
                    .replace(/The Efficiency Expert/g, personalizedArchetypes.archetype1)
                    .replace(/Efficiency Expert/g, personalizedArchetypes.archetype1)
                    .replace(/The Growth Catalyst/g, personalizedArchetypes.archetype2)
                    .replace(/Growth Catalyst/g, personalizedArchetypes.archetype2);
                
                console.log('DEBUG: Efficiency Expert text:', efficiencyExpertText.substring(0, 100));
                console.log('DEBUG: Growth Catalyst text:', growthCatalystText.substring(0, 100));
                console.log('DEBUG: How to Use text:', howToUseText.substring(0, 100));
                
                overviewHTML = `
                    <div id="analysis-summary" class="pdf-render-section" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                        <h2 style="color: white; margin-top: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Multi-Framework Overview</h2>
                        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">This comprehensive analysis evaluates your entrepreneurial profile through four distinct strategic lenses, providing a 360-degree view of your acquisition potential. Each framework offers unique insights into your strengths, target opportunities, and strategic positioning.</p>
                        
                        <h3 style="color: #ffd700; font-size: 20px; margin-top: 25px; margin-bottom: 15px;">Understanding Your Archetypes</h3>
                        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #4ade80;">
                            <p style="margin: 0 0 10px 0;"><strong style="color: #4ade80;">${personalizedArchetypes.archetype1}</strong>: ${efficiencyExpertText}</p>
                        </div>
                        
                        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #ffd700;">
                            <p style="margin: 0 0 10px 0;"><strong style="color: #ffd700;">${personalizedArchetypes.archetype2}</strong>: ${growthCatalystText}</p>
                        </div>
                        
                        <h3 style="color: #ffd700; font-size: 20px; margin-top: 25px; margin-bottom: 15px;">How to Use This Report to Create Your Unified Buybox</h3>
                        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #60a5fa;">
                            <div style="font-size: 16px; line-height: 1.6;">${formatHowToUseText(howToUseText)}</div>
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
                    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #ffd700;">
                        <p style="margin: 0 0 5px 0;"><strong style="color: #ffd700;">${personalizedArchetypes.archetype2}</strong> <span style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 12px; font-size: 12px;">$50k-$250k SDE targets</span>: Your high sales & marketing ratings and entrepreneurial orientation make you ideal for scaling businesses with untapped market potential. You excel at identifying growth opportunities and driving revenue expansion.</p>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #4ade80;">
                        <p style="margin: 0 0 5px 0;"><strong style="color: #4ade80;">${personalizedArchetypes.archetype1}</strong> <span style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 12px; font-size: 12px;">$250k-$1M SDE targets</span>: Your operational excellence and financial acumen position you to acquire established businesses with operational inefficiencies. You can unlock hidden value through process improvement and margin optimization.</p>
                    </div>
                    
                    <h3 style="color: #ffd700; font-size: 20px; margin-top: 25px; margin-bottom: 15px;">Financial</h3>
                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 0;">The SDE ranges reflect different risk-return profiles: lower targets offer higher growth potential but require more active management, while higher targets provide more predictable returns with operational leverage opportunities. <strong style="color: #ffd700;">Strategic Implications:</strong> This duality does not represent a contradiction, but a significant strategic advantage. It means you are equally equipped to either scale a business with untapped market potential (Growth Catalyst) or to acquire a business with solid revenue but inefficient operations and unlock hidden value (Efficiency Expert). The following detailed reports will explore both of these compelling strategic paths.</p>
                </div>
            `;
            }
        }

        // Overview will be inserted after fallback generation below
        
        // Fallback: if no overview HTML was generated, use raw response content
        if (!overviewHTML) {
            console.log('DEBUG: No Part 1 header found, using raw response content for overview');
            // Use the raw response content as overview if Part 1 header is not found
            const firstPart = rawResponse.split('## Part 3: Detailed Framework Reports')[0] || rawResponse.split('## Traditional M&A Expert Analysis')[0] || rawResponse.substring(0, 2000);
            if (firstPart.trim()) {
                // Convert markdown to HTML with proper styling
                const formattedContent = firstPart
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
                    .replace(/\n\n/g, '</p><p>') // Paragraph breaks
                    .replace(/\n/g, '<br>') // Line breaks
                    .replace(/\|(.*?)\|/g, (match, content) => {
                        // Convert markdown tables to HTML tables
                        const rows = content.split('\n').filter(row => row.trim());
                        if (rows.length > 1) {
                            const headerRow = rows[0].split('|').map(cell => cell.trim()).filter(cell => cell);
                            const dataRows = rows.slice(1).map(row => 
                                row.split('|').map(cell => cell.trim()).filter(cell => cell)
                            );
                            
                            let tableHTML = '<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">';
                            tableHTML += '<thead><tr>';
                            headerRow.forEach(header => {
                                tableHTML += `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">${header}</th>`;
                            });
                            tableHTML += '</tr></thead><tbody>';
                            dataRows.forEach(row => {
                                tableHTML += '<tr>';
                                row.forEach(cell => {
                                    tableHTML += `<td style="border: 1px solid #ddd; padding: 8px;">${cell}</td>`;
                                });
                                tableHTML += '</tr>';
                            });
                            tableHTML += '</tbody></table>';
                            return tableHTML;
                        }
                        return match; // Return original if not a proper table
                    });
                
                overviewHTML = `
                    <div id="analysis-summary" class="pdf-render-section" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                        <h2 style="color: white; margin-top: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Multi-Framework Overview</h2>
                        <div style="font-size: 16px; line-height: 1.6;">
                            <p>${formattedContent}</p>
                        </div>
                    </div>
                `;
                console.log('DEBUG: Generated styled overview from raw response content');
            } else {
                console.log('DEBUG: No overview HTML to insert');
            }
        }
        
        // Insert the overview at the top (after fallback generation)
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
        console.log('DEBUG: Report container before framework creation:', reportContainer.innerHTML.length, 'characters');
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
        // reportContainer.style.backgroundColor = '#ff0000'; // Bright red background for testing - REMOVED
        reportContainer.style.minHeight = '500px'; // Ensure minimum height
        
        // Create a completely new container to avoid any CSS conflicts
        const newReportContainer = document.createElement('div');
        newReportContainer.id = 'newReportContainer';
        newReportContainer.innerHTML = reportContainer.innerHTML;
        
        // Apply styles to the new container
        newReportContainer.style.position = 'fixed';
        newReportContainer.style.top = '0px';
        newReportContainer.style.left = '0px';
        newReportContainer.style.right = '0px';
        newReportContainer.style.bottom = '0px';
        newReportContainer.style.zIndex = '1000';
        newReportContainer.style.backgroundColor = 'white';
        newReportContainer.style.padding = '20px';
        newReportContainer.style.margin = '0';
        newReportContainer.style.overflowY = 'auto';
        newReportContainer.style.overflowX = 'hidden';
        newReportContainer.style.height = '100vh';
        newReportContainer.style.width = '100vw';
        newReportContainer.style.maxWidth = '100vw';
        newReportContainer.style.boxSizing = 'border-box';
        
        // Hide the original container
        reportContainer.style.display = 'none';
        
        // Add CSS to prevent horizontal overflow
        const style = document.createElement('style');
        style.textContent = `
            #newReportContainer * {
                max-width: 100% !important;
                word-wrap: break-word !important;
                overflow-wrap: break-word !important;
            }
            #newReportContainer table {
                width: 100% !important;
                table-layout: fixed !important;
            }
            #newReportContainer pre, #newReportContainer code {
                white-space: pre-wrap !important;
                word-wrap: break-word !important;
            }
        `;
        document.head.appendChild(style);
        
        // Add the new container to the body
        document.body.appendChild(newReportContainer);
        
        // Update the reference to use the new container
        const actualReportContainer = newReportContainer;
        
        // Hide all other content to focus on the report
        const discoveryPhase = document.getElementById('discoveryPhase');
        const analysisPhase = document.getElementById('analysisPhase');
        if (discoveryPhase) discoveryPhase.style.display = 'none';
        if (analysisPhase) analysisPhase.style.display = 'none';
        
        // Add a back button and download button to the report
        const buttonContainer = document.createElement('div');
        buttonContainer.style.position = 'sticky';
        buttonContainer.style.top = '0px';
        buttonContainer.style.zIndex = '1001';
        buttonContainer.style.backgroundColor = 'white';
        buttonContainer.style.padding = '10px 0';
        buttonContainer.style.marginBottom = '20px';
        buttonContainer.style.borderBottom = '1px solid #ddd';
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.alignItems = 'center';
        
        const backButton = document.createElement('button');
        backButton.textContent = '← Back to Analysis';
        backButton.className = 'btn btn-secondary';
        backButton.style.padding = '10px 20px';
        backButton.style.border = '1px solid #ddd';
        backButton.style.borderRadius = '5px';
        backButton.onclick = () => {
            // Show the questionnaire again
            if (discoveryPhase) discoveryPhase.style.display = 'block';
            if (analysisPhase) analysisPhase.style.display = 'block';
            // Remove the new container and show the original
            if (newReportContainer && newReportContainer.parentNode) {
                newReportContainer.parentNode.removeChild(newReportContainer);
            }
            reportContainer.style.display = 'block';
            // Show the questionnaire
            this.showPhase('discoveryPhase');
        };
        
        const downloadButton = document.createElement('button');
        downloadButton.textContent = '📄 Download PDF';
        downloadButton.className = 'btn btn-primary';
        downloadButton.id = 'downloadBtn';
        downloadButton.style.padding = '10px 20px';
        downloadButton.style.border = '1px solid #007bff';
        downloadButton.style.borderRadius = '5px';
        downloadButton.style.backgroundColor = '#007bff';
        downloadButton.style.color = 'white';
        downloadButton.onclick = () => {
            console.log('DEBUG: PDF download button clicked');
            // Call the downloadPDF method directly
            if (typeof this.downloadPDF === 'function') {
                this.downloadPDF();
            } else {
                console.error('DEBUG: downloadPDF method not found');
                // Fallback: try to find and click the original download button
                const originalDownloadBtn = document.getElementById('downloadBtn');
                if (originalDownloadBtn) {
                    originalDownloadBtn.click();
                } else {
                    console.error('DEBUG: Original download button not found');
                }
            }
        };
        
        buttonContainer.appendChild(backButton);
        buttonContainer.appendChild(downloadButton);
        actualReportContainer.insertBefore(buttonContainer, actualReportContainer.firstChild);
        
        // Auto-scroll to the content after a short delay to ensure it's rendered
        setTimeout(() => {
            // Scroll to the top of the page first, then to the report
            window.scrollTo({ top: 0, behavior: 'instant' });
            setTimeout(() => {
                actualReportContainer.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
                console.log('DEBUG: Scrolled to new report container');
            }, 100);
        }, 50);
        console.log('DEBUG: Final report container state:');
        console.log('DEBUG: - Display:', reportContainer.style.display);
        console.log('DEBUG: - Visibility:', reportContainer.style.visibility);
        console.log('DEBUG: - Height:', reportContainer.style.height);
        console.log('DEBUG: - Content length:', reportContainer.innerHTML.length, 'characters');
        console.log('DEBUG: - Children count:', reportContainer.children.length);
        
        // Check computed styles
        const computedStyle = window.getComputedStyle(reportContainer);
        console.log('DEBUG: Computed styles:');
        console.log('DEBUG: - Display:', computedStyle.display);
        console.log('DEBUG: - Visibility:', computedStyle.visibility);
        console.log('DEBUG: - Height:', computedStyle.height);
        console.log('DEBUG: - Width:', computedStyle.width);
        console.log('DEBUG: - Position:', computedStyle.position);
        console.log('DEBUG: - Top:', computedStyle.top);
        console.log('DEBUG: - Left:', computedStyle.left);
        
        // Check if container is in viewport
        const rect = reportContainer.getBoundingClientRect();
        console.log('DEBUG: Container position:');
        console.log('DEBUG: - Top:', rect.top);
        console.log('DEBUG: - Left:', rect.left);
        console.log('DEBUG: - Width:', rect.width);
        console.log('DEBUG: - Height:', rect.height);
        console.log('DEBUG: - Visible:', rect.width > 0 && rect.height > 0);
        
        // Check first child
        if (reportContainer.children.length > 0) {
            const firstChild = reportContainer.children[0];
            const childRect = firstChild.getBoundingClientRect();
            console.log('DEBUG: First child position:');
            console.log('DEBUG: - Top:', childRect.top);
            console.log('DEBUG: - Left:', childRect.left);
            console.log('DEBUG: - Width:', childRect.width);
            console.log('DEBUG: - Height:', childRect.height);
            console.log('DEBUG: - Visible:', childRect.width > 0 && childRect.height > 0);
        }
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
        const hasPart3Format = rawResponse.includes('## Part 3: Detailed Framework Reports');
        
        console.log('DEBUG: Has new format (### ---):', hasNewFormat);
        console.log('DEBUG: Has old format (##):', hasOldFormat);
        console.log('DEBUG: Has Part 2 format:', hasPart2Format);
        console.log('DEBUG: Has Part 3 format:', hasPart3Format);
        
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
            frameworkMatches = reportsBlock.split(/(### --- (?:Traditional M&A Expert Analysis|The Hedgehog Concept Analysis|SWOT Analysis|Entrepreneurial Orientation Analysis|Digital Transformation Analysis|Value Creation Analysis) ---)/);
        } else if (hasPart3Format) {
            // Part 3 format: ## Part 3: Detailed Framework Reports with ## Framework Name
            const sections = rawResponse.split(/## Part 3: Detailed Framework Reports/);
            if (sections.length < 2) {
                console.error("DEBUG: '## Part 3: Detailed Framework Reports' header not found. Parsing failed.");
                return frameworks;
            }
            reportsBlock = sections[1];
            frameworkMatches = reportsBlock.split(/(## (?:Traditional M&A Expert Analysis|The Hedgehog Concept Analysis|SWOT Analysis|Entrepreneurial Orientation \(EO\) Analysis|Digital Transformation Analysis|Value Creation Analysis))/);
        } else if (hasPart2Format) {
            // New Part 2 format: **Part 2: Detailed Framework Reports**
            const sections = rawResponse.split(/\*\*Part 2: Detailed Framework Reports\*\*/);
            if (sections.length < 2) {
                console.error("DEBUG: 'Part 2: Detailed Framework Reports' header not found. Parsing failed.");
                return frameworks;
            }
            reportsBlock = sections[1];
            frameworkMatches = reportsBlock.split(/(## (?:Traditional M&A Expert Analysis|The Hedgehog Concept Analysis|SWOT Analysis|Entrepreneurial Orientation \(EO\) Analysis|Digital Transformation Analysis|Value Creation Analysis))/);
        } else if (hasOldFormat) {
            // Old format: ## Framework Name
            const sections = rawResponse.split(/## Traditional M&A Expert Analysis/);
            if (sections.length < 2) {
                console.error("DEBUG: '## Traditional M&A Expert Analysis' header not found. Parsing failed.");
                return frameworks;
            }
            reportsBlock = '## Traditional M&A Expert Analysis' + sections[1];
            frameworkMatches = reportsBlock.split(/(## (?:Traditional M&A Expert Analysis|The Hedgehog Concept Analysis|SWOT Analysis|Entrepreneurial Orientation \(EO\) Analysis|Digital Transformation Analysis|Value Creation Analysis))/);
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
        console.log('🔄 showPhase called with:', phaseId);
        console.log('Current phase:', this.currentPhase);
        
        const phases = document.querySelectorAll('.phase-content');
        console.log('Found phase elements:', phases.length);
        phases.forEach((phase, index) => {
            console.log(`Phase ${index}:`, phase.id, phase.className);
            phase.classList.remove('active');
        });
        
        const targetPhase = document.getElementById(phaseId);
        console.log('Target phase element:', targetPhase);
        if (targetPhase) {
            targetPhase.classList.add('active');
            // Force visibility with explicit styles
            targetPhase.style.display = 'block';
            targetPhase.style.visibility = 'visible';
            targetPhase.style.height = 'auto';
            targetPhase.style.width = '100%';
            console.log('✅ Phase shown:', phaseId);
            console.log('Phase classes after activation:', targetPhase.className);
            
            // Debug the phase visibility
            const computedStyle = window.getComputedStyle(targetPhase);
            console.log('DEBUG: Phase visibility after activation:');
            console.log('DEBUG: - Display:', computedStyle.display);
            console.log('DEBUG: - Visibility:', computedStyle.visibility);
            console.log('DEBUG: - Height:', computedStyle.height);
            console.log('DEBUG: - Width:', computedStyle.width);
            
            const rect = targetPhase.getBoundingClientRect();
            console.log('DEBUG: Phase position after activation:');
            console.log('DEBUG: - Top:', rect.top);
            console.log('DEBUG: - Left:', rect.left);
            console.log('DEBUG: - Width:', rect.width);
            console.log('DEBUG: - Height:', rect.height);
            console.log('DEBUG: - Visible:', rect.width > 0 && rect.height > 0);
        } else {
            console.log('❌ Phase not found:', phaseId);
            console.log('Available phase IDs:', Array.from(phases).map(p => p.id));
        }
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
        console.log('🔄 toggleTransparency called');
        const content = document.getElementById('transparencyContent');
        const button = document.getElementById('toggleTransparency');
        
        console.log('DEBUG: Content element:', content);
        console.log('DEBUG: Button element:', button);
        
        if (content && button) {
            if (content.style.display === 'none' || content.style.display === '') {
                content.style.display = 'block';
                button.textContent = 'Hide Detailed AI Analysis';
                console.log('✅ Showing transparency content');
            } else {
                content.style.display = 'none';
                button.textContent = 'Show Detailed AI Analysis';
                console.log('✅ Hiding transparency content');
            }
        } else {
            console.error('❌ Could not find transparency elements');
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
            html += '<span><strong>Model:</strong> gemini-1.0-pro-002</span>';
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
            console.log('🔍 Loading engines from:', `${this.apiBaseUrl}/api/engines`);
            const response = await fetch(`${this.apiBaseUrl}/api/engines`);
            const result = await response.json();
            
            console.log('🔍 API Response:', result);
            
            if (result.success) {
                this.availableEngines = result.engines;
                this.selectedEngine = result.defaultEngine;
                console.log('✅ Engines loaded successfully. Default engine:', this.selectedEngine);
                console.log('✅ Available engines:', Object.keys(this.availableEngines));
                
                // Also load available models for Gemini
                if (this.selectedEngine === 'gemini') {
                    await this.loadAvailableModels();
                }
            }
        } catch (error) {
            console.error('❌ Failed to load engines:', error);
            // Fallback to traditional engine
            this.availableEngines = {
                traditional: { name: 'Traditional AI', enabled: true, available: true }
            };
            console.log('⚠️ Using fallback traditional engine');
        }
    }

    async loadAvailableModels() {
        try {
            console.log('🔍 Loading available Gemini models...');
            const response = await fetch(`${this.apiBaseUrl}/api/models/available`);
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Available models:', result);
                if (result.success && result.models) {
                    this.availableModels = result.models;
                    this.updateModelSelectionUI();
                }
                return result;
            } else {
                console.error('❌ Failed to load models:', response.status);
                return { success: false, models: [] };
            }
        } catch (error) {
            console.error('❌ Error loading models:', error);
            return { success: false, models: [] };
        }
    }

    async setupEngineSelection() {
        const engineGrid = document.getElementById('engineGrid');
        if (!engineGrid) return;

        // Check if user is admin
        const isAdmin = await this.checkIfAdmin();
        
        // Find the AI Model Selection section
        const aiModelSection = engineGrid.closest('.form-section');
        if (aiModelSection) {
            if (isAdmin) {
                console.log('🔐 Admin user detected - showing AI Model Selection');
                aiModelSection.style.display = 'block';
            } else {
                console.log('👤 Regular user - hiding AI Model Selection');
                aiModelSection.style.display = 'none';
            }
        }

        // Only populate engine grid if user is admin
        if (!isAdmin) {
            // For non-admin users, just set default engine and return
            this.selectedEngine = 'gemini'; // Default to Gemini for regular users
            console.log('👤 Non-admin user - using default engine:', this.selectedEngine);
            return;
        }

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
                    html += `<p><strong>Model:</strong> gemini-1.0-pro-002</p>`;
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
                html += '<p><strong>Model Used:</strong> gemini-1.0-pro-002</p>';
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
        console.log('🔧 Setting up Save/Load buttons...');
        
        // Save button
        const saveBtn = document.getElementById('saveFormBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                console.log('💾 Save button clicked');
                this.saveFormData();
            });
            console.log('✅ Save button event listener attached');
        } else {
            console.error('❌ Save button not found');
        }

        // Load button
        const loadBtn = document.getElementById('loadFormBtn');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => {
                console.log('📁 Load button clicked');
                const fileInput = document.getElementById('fileInput');
                if (fileInput) {
                    fileInput.click();
                } else {
                    console.error('❌ File input not found');
                }
            });
            console.log('✅ Load button event listener attached');
        } else {
            console.error('❌ Load button not found');
        }

        // File input handler
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                console.log('📄 File selected:', e.target.files[0]?.name);
                this.loadFormData(e.target.files[0]);
            });
            console.log('✅ File input event listener attached');
        } else {
            console.error('❌ File input not found');
        }
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

    /**
     * Uses pdf.js to extract all text from a PDF file.
     */
    async extractTextFromPdf(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n\n';
        }
        return fullText;
    }

    /**
     * Sends the extracted PDF text to the Gemini API for analysis.
     */
    async callGeminiForExtraction(rawPdfText) {
        try {
            const response = await fetch('/api/extract-linkedin-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pdfText: rawPdfText })
            });

            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }

            const result = await response.json();
            return result.extractedData;
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            throw error;
        }
    }

    /**
     * Populates the questionnaire form fields with the extracted data.
     */
    populateFormFromLinkedIn(data) {
        if (!data) return;

        // Populate evidence fields
        if (data.sales_marketing_evidence) {
            document.getElementById('sales_marketing_evidence').value = data.sales_marketing_evidence;
        }
        if (data.operations_systems_evidence) {
            document.getElementById('operations_systems_evidence').value = data.operations_systems_evidence;
        }
        if (data.finance_analytics_evidence) {
            document.getElementById('finance_analytics_evidence').value = data.finance_analytics_evidence;
        }
        if (data.team_culture_evidence) {
            document.getElementById('team_culture_evidence').value = data.team_culture_evidence;
        }
        if (data.product_technology_evidence) {
            document.getElementById('product_technology_evidence').value = data.product_technology_evidence;
        }
        if (data.interests_topics) {
            document.getElementById('interests_topics').value = data.interests_topics;
        }

        // Show success message
        this.showNotification('Profile data imported successfully! Please review and adjust the ratings as needed.', 'success');
    }

    /**
     * Sets up the LinkedIn PDF upload functionality
     */
    setupLinkedInUpload() {
        const dropZone = document.getElementById('linkedin-drop-zone');
        const fileInput = document.getElementById('linkedin-pdf-upload');
        const loadingDiv = document.getElementById('linkedin-loading');
        const statusDiv = document.getElementById('linkedin-status');

        if (!dropZone || !fileInput) return;

        // Drag and drop event listeners
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#3b82f6';
            dropZone.style.backgroundColor = '#eff6ff';
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#94a3b8';
            dropZone.style.backgroundColor = 'transparent';
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#94a3b8';
            dropZone.style.backgroundColor = 'transparent';
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type === 'application/pdf') {
                this.handleLinkedInUpload(files[0]);
            }
        });

        // File input change listener
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleLinkedInUpload(e.target.files[0]);
            }
        });
    }

    /**
     * Handles the LinkedIn PDF upload process
     */
    async handleLinkedInUpload(file) {
        const loadingDiv = document.getElementById('linkedin-loading');
        const statusDiv = document.getElementById('linkedin-status');

        try {
            // Show loading state
            loadingDiv.style.display = 'block';
            statusDiv.textContent = 'Reading your PDF...';

            // Extract text from PDF
            const rawText = await this.extractTextFromPdf(file);
            statusDiv.textContent = 'Analyzing your profile with AI...';
            
            // Call Gemini API for extraction
            const extractedData = await this.callGeminiForExtraction(rawText);
            
            // Populate the form
            this.populateFormFromLinkedIn(extractedData);
            
            statusDiv.textContent = 'Profile imported successfully!';
            statusDiv.style.color = '#10b981';

        } catch (error) {
            console.error('Error processing LinkedIn PDF:', error);
            statusDiv.textContent = 'Error processing PDF. Please try again.';
            statusDiv.style.color = '#ef4444';
        } finally {
            loadingDiv.style.display = 'none';
        }
    }

    setupModelSelection() {
        const modelRadios = document.querySelectorAll('input[name="ai_model"]');
        const flashLabel = document.getElementById('flash-label');
        const proLabel = document.getElementById('pro-label');

        // Add event listeners for model selection
        modelRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                // Remove selected class from all labels
                flashLabel.classList.remove('selected');
                proLabel.classList.remove('selected');
                
                // Add selected class to the checked label
                if (e.target.checked) {
                    e.target.closest('label').classList.add('selected');
                }
            });
        });

        // Set initial selected state
        const checkedRadio = document.querySelector('input[name="ai_model"]:checked');
        if (checkedRadio) {
            checkedRadio.closest('label').classList.add('selected');
        }
    }

    updateModelSelectionUI() {
        if (!this.availableModels || this.availableModels.length === 0) {
            console.log('⚠️ No models available for UI update');
            return;
        }

        console.log('🔄 Updating model selection UI with available models:', this.availableModels);

        // Find the model selection container
        const modelSelection = document.querySelector('.model-selection');
        if (!modelSelection) {
            console.log('⚠️ Model selection container not found');
            return;
        }

        // Clear existing model options
        const existingRadios = modelSelection.querySelectorAll('input[name="ai_model"]');
        existingRadios.forEach(radio => radio.remove());

        // Create new model options based on available models
        this.availableModels.forEach((model, index) => {
            if (model.available) {
                const label = document.createElement('label');
                label.style.cssText = 'display: flex; align-items: center; cursor: pointer; padding: 10px; border-radius: 6px; border: 2px solid #e2e8f0; transition: all 0.3s ease; flex: 1;';
                label.id = `${model.name.replace(/[^a-zA-Z0-9]/g, '-')}-label`;

                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'ai_model';
                radio.value = model.name;
                radio.style.marginRight = '10px';
                if (index === 0) radio.checked = true; // Select first available model

                const content = document.createElement('div');
                const nameDiv = document.createElement('div');
                nameDiv.style.cssText = 'font-weight: 600; color: #1e293b;';
                nameDiv.textContent = model.displayName;

                const descDiv = document.createElement('div');
                descDiv.style.cssText = 'font-size: 12px; color: #64748b;';
                descDiv.textContent = model.description;

                content.appendChild(nameDiv);
                content.appendChild(descDiv);
                label.appendChild(radio);
                label.appendChild(content);

                modelSelection.appendChild(label);
            }
        });

        // Re-setup event listeners
        this.setupModelSelection();
    }

    getScriptVersion() {
        // Extract version from script tag src attribute
        const scripts = document.querySelectorAll('script[src*="script.js"]');
        for (let script of scripts) {
            const match = script.src.match(/script\.js\?v=(\d+)/);
            if (match) {
                return match[1];
            }
        }
        return 'unknown';
    }

        getApiBaseUrl() {
            // For localhost, use local server
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                return 'http://localhost:3000';
            }
            // For production, use Railway backend
            return 'https://buybox-generator-production.up.railway.app'; // Railway deployment URL
        }

    generateFallbackAnalysis(userData) {
        // Generate a realistic fallback analysis based on user data
        // Convert form data structure to competencies object
        const competencies = {};
        if (userData.sales_marketing) competencies.sales_marketing = userData.sales_marketing.rating;
        if (userData.operations_systems) competencies.operations_systems = userData.operations_systems.rating;
        if (userData.finance_analytics) competencies.finance_analytics = userData.finance_analytics.rating;
        if (userData.team_culture) competencies.team_culture = userData.team_culture.rating;
        if (userData.product_technology) competencies.product_technology = userData.product_technology.rating;
        
        // Generate personalized archetype names
        const personalizedArchetypes = this.generatePersonalizedArchetypeNames(competencies);
        
        // Create a comprehensive fallback response
        const fallbackResponse = {
            success: true,
            data: {
                analysis_methodology: 'multi_framework',
                rawResponse: this.generateFallbackRawResponse(userData, personalizedArchetypes, competencies),
                archetype1: {
                    name: personalizedArchetypes.archetype1,
                    description: `A strategic operator who excels at ${this.getTopCompetency(competencies)} and drives value creation.`
                },
                archetype2: {
                    name: personalizedArchetypes.archetype2,
                    description: `A complementary operator who leverages ${this.getSecondCompetency(competencies)} for strategic advantage.`
                },
                frameworks: this.generateFallbackFrameworks(userData),
                comparison: this.generateFallbackComparison()
            }
        };
        
        return fallbackResponse;
    }

    generatePersonalizedArchetypeNames(competencies) {
        if (!competencies || typeof competencies !== 'object') {
            return { 
                archetype1: 'The Strategic Operator', 
                archetype2: 'The Foundation Builder' 
            };
        }
        
        const scores = Object.values(competencies);
        if (scores.length === 0) {
            return { 
                archetype1: 'The Strategic Operator', 
                archetype2: 'The Foundation Builder' 
            };
        }
        
        const maxScore = Math.max(...scores);
        const secondMaxScore = Math.max(...scores.filter(score => score < maxScore));
        
        const archetype1 = this.getArchetypeName(maxScore, 1);
        const archetype2 = this.getArchetypeName(secondMaxScore, 2);
        
        return { archetype1, archetype2 };
    }

    getArchetypeName(score, position) {
        const names = {
            5: position === 1 ? 'The Strategic Visionary' : 'The Operational Excellence Leader',
            4: position === 1 ? 'The Growth Catalyst' : 'The Process Optimizer',
            3: position === 1 ? 'The Revenue Accelerator' : 'The Market Expander',
            2: position === 1 ? 'The Efficiency Expert' : 'The Value Creator',
            1: position === 1 ? 'The Foundation Builder' : 'The Capability Developer'
        };
        return names[score] || 'The Strategic Operator';
    }

    getTopCompetency(competencies) {
        if (!competencies || typeof competencies !== 'object') {
            return 'strategic operations';
        }
        
        const competencyNames = {
            sales_marketing: 'sales and marketing',
            operations_systems: 'operations and systems',
            finance_analytics: 'finance and analytics',
            team_culture: 'team building and culture',
            product_technology: 'product development and technology'
        };
        const keys = Object.keys(competencies);
        if (keys.length === 0) {
            return 'strategic operations';
        }
        const maxKey = keys.reduce((a, b) => competencies[a] > competencies[b] ? a : b);
        return competencyNames[maxKey] || 'strategic operations';
    }

    getSecondCompetency(competencies) {
        if (!competencies || typeof competencies !== 'object') {
            return 'strategic operations';
        }
        
        const scores = Object.entries(competencies).sort((a, b) => b[1] - a[1]);
        const competencyNames = {
            sales_marketing: 'sales and marketing',
            operations_systems: 'operations and systems',
            finance_analytics: 'finance and analytics',
            team_culture: 'team building and culture',
            product_technology: 'product development and technology'
        };
        return scores.length > 1 ? competencyNames[scores[1][0]] || 'strategic operations' : 'strategic operations';
    }

    generateFallbackRawResponse(userData, personalizedArchetypes, competencies) {
        const motivators = userData.motivators || ['freedom', 'earning potential'];
        const riskTolerance = userData.riskTolerance || 'medium';
        const timeHorizon = userData.timeHorizon || '1-3 years';
        const investmentAmount = userData.investmentAmount || '250k-1M';
        
        return `**Part 1: Executive Summary & Strategic Insights**

Our comprehensive analysis reveals two distinct and powerful strategic paths for your acquisition journey, each defined by a clear operator archetype. Understanding these two paths is the key to focusing your search and maximizing your chances of success.

**The Efficiency Expert (The Value Unlocker):**
This archetype represents your primary strength in ${this.getTopCompetency(competencies)}. You excel at leveraging ${this.getTopCompetency(competencies)} to drive strategic value and operational excellence, and are driven by ${motivators.join(' and ')}. Your ${riskTolerance} risk tolerance and ${timeHorizon} time horizon make you well-suited for ${this.getInvestmentRangeDescription(investmentAmount)} acquisitions.

**The Growth Catalyst (The Scaler):**
This secondary archetype leverages your ${this.getSecondCompetency(competencies)} capabilities. You have strong potential in leveraging ${this.getSecondCompetency(competencies)} for strategic advantage and can complement your primary archetype through strategic integration of ${this.getTopCompetency(competencies)} and ${this.getSecondCompetency(competencies)} capabilities.

**How to Use This Report to Create Your Unified Buybox**

This analysis provides your personalized acquisition strategy framework. Focus on opportunities that align with your Efficiency Expert strengths while developing your Growth Catalyst capabilities. Your ideal targets will be ${this.getTargetDescription(userData)} that offer significant ${motivators.join(' and ')} potential.

Strategic Implications: Your unique combination of competencies positions you for success in ${this.getIndustryFocus(userData)}. Prioritize deals that leverage your ${this.getTopCompetency(competencies)} expertise while building your ${this.getSecondCompetency(competencies)} capabilities for long-term value creation.

**Part 3: Detailed Framework Reports**

---

### --- Traditional M&A Expert Analysis ---
*Expert M&A advisory approach focusing on operator archetype identification and strategic acquisition targeting.*

**Key Insights:**
- Primary Archetype: ${personalizedArchetypes.archetype1}
- Secondary Archetype: ${personalizedArchetypes.archetype2}
- Recommended Deal Size: ${investmentAmount}
- Risk Profile: ${riskTolerance}
- Time Horizon: ${timeHorizon}

**Strategic Recommendations:**
1. Focus on ${this.getIndustryFocus(userData)} opportunities
2. Prioritize ${this.getDealTypeFocus(userData)} structures
3. Develop ${this.getCapabilityGaps(userData)} capabilities
4. Build relationships in ${this.getNetworkFocus(userData)} networks

<thesis_start>
Your acquisition thesis centers on leveraging your ${this.getTopCompetency(competencies)} expertise to identify and acquire ${this.getIndustryFocus(userData)} businesses in the ${investmentAmount} range. Your ${personalizedArchetypes.archetype1} profile positions you to create value through operational improvements and strategic synergies, while your ${personalizedArchetypes.archetype2} capabilities enable you to accelerate growth and market expansion. Target businesses with strong fundamentals but underutilized potential, where your ${this.getTopCompetency(competencies)} and ${this.getSecondCompetency(competencies)} skills can drive significant value creation and competitive advantage.
<thesis_end>

**Your Personalized Buybox**

| CRITERION | YOUR TARGET PROFILE | RATIONALE |
|-----------|-------------------|-----------|
| **Target Size** | ${investmentAmount} | Aligns with your risk tolerance and available capital |
| **Industry Focus** | ${this.getIndustryFocus(userData)} | Matches your operational expertise and market knowledge |
| **Deal Structure** | ${this.getDealTypeFocus(userData)} | Optimizes for your acquisition strategy and risk profile |
| **Key Capabilities** | ${this.getTopCompetency(competencies)}, ${this.getSecondCompetency(competencies)} | Leverages your strongest competencies for value creation |
| **Risk Profile** | ${riskTolerance} | Balances opportunity with your risk tolerance |
| **Time Horizon** | ${timeHorizon} | Matches your investment timeline and exit strategy |

---

### --- Digital Transformation Analysis ---
*Modern acquisition strategy focusing on technology integration and digital value creation.*

**Digital Readiness Assessment:**
- Technology Integration: ${this.getTechIntegration(competencies)}
- Data Capabilities: ${this.getDataCapabilities(competencies)}
- Digital Value Creation: ${this.getValueCreationPotential(competencies)}

**Digital Recommendations:**
1. Target businesses with strong digital infrastructure
2. Focus on technology-enabled value creation
3. Develop data-driven decision making capabilities
4. Build digital transformation expertise

<thesis_start>
Your acquisition thesis centers on leveraging digital transformation opportunities to identify and acquire technology-enabled businesses in the 250k-1M range. Your moderate technology integration capabilities position you to create value through digital improvements and strategic technology synergies, while your developing digital value creation skills enable you to accelerate growth and market expansion. Target businesses with strong digital infrastructure but underutilized technology potential, where your operations and systems and sales and marketing skills can drive significant digital value creation and competitive advantage.
<thesis_end>

**Your Personalized Buybox**

| CRITERION | YOUR TARGET PROFILE | RATIONALE |
|-----------|-------------------|-----------|
| **Target Size** | ${investmentAmount} | Aligns with your risk tolerance and available capital |
| **Industry Focus** | ${this.getIndustryFocus(userData)} | Matches your operational expertise and market knowledge |
| **Deal Structure** | ${this.getDealTypeFocus(userData)} | Optimizes for your acquisition strategy and risk profile |
| **Key Capabilities** | ${this.getTopCompetency(competencies)}, ${this.getSecondCompetency(competencies)} | Leverages your strongest competencies for value creation |
| **Risk Profile** | ${riskTolerance} | Balances opportunity with your risk tolerance |
| **Time Horizon** | ${timeHorizon} | Matches your investment timeline and exit strategy |

---

### --- The Hedgehog Concept Analysis ---
*Jim Collins' three circles framework: passion, excellence, and economic engine alignment.*

**Hedgehog Analysis:**
- Passion: ${this.getTopCompetency(competencies)} and strategic value creation
- Excellence: ${this.getSecondCompetency(competencies)} capabilities and operational expertise
- Economic Engine: ${motivators.join(' and ')} through strategic acquisitions

**Hedgehog Recommendations:**
1. Focus on businesses where passion and excellence intersect
2. Target opportunities that drive your economic engine
3. Align acquisition strategy with core competencies
4. Build sustainable competitive advantages

<thesis_start>
Your acquisition thesis centers on leveraging your passion for operations and systems and strategic value creation to identify and acquire businesses in the 250k-1M range where your excellence in sales and marketing capabilities and operational expertise can drive your economic engine of freedom and earning potential. Your passion-excellence intersection positions you to create value through strategic synergies and operational improvements, while your economic engine focus enables you to accelerate growth and market expansion. Target businesses where your core competencies align with market opportunities, where your operations and systems and sales and marketing skills can drive significant value creation and sustainable competitive advantage.
<thesis_end>

**Your Personalized Buybox**

| CRITERION | YOUR TARGET PROFILE | RATIONALE |
|-----------|-------------------|-----------|
| **Target Size** | ${investmentAmount} | Aligns with your risk tolerance and available capital |
| **Industry Focus** | ${this.getIndustryFocus(userData)} | Matches your operational expertise and market knowledge |
| **Deal Structure** | ${this.getDealTypeFocus(userData)} | Optimizes for your acquisition strategy and risk profile |
| **Key Capabilities** | ${this.getTopCompetency(competencies)}, ${this.getSecondCompetency(competencies)} | Leverages your strongest competencies for value creation |
| **Risk Profile** | ${riskTolerance} | Balances opportunity with your risk tolerance |
| **Time Horizon** | ${timeHorizon} | Matches your investment timeline and exit strategy |

---

### --- SWOT Analysis ---
*Strategic planning framework evaluating internal strengths/weaknesses against external opportunities/threats.*

**SWOT Assessment:**
- Strengths: ${this.getTopCompetency(competencies)} expertise and ${this.getSecondCompetency(competencies)} capabilities
- Weaknesses: Areas requiring development in complementary skills
- Opportunities: ${this.getIndustryFocus(userData)} market opportunities
- Threats: Market volatility and competitive pressures

**SWOT Strategy:**
1. Leverage strengths in ${this.getTopCompetency(competencies)}
2. Address weaknesses through strategic partnerships
3. Capitalize on ${this.getIndustryFocus(userData)} opportunities
4. Mitigate threats through diversification

<thesis_start>
Your acquisition thesis centers on leveraging your operations and systems expertise and sales and marketing capabilities to identify and acquire diverse industries businesses in the 250k-1M range. Your strengths position you to create value through operational improvements and strategic synergies, while addressing weaknesses through strategic partnerships enables you to accelerate growth and market expansion. Target businesses with strong fundamentals but areas for improvement, where your operations and systems and sales and marketing skills can drive significant value creation and competitive advantage while mitigating market volatility and competitive pressures.
<thesis_end>

**Your Personalized Buybox**

| CRITERION | YOUR TARGET PROFILE | RATIONALE |
|-----------|-------------------|-----------|
| **Target Size** | ${investmentAmount} | Aligns with your risk tolerance and available capital |
| **Industry Focus** | ${this.getIndustryFocus(userData)} | Matches your operational expertise and market knowledge |
| **Deal Structure** | ${this.getDealTypeFocus(userData)} | Optimizes for your acquisition strategy and risk profile |
| **Key Capabilities** | ${this.getTopCompetency(competencies)}, ${this.getSecondCompetency(competencies)} | Leverages your strongest competencies for value creation |
| **Risk Profile** | ${riskTolerance} | Balances opportunity with your risk tolerance |
| **Time Horizon** | ${timeHorizon} | Matches your investment timeline and exit strategy |

---

### --- Entrepreneurial Orientation Analysis ---
*Miller (1983) framework assessing innovativeness, proactiveness, and risk-taking to match entrepreneurial DNA.*

**EO Assessment:**
- Innovativeness: ${this.getTechIntegration(competencies)} technology integration
- Proactiveness: ${this.getGrowthAcceleration(competencies)} growth acceleration
- Risk-Taking: ${riskTolerance} risk tolerance and strategic positioning

**EO Strategy:**
1. Apply innovative approaches to ${this.getTopCompetency(competencies)}
2. Proactively identify market opportunities
3. Balance risk-taking with strategic planning
4. Build entrepreneurial capabilities

<thesis_start>
Your acquisition thesis centers on leveraging your moderate technology integration and medium growth acceleration capabilities to identify and acquire diverse industries businesses in the 250k-1M range. Your medium risk tolerance and strategic positioning enable you to create value through innovative operational approaches and proactive market identification, while your entrepreneurial capabilities enable you to accelerate growth and market expansion. Target businesses with growth potential but underutilized innovation opportunities, where your operations and systems and sales and marketing skills can drive significant value creation and competitive advantage through balanced risk-taking and strategic planning.
<thesis_end>

**Your Personalized Buybox**

| CRITERION | YOUR TARGET PROFILE | RATIONALE |
|-----------|-------------------|-----------|
| **Target Size** | ${investmentAmount} | Aligns with your risk tolerance and available capital |
| **Industry Focus** | ${this.getIndustryFocus(userData)} | Matches your operational expertise and market knowledge |
| **Deal Structure** | ${this.getDealTypeFocus(userData)} | Optimizes for your acquisition strategy and risk profile |
| **Key Capabilities** | ${this.getTopCompetency(competencies)}, ${this.getSecondCompetency(competencies)} | Leverages your strongest competencies for value creation |
| **Risk Profile** | ${riskTolerance} | Balances opportunity with your risk tolerance |
| **Time Horizon** | ${timeHorizon} | Matches your investment timeline and exit strategy |

---

### --- Value Creation Analysis ---
*Strategic framework for identifying and maximizing acquisition value.*

**Value Creation Potential:**
- Operational Excellence: ${this.getOperationalExcellence(competencies)}
- Growth Acceleration: ${this.getGrowthAcceleration(competencies)}
- Strategic Synergies: High potential for ${this.getTopCompetency(competencies)} integration

**Value Creation Strategy:**
1. Identify operational improvement opportunities
2. Develop growth acceleration capabilities
3. Create strategic synergies through ${this.getTopCompetency(competencies)}
4. Build sustainable competitive advantages

<thesis_start>
Your acquisition thesis centers on leveraging your moderate operational excellence and medium growth acceleration capabilities to identify and acquire diverse industries businesses in the 250k-1M range with high potential for operations and systems integration. Your strategic synergies focus enables you to create value through operational improvements and growth acceleration, while your sustainable competitive advantages enable you to accelerate market expansion. Target businesses with operational improvement opportunities and growth potential, where your operations and systems and sales and marketing skills can drive significant value creation and competitive advantage through strategic synergies and sustainable competitive positioning.
<thesis_end>

**Your Personalized Buybox**

| CRITERION | YOUR TARGET PROFILE | RATIONALE |
|-----------|-------------------|-----------|
| **Target Size** | ${investmentAmount} | Aligns with your risk tolerance and available capital |
| **Industry Focus** | ${this.getIndustryFocus(userData)} | Matches your operational expertise and market knowledge |
| **Deal Structure** | ${this.getDealTypeFocus(userData)} | Optimizes for your acquisition strategy and risk profile |
| **Key Capabilities** | ${this.getTopCompetency(competencies)}, ${this.getSecondCompetency(competencies)} | Leverages your strongest competencies for value creation |
| **Risk Profile** | ${riskTolerance} | Balances opportunity with your risk tolerance |
| **Time Horizon** | ${timeHorizon} | Matches your investment timeline and exit strategy |

**Strategic Implications:** This comprehensive analysis positions you as a ${personalizedArchetypes.archetype1} with strong ${personalizedArchetypes.archetype2} capabilities, ready to execute strategic acquisitions in the ${investmentAmount} range with a focus on ${this.getIndustryFocus(userData)} opportunities that align with your ${motivators.join(' and ')} objectives.`;
    }

    getInvestmentRangeDescription(amount) {
        const ranges = {
            '50k-250k': 'small to medium',
            '250k-1M': 'medium to large',
            '1M-5M': 'large',
            '5M+': 'enterprise-level'
        };
        return ranges[amount] || 'medium to large';
    }

    getTechIntegration(competencies) {
        if (!competencies || typeof competencies !== 'object') return 'moderate';
        const techScore = competencies.product_technology || 0;
        if (techScore >= 4) return 'high';
        if (techScore >= 3) return 'moderate';
        return 'developing';
    }

    getDataCapabilities(competencies) {
        if (!competencies || typeof competencies !== 'object') return 'moderate';
        const analyticsScore = competencies.finance_analytics || 0;
        if (analyticsScore >= 4) return 'strong';
        if (analyticsScore >= 3) return 'moderate';
        return 'developing';
    }

    getValueCreationPotential(competencies) {
        if (!competencies || typeof competencies !== 'object') return 'moderate';
        const scores = Object.values(competencies);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (avgScore >= 4) return 'high';
        if (avgScore >= 3) return 'moderate';
        return 'developing';
    }

    getOperationalExcellence(competencies) {
        if (!competencies || typeof competencies !== 'object') return 'moderate';
        const opsScore = competencies.operations_systems || 0;
        if (opsScore >= 4) return 'strong';
        if (opsScore >= 3) return 'moderate';
        return 'developing';
    }

    getGrowthAcceleration(competencies) {
        if (!competencies || typeof competencies !== 'object') return 'moderate';
        const salesScore = competencies.sales_marketing || 0;
        if (salesScore >= 4) return 'high';
        if (salesScore >= 3) return 'moderate';
        return 'developing';
    }

    getTargetDescription(userData) {
        const industry = userData.industry || 'any';
        const dealSize = userData.dealSize || 'small';
        return `${dealSize}-sized businesses in ${industry} industries`;
    }

    getIndustryFocus(userData) {
        const industry = userData.industry || 'any';
        return industry === 'any' ? 'diverse industries' : `${industry} sector`;
    }

    getDealTypeFocus(userData) {
        const dealType = userData.dealType || 'asset_purchase';
        const types = {
            'asset_purchase': 'asset purchase',
            'stock_purchase': 'stock purchase',
            'merger': 'merger',
            'partnership': 'partnership'
        };
        return types[dealType] || 'acquisition';
    }

    getNetworkFocus(userData) {
        const industry = userData.industry || 'any';
        return industry === 'any' ? 'diverse business networks' : `${industry} industry networks`;
    }

    getCapabilityGaps(competencies) {
        const scores = Object.entries(competencies).sort((a, b) => a[1] - b[1]);
        const competencyNames = {
            sales_marketing: 'sales and marketing',
            operations_systems: 'operations and systems',
            finance_analytics: 'finance and analytics',
            team_culture: 'team building and culture',
            product_technology: 'product development and technology'
        };
        return competencyNames[scores[0][0]] || 'strategic capabilities';
    }

    generateFallbackFrameworks(userData) {
        return {
            traditional: {
                name: 'Traditional M&A Expert Analysis',
                description: 'Expert M&A advisory approach focusing on operator archetype identification and strategic acquisition targeting.',
                insights: this.generateTraditionalInsights(userData),
                recommendations: this.generateTraditionalRecommendations(userData)
            },
            digital: {
                name: 'Digital Transformation Framework',
                description: 'Modern approach focusing on technology-enabled value creation and digital integration.',
                insights: this.generateDigitalInsights(userData),
                recommendations: this.generateDigitalRecommendations(userData)
            },
            value: {
                name: 'Value Creation Framework',
                description: 'Focus on post-acquisition value realization and operational improvement.',
                insights: this.generateValueInsights(userData),
                recommendations: this.generateValueRecommendations(userData)
            }
        };
    }

    generateTraditionalInsights(userData) {
        return {
            primaryArchetype: this.generatePersonalizedArchetypeNames(userData.competencies).archetype1,
            secondaryArchetype: this.generatePersonalizedArchetypeNames(userData.competencies).archetype2,
            dealSize: userData.investmentAmount || '250k-1M',
            riskProfile: userData.riskTolerance || 'medium',
            timeHorizon: userData.timeHorizon || '1-3 years'
        };
    }

    generateTraditionalRecommendations(userData) {
        return [
            `Focus on ${this.getIndustryFocus(userData)} opportunities`,
            `Prioritize ${this.getDealTypeFocus(userData)} structures`,
            `Develop ${this.getCapabilityGaps(userData)} capabilities`,
            `Build relationships in ${this.getNetworkFocus(userData)} networks`
        ];
    }

    generateDigitalInsights(userData) {
        return {
            digitalReadiness: this.getDigitalReadiness(userData),
            techIntegration: this.getTechIntegration(userData),
            dataCapabilities: this.getDataCapabilities(userData)
        };
    }

    generateDigitalRecommendations(userData) {
        return [
            'Identify technology-enabled acquisition targets',
            'Develop digital integration capabilities',
            'Build data-driven decision making processes',
            'Create scalable technology platforms'
        ];
    }

    generateValueInsights(userData) {
        return {
            valueCreationPotential: this.getValueCreationPotential(userData),
            operationalExcellence: this.getOperationalExcellence(userData),
            growthAcceleration: this.getGrowthAcceleration(userData)
        };
    }

    generateValueRecommendations(userData) {
        return [
            'Develop operational improvement capabilities',
            'Build growth acceleration frameworks',
            'Create value realization processes',
            'Establish performance measurement systems'
        ];
    }

    getDigitalReadiness(userData) {
        const techScore = userData.competencies?.product_technology || 3;
        return techScore >= 4 ? 'High' : techScore >= 3 ? 'Medium' : 'Developing';
    }

    getTechIntegration(userData) {
        const techScore = userData.competencies?.product_technology || 3;
        return techScore >= 4 ? 'Advanced' : techScore >= 3 ? 'Moderate' : 'Basic';
    }

    getDataCapabilities(userData) {
        const analyticsScore = userData.competencies?.finance_analytics || 3;
        return analyticsScore >= 4 ? 'Strong' : analyticsScore >= 3 ? 'Moderate' : 'Developing';
    }

    getValueCreationPotential(userData) {
        const avgScore = Object.values(userData.competencies || {}).reduce((a, b) => a + b, 0) / 5;
        return avgScore >= 4 ? 'High' : avgScore >= 3 ? 'Medium' : 'Developing';
    }

    getOperationalExcellence(userData) {
        const opsScore = userData.competencies?.operations_systems || 3;
        return opsScore >= 4 ? 'Strong' : opsScore >= 3 ? 'Moderate' : 'Developing';
    }

    getGrowthAcceleration(userData) {
        const salesScore = userData.competencies?.sales_marketing || 3;
        return salesScore >= 4 ? 'High' : salesScore >= 3 ? 'Medium' : 'Developing';
    }

    generateFallbackComparison() {
        return {
            summary: 'Multi-framework analysis provides comprehensive strategic insights',
            strengths: [
                'Comprehensive archetype identification',
                'Multi-dimensional strategic analysis',
                'Personalized recommendations',
                'Framework-specific insights'
            ],
            recommendations: [
                'Focus on primary archetype strengths',
                'Develop secondary archetype capabilities',
                'Leverage framework synergies',
                'Implement strategic recommendations'
            ]
        };
    }
}

// Helper function to format "How to Use This Report" text as integrated paragraphs
function formatHowToUseText(text) {
    if (!text) return '';
    
    // Convert markdown bold to HTML bold but keep as integrated text
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert line breaks to HTML breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
}

function generatePersonalizedArchetypeNames(formData) {
    // Get competency ratings
    const ratings = {
        sales: parseInt(formData.sales_marketing?.rating || '0'),
        operations: parseInt(formData.operations_systems?.rating || '0'),
        finance: parseInt(formData.finance_analytics?.rating || '0'),
        team: parseInt(formData.team_culture?.rating || '0'),
        product: parseInt(formData.product_technology?.rating || '0')
    };
    
    // Find the two highest-rated competencies
    const sortedRatings = Object.entries(ratings)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2);
    
    const [top1, top2] = sortedRatings;
    const [top1Name, top1Rating] = top1;
    const [top2Name, top2Rating] = top2;
    
    // Generate personalized archetype names based on the top two competencies
    let archetype1, archetype2;
    
    if (top1Name === 'operations' && top2Name === 'finance') {
        archetype1 = 'The Operational Optimizer';
        archetype2 = 'The Financial Restructurer';
    } else if (top1Name === 'sales' && top2Name === 'product') {
        archetype1 = 'The Market Innovator';
        archetype2 = 'The Product Growth Specialist';
    } else if (top1Name === 'team' && top2Name === 'product') {
        archetype1 = 'The Culture Builder';
        archetype2 = 'The Product Team Leader';
    } else if (top1Name === 'sales' && top2Name === 'team') {
        archetype1 = 'The Relationship Driver';
        archetype2 = 'The Community Builder';
    } else if (top1Name === 'operations' && top2Name === 'sales') {
        archetype1 = 'The Process Optimizer';
        archetype2 = 'The Revenue Accelerator';
    } else if (top1Name === 'finance' && top2Name === 'product') {
        archetype1 = 'The Financial Strategist';
        archetype2 = 'The Tech Value Creator';
    } else {
        // Fallback based on single highest competency
        if (top1Name === 'operations') {
            archetype1 = 'The Operational Expert';
            archetype2 = 'The Systems Optimizer';
        } else if (top1Name === 'sales') {
            archetype1 = 'The Market Driver';
            archetype2 = 'The Revenue Builder';
        } else if (top1Name === 'finance') {
            archetype1 = 'The Financial Architect';
            archetype2 = 'The Value Optimizer';
        } else if (top1Name === 'team') {
            archetype1 = 'The Culture Catalyst';
            archetype2 = 'The Team Builder';
        } else if (top1Name === 'product') {
            archetype1 = 'The Product Innovator';
            archetype2 = 'The Tech Visionary';
        } else {
            archetype1 = 'The Strategic Operator';
            archetype2 = 'The Value Creator';
        }
    }
    
    return {
        archetype1: archetype1,
        archetype2: archetype2,
        topCompetencies: [top1Name, top2Name],
        ratings: ratings
    };
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.acquisitionAdvisorApp = new AcquisitionAdvisorApp();
});

// Setup pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js`;
