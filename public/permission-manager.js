// Frontend Permission Manager
class PermissionManager {
    constructor() {
        this.permissions = null;
        this.userRole = 'basic';
        this.usage = {
            reportsThisMonth: 0,
            reportsToday: 0,
            totalReports: 0
        };
        this.limits = {
            monthlyReports: 5,
            dailyReports: 2,
            maxReportHistory: 50,
            apiCallsPerMonth: 50
        };
    }

    // Initialize permissions for current user
    async initialize() {
        try {
            if (!window.authDashboardManager || !window.authDashboardManager.currentUser) {
                console.log('⚠️ No authenticated user, using basic permissions');
                this.setBasicPermissions();
                return;
            }

            const userEmail = window.authDashboardManager.currentUser.email;
            
            // Check if this is the admin email
            if (userEmail === 'capitalgainsx10@gmail.com') {
                console.log('🔐 Admin user detected:', userEmail);
                this.setAdminPermissions();
                return;
            }

            const userId = window.authDashboardManager.currentUser.uid;
            const response = await fetch(`${this.getApiBaseUrl()}/api/protected/permissions`, {
                headers: {
                    'Authorization': `Bearer ${await this.getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.permissions = result.permissions.permissions;
                    this.userRole = result.permissions.role;
                    this.usage = result.permissions.usage;
                    this.limits = result.permissions.limits;
                    console.log('✅ Permissions loaded:', this.userRole, this.permissions.length, 'permissions');
                } else {
                    console.warn('⚠️ Failed to load permissions, using basic:', result.error);
                    this.setBasicPermissions();
                }
            } else {
                console.warn('⚠️ Permission API not available, using basic permissions');
                this.setBasicPermissions();
            }
        } catch (error) {
            console.error('❌ Error loading permissions:', error);
            this.setBasicPermissions();
        }
    }

    // Set basic permissions for unauthenticated users
    setBasicPermissions() {
        this.permissions = ['create_reports', 'view_own_reports', 'delete_own_reports', 'use_gemini'];
        this.userRole = 'basic';
        this.usage = { reportsThisMonth: 0, reportsToday: 0, totalReports: 0 };
        this.limits = { monthlyReports: 5, dailyReports: 2, maxReportHistory: 50, apiCallsPerMonth: 50 };
    }

    // Set admin permissions for admin users
    setAdminPermissions() {
        this.permissions = [
            'create_reports', 'view_own_reports', 'delete_own_reports', 'export_reports',
            'use_gemini', 'use_openai', 'use_claude', 'use_hybrid',
            'comparison_mode', 'bulk_analysis', 'api_access',
            'view_all_reports', 'manage_users', 'system_settings'
        ];
        this.userRole = 'admin';
        this.usage = { reportsThisMonth: 0, reportsToday: 0, totalReports: 0 };
        this.limits = { monthlyReports: -1, dailyReports: -1, maxReportHistory: -1, apiCallsPerMonth: -1 };
    }

    // Check if user has specific permission
    hasPermission(permission) {
        return this.permissions && this.permissions.includes(permission);
    }

    // Check if user can create reports (considering limits)
    canCreateReport() {
        if (!this.hasPermission('create_reports')) {
            return { canCreate: false, reason: 'No permission to create reports' };
        }

        // Check monthly limit
        if (this.limits.monthlyReports !== -1 && this.usage.reportsThisMonth >= this.limits.monthlyReports) {
            return { 
                canCreate: false, 
                reason: `Monthly limit reached (${this.usage.reportsThisMonth}/${this.limits.monthlyReports})` 
            };
        }

        // Check daily limit
        if (this.limits.dailyReports !== -1 && this.usage.reportsToday >= this.limits.dailyReports) {
            return { 
                canCreate: false, 
                reason: `Daily limit reached (${this.usage.reportsToday}/${this.limits.dailyReports})` 
            };
        }

        return { canCreate: true };
    }

    // Get available AI engines based on permissions
    getAvailableEngines() {
        const engines = {
            traditional: { name: 'Traditional AI', enabled: true, available: true }
        };

        if (this.hasPermission('use_gemini')) {
            engines.gemini = { name: 'Google Gemini', enabled: true, available: true };
        }
        if (this.hasPermission('use_openai')) {
            engines.openai = { name: 'OpenAI GPT-4', enabled: false, available: false };
        }
        if (this.hasPermission('use_claude')) {
            engines.claude = { name: 'Anthropic Claude 3.5', enabled: false, available: false };
        }
        if (this.hasPermission('use_hybrid')) {
            engines.hybrid = { name: 'Hybrid AI Engine', enabled: false, available: false };
        }

        return engines;
    }

    // Check if comparison mode is available
    canUseComparisonMode() {
        return this.hasPermission('comparison_mode');
    }

    // Check if export is available
    canExportReports() {
        return this.hasPermission('export_reports');
    }

    // Check if API access is available
    canUseAPI() {
        return this.hasPermission('api_access');
    }

    // Get usage statistics
    getUsageStats() {
        return {
            role: this.userRole,
            usage: this.usage,
            limits: this.limits,
            canCreateReport: this.canCreateReport(),
            availableEngines: Object.keys(this.getAvailableEngines()).length
        };
    }

    // Update usage after report creation
    async updateUsage(action = 'create_reports') {
        try {
            if (!window.authDashboardManager || !window.authDashboardManager.currentUser) {
                return;
            }

            const response = await fetch(`${this.getApiBaseUrl()}/api/protected/update-usage`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${await this.getAuthToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action })
            });

            if (response.ok) {
                // Update local usage
                if (action === 'create_reports') {
                    this.usage.reportsThisMonth += 1;
                    this.usage.reportsToday += 1;
                    this.usage.totalReports += 1;
                }
                console.log('✅ Usage updated');
            }
        } catch (error) {
            console.error('❌ Failed to update usage:', error);
        }
    }

    // Get API base URL
    getApiBaseUrl() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3000';
        }
        return 'https://buybox-generator-backend-production.up.railway.app';
    }

    // Get authentication token
    async getAuthToken() {
        if (window.authDashboardManager && window.authDashboardManager.currentUser) {
            return await window.authDashboardManager.currentUser.getIdToken();
        }
        return null;
    }

    // Show permission-based UI elements
    updateUI() {
        // Update engine selection based on permissions
        this.updateEngineSelection();
        
        // Update comparison mode toggle
        this.updateComparisonModeToggle();
        
        // Update export buttons
        this.updateExportButtons();
        
        // Show usage limits
        this.showUsageLimits();
    }

    updateEngineSelection() {
        const availableEngines = this.getAvailableEngines();
        const engineCards = document.querySelectorAll('.engine-card');
        
        engineCards.forEach(card => {
            const checkbox = card.querySelector('input[type="checkbox"]');
            const radio = card.querySelector('input[type="radio"]');
            const engineType = checkbox ? checkbox.value : (radio ? radio.value : null);
            
            if (engineType && availableEngines[engineType]) {
                const engine = availableEngines[engineType];
                checkbox.disabled = !engine.available;
                if (radio) radio.disabled = !engine.available;
                
                if (!engine.available) {
                    card.classList.add('disabled');
                    card.title = 'Not available in your plan';
                } else {
                    card.classList.remove('disabled');
                    card.title = '';
                }
            }
        });
    }

    updateComparisonModeToggle() {
        const comparisonToggle = document.getElementById('comparisonModeToggle');
        if (comparisonToggle) {
            if (this.canUseComparisonMode()) {
                comparisonToggle.disabled = false;
                comparisonToggle.parentElement.style.opacity = '1';
            } else {
                comparisonToggle.disabled = true;
                comparisonToggle.parentElement.style.opacity = '0.5';
                comparisonToggle.parentElement.title = 'Comparison mode not available in your plan';
            }
        }
    }

    updateExportButtons() {
        const exportButtons = document.querySelectorAll('[data-action="export"]');
        exportButtons.forEach(button => {
            if (this.canExportReports()) {
                button.disabled = false;
                button.style.opacity = '1';
            } else {
                button.disabled = true;
                button.style.opacity = '0.5';
                button.title = 'Export not available in your plan';
            }
        });
    }

    showUsageLimits() {
        const usageStats = this.getUsageStats();
        const usageElement = document.getElementById('usageStats');
        
        if (usageElement) {
            usageElement.innerHTML = `
                <div class="usage-stats">
                    <h4>Usage Statistics</h4>
                    <p><strong>Plan:</strong> ${usageStats.role.toUpperCase()}</p>
                    <p><strong>Reports this month:</strong> ${usageStats.usage.reportsThisMonth}/${usageStats.limits.monthlyReports === -1 ? '∞' : usageStats.limits.monthlyReports}</p>
                    <p><strong>Reports today:</strong> ${usageStats.usage.reportsToday}/${usageStats.limits.dailyReports === -1 ? '∞' : usageStats.limits.dailyReports}</p>
                    <p><strong>Total reports:</strong> ${usageStats.usage.totalReports}</p>
                    <p><strong>Available engines:</strong> ${usageStats.availableEngines}</p>
                </div>
            `;
        }
    }
}

// Initialize global permission manager
window.permissionManager = new PermissionManager();
