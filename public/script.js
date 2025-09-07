class AcquisitionAdvisorApp {
    constructor() {
        this.currentPhase = 1;
        this.analysisResults = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.updateProgress();
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
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            
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
            alert('Sorry, there was an error analyzing your profile. Please try again.');
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
        a.download = 'acquisition-strategy-report.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    generateMarkdownReport() {
        const results = this.analysisResults;
        const timestamp = new Date().toLocaleDateString();
        
        let markdown = `# AI-Powered Acquisition Strategy Report\n\n`;
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
        markdown += `*This report was generated by the AI-Powered Acquisition Advisor based on your unique profile and preferences.*`;
        
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
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AcquisitionAdvisorApp();
});
