// Authentication and Dashboard Manager
class AuthDashboardManager {
    constructor() {
        this.authService = null;
        this.reportService = null;
        this.currentUser = null;
        this.isInitialized = false;
        this.authStateListenerSet = false;
        this.db = null; // Add db as instance variable
        
        this.init();
    }

    async init() {
        try {
            // Wait for Firebase to be available
            await this.waitForFirebase();
            
            // Initialize Firebase services
            this.initializeFirebase();
            
            // Load UI components
            await this.loadUIComponents();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Check authentication state (only once)
            if (!this.authStateListenerSet) {
                this.checkAuthState();
            }
            
            this.isInitialized = true;
            console.log('✅ AuthDashboardManager initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize AuthDashboardManager:', error);
        }
    }

    async waitForFirebase() {
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!window.Firebase && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.Firebase) {
            throw new Error('Firebase failed to load');
        }
    }

    initializeFirebase() {
        // Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyBWUj5YXXwnM1LwLoeDxAIHoVk8Yufg9zY",
            authDomain: "buybox-generator.firebaseapp.com",
            projectId: "buybox-generator",
            storageBucket: "buybox-generator.firebasestorage.app",
            messagingSenderId: "238547139302",
            appId: "1:238547139302:web:250fe73440647b4ff05927",
            measurementId: "G-GCNLJSEDBH"
        };

        // Initialize Firebase
        let auth;
        try {
            const app = window.Firebase.initializeApp(firebaseConfig);
            auth = window.Firebase.getAuth(app);
            this.db = window.Firebase.getFirestore(app);
            
            console.log('✅ Firebase initialized successfully');
        } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
            this.showFirebaseSetupError();
            return;
        }

        // Create simplified auth service
        this.authService = {
            auth: auth,
            db: this.db,
            currentUser: null,
            
            async signIn(email, password) {
                try {
                    const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js');
                    const userCredential = await signInWithEmailAndPassword(auth, email, password);
                    this.currentUser = userCredential.user;
                    return { success: true, user: userCredential.user };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },
            
            async register(email, password, displayName) {
                try {
                    const { createUserWithEmailAndPassword, updateProfile } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js');
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    const user = userCredential.user;
                    
                    await updateProfile(user, { displayName: displayName });
                    this.currentUser = user;
                    return { success: true, user: user };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },
            
            async signOut() {
                try {
                    const { signOut } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js');
                    await signOut(auth);
                    this.currentUser = null;
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },
            
            onAuthStateChange(callback) {
                auth.onAuthStateChanged(callback);
            },
            
            getCurrentUser() {
                return auth.currentUser;
            }
        };

        // Create simplified report service
        this.reportService = {
            db: this.db,
            
            async saveReport(userId, reportData) {
                try {
                    console.log('💾 ReportService: Saving report with method:', reportData.method);
                    const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
                    const report = {
                        userId: userId,
                        title: reportData.title || 'Buybox Analysis Report',
                        generatedAt: new Date(),
                        formData: reportData.formData,
                        analysisResults: reportData.analysisResults,
                        aiModel: reportData.aiModel || 'gemini-2.5-flash',
                        method: reportData.method || 'two_stage_optimized', // Add method field
                        version: reportData.version || '1.0',
                        isPublic: false,
                        tags: reportData.tags || [],
                        notes: reportData.notes || ''
                    };
                    
                    console.log('💾 ReportService: Final report object being saved:', report);
                    
                    const docRef = await addDoc(collection(this.db, 'reports'), report);
                    return { success: true, reportId: docRef.id, report: report };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },
            
            async getUserReports(userId) {
                try {
                    const { collection, query, where, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
                    const q = query(
                        collection(this.db, 'reports'),
                        where('userId', '==', userId),
                        limit(50)
                    );
                    
                    const querySnapshot = await getDocs(q);
                    const reports = [];
                    querySnapshot.forEach((doc) => {
                        reports.push({ id: doc.id, ...doc.data() });
                    });
                    
                    // Sort by generatedAt in JavaScript to avoid requiring a composite index
                    reports.sort((a, b) => {
                        const aTime = a.generatedAt?.seconds || 0;
                        const bTime = b.generatedAt?.seconds || 0;
                        return bTime - aTime; // Descending order (newest first)
                    });
                    
                    return { success: true, reports: reports };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            }
        };
    }

    async loadUIComponents() {
        // Load auth modal
        const authResponse = await fetch('auth-modal.html');
        const authHTML = await authResponse.text();
        document.getElementById('authModalContainer').innerHTML = authHTML;
        
        // Load dashboard
        const dashboardResponse = await fetch('dashboard.html');
        const dashboardHTML = await dashboardResponse.text();
        document.getElementById('dashboardContainer').innerHTML = dashboardHTML;
    }

    setupEventListeners() {
        // Auth modal events
        document.addEventListener('click', (e) => {
            if (e.target.id === 'authClose') {
                // Don't allow closing if not authenticated
                if (!this.currentUser) {
                    return;
                }
                this.toggleAuthModal();
            }
            
            if (e.target.id === 'showLogin') {
                this.showLoginForm();
            }
            
            if (e.target.id === 'showRegister') {
                this.showRegisterForm();
            }
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'loginFormElement') {
                e.preventDefault();
                this.handleLogin(e);
            }
            
            if (e.target.id === 'registerFormElement') {
                e.preventDefault();
                this.handleRegister(e);
            }
            
            if (e.target.id === 'forgotPasswordFormElement') {
                e.preventDefault();
                this.handleForgotPassword(e);
            }
        });

        // Dashboard events
        document.addEventListener('click', (e) => {
            if (e.target.id === 'signOutBtn') {
                this.handleSignOut();
            }
            
            if (e.target.id === 'newAnalysisBtn') {
                this.showAnalysisForm();
            }
        });
    }

    checkAuthState() {
        if (!this.authService) {
            console.log('⚠️ Auth service not available, enabling demo mode');
            this.enableDemoMode();
            return;
        }
        
        // Check current auth state immediately
        const currentUser = this.authService.getCurrentUser();
        console.log('🔍 Current user check:', currentUser ? currentUser.email : 'null');
        
        if (currentUser) {
            console.log('✅ User already authenticated:', currentUser.email);
            this.currentUser = currentUser;
            this.showDashboard();
            this.loadUserData();
        } else {
            console.log('❌ No current user, showing auth modal');
            this.showAuthModal();
            this.blockMainContent();
        }
        
        // Only set up auth state listener once
        if (!this.authStateListenerSet) {
            this.authService.onAuthStateChange(async (user) => {
                console.log('🔄 Auth state changed:', user ? user.email : 'null');
                this.currentUser = user;
                if (user) {
                    console.log('✅ User authenticated:', user.email);
                    this.showDashboard();
                    this.loadUserData();
                } else {
                    console.log('❌ User not authenticated');
                    this.showAuthModal();
                    this.blockMainContent(); // Block access to main content
                }
            });
            this.authStateListenerSet = true;
        }
    }

    toggleAuthModal() {
        // Don't allow closing the modal if user is not authenticated
        if (!this.currentUser) {
            return;
        }
        
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
        }
    }

    showAuthModal() {
        const modal = document.getElementById('authModal');
        const dashboard = document.getElementById('userDashboard');
        const mainForm = document.getElementById('discoveryForm');
        
        if (modal) modal.style.display = 'flex';
        if (dashboard) dashboard.style.display = 'none';
        if (mainForm) mainForm.style.display = 'none';
    }

    blockMainContent() {
        // Hide the main form and show overlay
        const mainForm = document.getElementById('discoveryForm');
        if (mainForm) {
            mainForm.style.display = 'none';
        }
        
        // Add a blocking overlay
        let overlay = document.getElementById('authOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'authOverlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 999;
                display: flex;
                justify-content: center;
                align-items: center;
            `;
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'flex';
    }

    unblockMainContent() {
        // Only show main form if user is not authenticated (dashboard not shown)
        if (!this.currentUser) {
            const mainForm = document.getElementById('discoveryForm');
            if (mainForm) {
                mainForm.style.display = 'block';
                console.log('✅ Main form shown (user not authenticated)');
            }
        } else {
            console.log('✅ Main form kept hidden (user authenticated, dashboard shown)');
        }
        
        // Remove blocking overlay
        const overlay = document.getElementById('authOverlay');
        if (overlay) {
            overlay.style.display = 'none';
            console.log('✅ Overlay hidden');
        }
    }

    showDashboard() {
        const modal = document.getElementById('authModal');
        const dashboard = document.getElementById('userDashboard');
        const mainForm = document.getElementById('discoveryForm');
        
        console.log('🎯 Showing dashboard, hiding modal and main form');
        console.log('Modal element:', modal);
        console.log('Dashboard element:', dashboard);
        console.log('Main form element:', mainForm);
        
        // Hide the modal
        if (modal) {
            modal.style.display = 'none';
            console.log('✅ Modal hidden');
        } else {
            console.log('❌ Modal not found');
        }
        
        // Hide the main form and its containers when showing dashboard
        if (mainForm) {
            mainForm.style.display = 'none';
            mainForm.style.visibility = 'hidden';
            mainForm.style.height = '0';
            mainForm.style.overflow = 'hidden';
            mainForm.style.margin = '0';
            mainForm.style.padding = '0';
            console.log('✅ Main form completely hidden for dashboard view');
            
            // Also hide the main container that wraps the form
            const mainContainer = mainForm.closest('main, .main, .container, .content');
            if (mainContainer) {
                mainContainer.style.display = 'none';
                console.log('✅ Main container hidden');
            }
        } else {
            console.log('❌ Main form not found');
        }
        
        // Keep the header and title visible - only hide the main form content
        console.log('✅ Keeping header and title visible');
        
        // Force the dashboard to start at the very top
        if (dashboard) {
            dashboard.style.marginTop = '0';
            dashboard.style.paddingTop = '0';
            dashboard.style.position = 'relative';
            dashboard.style.top = '0';
        }
        
        // Show the dashboard
        if (dashboard) {
            dashboard.style.display = 'block';
            dashboard.style.visibility = 'visible';
            dashboard.style.height = 'auto';
            dashboard.style.overflow = 'visible';
            console.log('✅ Dashboard shown and made visible');
        } else {
            console.log('❌ Dashboard not found - checking dashboardContainer');
            const dashboardContainer = document.getElementById('dashboardContainer');
            console.log('Dashboard container:', dashboardContainer);
            if (dashboardContainer) {
                console.log('Dashboard container innerHTML length:', dashboardContainer.innerHTML.length);
            }
        }
        
        // Remove any blocking overlay
        const overlay = document.getElementById('authOverlay');
        if (overlay) {
            overlay.style.display = 'none';
            console.log('✅ Overlay hidden');
        }
        
        // Remove back to dashboard button if it exists
        const backButton = document.getElementById('backToDashboardBtn');
        if (backButton) {
            backButton.remove();
            console.log('✅ Back to dashboard button removed');
        }
        
        // Verify dashboard is actually visible
        setTimeout(() => {
            const dashboardCheck = document.getElementById('userDashboard');
            if (dashboardCheck) {
                const computedStyle = window.getComputedStyle(dashboardCheck);
                console.log('🔍 Dashboard visibility check:');
                console.log('  display:', computedStyle.display);
                console.log('  visibility:', computedStyle.visibility);
                console.log('  height:', computedStyle.height);
                console.log('  position:', computedStyle.position);
            }
        }, 100);
        
        console.log('✅ Dashboard display complete');
    }

    showLoginForm() {
        console.log('🔄 Switching to login form');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const forgotForm = document.getElementById('forgotPasswordForm');
        const title = document.getElementById('authModalTitle');
        
        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
        if (forgotForm) forgotForm.style.display = 'none';
        if (title) title.textContent = 'Sign In';
        
        console.log('✅ Login form shown, other forms hidden');
    }

    showRegisterForm() {
        console.log('🔄 Switching to register form');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const forgotForm = document.getElementById('forgotPasswordForm');
        const title = document.getElementById('authModalTitle');
        
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
        if (forgotForm) forgotForm.style.display = 'none';
        if (title) title.textContent = 'Create Account';
        
        console.log('✅ Register form shown, other forms hidden');
    }

    showForgotPasswordForm() {
        console.log('🔄 Switching to forgot password form');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const forgotForm = document.getElementById('forgotPasswordForm');
        const title = document.getElementById('authModalTitle');
        
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'none';
        if (forgotForm) forgotForm.style.display = 'block';
        if (title) title.textContent = 'Reset Password';
        
        console.log('✅ Forgot password form shown, other forms hidden');
    }

    async handleLogin(e) {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        this.showLoading(true);
        
        const result = await this.authService.signIn(email, password);
        
        if (result.success) {
            this.showMessage('Successfully signed in!', 'success');
            // Don't close modal here - let the auth state change handle it
            // The onAuthStateChange callback will show the dashboard
        } else {
            this.showMessage(result.error, 'error');
        }
        
        this.showLoading(false);
    }

    async handleRegister(e) {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        
        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }
        
        this.showLoading(true);
        
        const result = await this.authService.register(email, password, name);
        
        if (result.success) {
            this.showMessage('Account created successfully!', 'success');
            // Don't close modal here - let the auth state change handle it
            // The onAuthStateChange callback will show the dashboard
        } else {
            this.showMessage(result.error, 'error');
        }
        
        this.showLoading(false);
    }

    async handleForgotPassword(e) {
        const email = document.getElementById('forgotEmail').value;
        
        if (!email) {
            this.showMessage('Please enter your email address', 'error');
            return;
        }
        
        this.showLoading(true);
        
        try {
            const { sendPasswordResetEmail } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js');
            await sendPasswordResetEmail(this.authService.auth, email);
            this.showMessage('Password reset email sent! Check your inbox.', 'success');
            setTimeout(() => this.showLoginForm(), 2000);
        } catch (error) {
            console.error('Password reset error:', error);
            this.showMessage('Failed to send reset email: ' + error.message, 'error');
        }
        
        this.showLoading(false);
    }

    async handleSignOut() {
        console.log('🚪 Signing out user...');
        const result = await this.authService.signOut();
        if (result.success) {
            console.log('✅ User signed out successfully');
            this.showMessage('Signed out successfully', 'success');
            // The auth state change listener will handle showing the login modal
        } else {
            console.log('❌ Sign out failed:', result.error);
            this.showMessage('Sign out failed: ' + result.error, 'error');
        }
    }

    async loadUserData() {
        if (!this.currentUser) return;
        
        // Update user display name
        const displayName = this.currentUser.displayName || this.currentUser.email;
        const displayNameElement = document.getElementById('userDisplayName');
        if (displayNameElement) {
            displayNameElement.textContent = displayName;
        }
        
        // Load user reports
        await this.loadUserReports();
    }

    async loadUserReports() {
        console.log('📋 Loading user reports...');
        if (!this.currentUser) {
            console.log('❌ No current user, cannot load reports');
            return;
        }
        
        const reportsList = document.getElementById('reportsList');
        const loadingState = document.getElementById('reportsLoading');
        const noReports = document.getElementById('noReports');
        
        console.log('📋 Dashboard elements found:', {
            reportsList: !!reportsList,
            loadingState: !!loadingState,
            noReports: !!noReports
        });
        
        if (loadingState) loadingState.style.display = 'block';
        if (reportsList) reportsList.innerHTML = '';
        if (noReports) noReports.style.display = 'none';
        
        console.log('📋 Fetching reports from Firebase...');
        const result = await this.reportService.getUserReports(this.currentUser.uid);
        console.log('📋 Reports fetch result:', result);
        
        if (loadingState) loadingState.style.display = 'none';
        
        if (result.success && result.reports.length > 0) {
            console.log(`📋 Found ${result.reports.length} reports, rendering...`);
            this.renderReports(result.reports);
        } else {
            console.log('📋 No reports found, showing empty state');
            if (noReports) noReports.style.display = 'block';
        }
    }

    renderReports(reports) {
        console.log('📋 Rendering reports:', reports.length);
        const reportsList = document.getElementById('reportsList');
        if (!reportsList) {
            console.log('❌ reportsList element not found');
            return;
        }
        
        console.log('📋 Creating HTML for reports...');
        reportsList.innerHTML = reports.map(report => {
            // Debug: Log the full report object for the first few reports
            if (reports.indexOf(report) < 3) {
                console.log('🔍 Full report object:', report);
                console.log('🔍 Report keys:', Object.keys(report));
            }
            
            // Get the AI method from the report data
            const aiMethod = report.method || 'two_stage_optimized'; // Default fallback
            console.log('🔍 Report method:', report.method, 'aiMethod:', aiMethod);
            const methodDisplayName = this.getMethodDisplayName(aiMethod);
            console.log('🔍 Method display name:', methodDisplayName);
            
            return `
            <div class="report-item" data-report-id="${report.id}">
                <div class="report-header">
                    <div>
                        <div class="report-title-container">
                            <h3 class="report-title" id="title-${report.id}">${report.title}</h3>
                            <button class="edit-title-btn" onclick="authDashboardManager.editReportTitle('${report.id}')" title="Edit title">
                                ✏️
                            </button>
                        </div>
                    </div>
                </div>
                <div class="report-meta">
                    <span class="report-tag method-tag">${methodDisplayName}</span>
                    <span class="report-tag model-tag">${report.aiModel}</span>
                </div>
                <div class="report-actions">
                    <button class="report-btn report-btn-view" onclick="authDashboardManager.viewReport('${report.id}')">
                        View Report
                    </button>
                    <button class="report-btn report-btn-delete" onclick="authDashboardManager.deleteReport('${report.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `;
        }).join('');
        
        console.log('📋 Reports HTML rendered successfully');
        console.log('📋 reportsList innerHTML length:', reportsList.innerHTML.length);
    }

    async saveCurrentReport(reportData) {
        console.log('💾 saveCurrentReport called with:', reportData.title);
        console.log('Current user:', this.currentUser);
        
        if (!this.currentUser) {
            console.log('❌ No current user, cannot save report');
            this.showMessage('Please sign in to save reports', 'error');
            return false;
        }
        
        console.log('💾 Saving report to Firebase...');
        console.log('💾 Report data being saved:', JSON.stringify(reportData, null, 2));
        console.log('💾 About to call reportService.saveReport with userId:', this.currentUser.uid);
        console.log('💾 reportService available:', !!this.reportService);
        const result = await this.reportService.saveReport(this.currentUser.uid, reportData);
        console.log('💾 Save result:', result);
        
        if (result.success) {
            console.log('✅ Report saved successfully!');
            this.showMessage('Report saved successfully!', 'success');
            await this.loadUserReports(); // Refresh the reports list
            return true;
        } else {
            console.log('❌ Failed to save report:', result.error);
            this.showMessage('Failed to save report: ' + result.error, 'error');
            return false;
        }
    }

    async viewReport(reportId) {
        console.log('Viewing report:', reportId);
        
        try {
            // Show loading state
            this.showMessage('Loading report...', 'info');
            
            // Fetch the report data from Firebase
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            const reportDoc = await getDoc(doc(this.db, 'reports', reportId));
            
            if (reportDoc.exists()) {
                const reportData = reportDoc.data();
                console.log('Report data loaded:', reportData);
                
                // Display the report
                this.displayReport(reportData);
            } else {
                this.showMessage('Report not found', 'error');
            }
        } catch (error) {
            console.error('Error loading report:', error);
            this.showMessage('Failed to load report: ' + error.message, 'error');
        }
    }
    
    displayReport(reportData) {
        // Hide dashboard and show report
        const dashboard = document.getElementById('userDashboard');
        const mainForm = document.getElementById('discoveryForm');
        
        if (dashboard) dashboard.style.display = 'none';
        if (mainForm) mainForm.style.display = 'none';
        
        // Create report display container
        let reportContainer = document.getElementById('reportDisplay');
        if (!reportContainer) {
            reportContainer = document.createElement('div');
            reportContainer.id = 'reportDisplay';
            reportContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: white;
                z-index: 1000;
                overflow-y: auto;
                padding: 20px;
            `;
            document.body.appendChild(reportContainer);
        }
        
        // Create report content
        reportContainer.innerHTML = `
            <div style="max-width: 1200px; margin: 0 auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0;">
                    <div>
                        <h1 style="margin: 0; color: #333; font-size: 28px;">${reportData.title}</h1>
                        <p style="margin: 5px 0 0 0; color: #666; font-size: 16px;">
                            Generated: ${new Date(reportData.generatedAt.seconds * 1000).toLocaleDateString()}
                        </p>
                        <div style="margin-top: 10px;">
                            <span style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-right: 8px;">
                                ${reportData.aiModel || 'gemini-1.5-flash'}
                            </span>
                            <span style="background: #f5f5f5; color: #666; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                                ${reportData.version || 'v1.0'}
                            </span>
                        </div>
                    </div>
                    <button onclick="authDashboardManager.closeReport()" style="
                        background: #667eea;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 16px;
                    ">← Back to Dashboard</button>
                </div>
                
                <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    ${this.formatReportContent(reportData.analysisResults)}
                </div>
            </div>
        `;
        
        reportContainer.style.display = 'block';
        console.log('Report displayed successfully');
    }
    
    formatReportContent(analysisResults) {
        if (!analysisResults) {
            return '<p>Report content not available.</p>';
        }
        
        // Check if we have the new data structure or old structure
        let content = '';
        if (analysisResults.rawResponse) {
            // Old structure
            content = analysisResults.rawResponse;
        } else if (analysisResults.operatorArchetype) {
            // New structure - generate content from the structured data
            content = this.generateReportContentFromStructuredData(analysisResults);
        } else {
            return '<p>Report content not available.</p>';
        }
        
        // Convert markdown-style formatting to HTML
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
        content = content.replace(/\n/g, '<br>');
        
        // Convert headers
        content = content.replace(/^### (.*$)/gm, '<h3 style="color: #667eea; margin-top: 30px; margin-bottom: 15px;">$1</h3>');
        content = content.replace(/^## (.*$)/gm, '<h2 style="color: #333; margin-top: 40px; margin-bottom: 20px; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">$1</h2>');
        content = content.replace(/^# (.*$)/gm, '<h1 style="color: #333; margin-top: 50px; margin-bottom: 25px;">$1</h1>');
        
        return content;
    }
    
    generateReportContentFromStructuredData(analysisResults) {
        let content = '<div class="structured-report">';
        
        // Analysis Confidence
        if (analysisResults.confidenceScores) {
            content += '<h2>Analysis Confidence</h2>';
            content += `<p><strong>Overall:</strong> ${analysisResults.confidenceScores.overall || 'N/A'}% confident</p>`;
            content += `<p><strong>Archetype:</strong> ${analysisResults.confidenceScores.archetype || 'N/A'}% | <strong>Industry:</strong> ${analysisResults.confidenceScores.industry || 'N/A'}% | <strong>Data Quality:</strong> ${analysisResults.confidenceScores.dataQuality || 'N/A'}%</p>`;
        }
        
        // Key Strengths
        if (analysisResults.operatorArchetype) {
            content += '<h2>Key Strengths</h2>';
            content += `<p>${analysisResults.operatorArchetype.name || 'N/A'} archetype with ${analysisResults.operatorArchetype.score || 'N/A'}/5.0 composite score</p>`;
        }
        
        // AI Recommendations
        if (analysisResults.aiInsights) {
            content += '<h2>AI Recommendations</h2>';
            content += `<p>${analysisResults.aiInsights}</p>`;
        }
        
        // Multi-Framework Analysis Overview
        if (analysisResults.acquisitionThesis) {
            content += '<h2>Multi-Framework Analysis Overview</h2>';
            content += `<p>${analysisResults.acquisitionThesis}</p>`;
        }
        
        // Your Personalized Buybox
        if (analysisResults.personalizedBuybox) {
            content += '<h2>Your Personalized Buybox</h2>';
            content += '<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">';
            content += '<tr style="background: #f8f9fa;"><th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Criterion</th><th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Your Target Profile</th><th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Rationale</th></tr>';
            
            Object.entries(analysisResults.personalizedBuybox).forEach(([key, value]) => {
                content += '<tr>';
                content += `<td style="padding: 12px; border: 1px solid #ddd; font-weight: 600;">${key.replace(/_/g, ' ').toUpperCase()}</td>`;
                content += `<td style="padding: 12px; border: 1px solid #ddd;">${value.target || 'N/A'}</td>`;
                content += `<td style="padding: 12px; border: 1px solid #ddd;">${value.rationale || 'N/A'}</td>`;
                content += '</tr>';
            });
            content += '</table>';
        }
        
        // Target Industries
        if (analysisResults.targetIndustries && analysisResults.targetIndustries.length > 0) {
            content += '<h2>Target Industries</h2>';
            content += '<ul>';
            analysisResults.targetIndustries.forEach(industry => {
                content += `<li><strong>${industry.name}</strong> (${industry.matchPercentage || 'N/A'}% match) - ${industry.rationale || 'N/A'}</li>`;
            });
            content += '</ul>';
        }
        
        // Financial Analysis
        if (analysisResults.financialAnalysis) {
            content += '<h2>Financial Analysis</h2>';
            content += `<p><strong>Leverage Thesis:</strong> ${analysisResults.leverageThesis || 'N/A'}</p>`;
            if (analysisResults.financialAnalysis.revenueRange) {
                content += `<p><strong>Revenue Range:</strong> ${analysisResults.financialAnalysis.revenueRange}</p>`;
            }
            if (analysisResults.financialAnalysis.ebitdaMargin) {
                content += `<p><strong>EBITDA Margin:</strong> ${analysisResults.financialAnalysis.ebitdaMargin}</p>`;
            }
        }
        
        content += '</div>';
        return content;
    }
    
    closeReport() {
        const reportContainer = document.getElementById('reportDisplay');
        const dashboard = document.getElementById('userDashboard');
        
        if (reportContainer) {
            reportContainer.style.display = 'none';
        }
        
        if (dashboard) {
            dashboard.style.display = 'block';
        }
        
        console.log('Report closed, returned to dashboard');
    }

    async deleteReport(reportId) {
        if (confirm('Are you sure you want to delete this report?')) {
            try {
                console.log('Deleting report:', reportId);
                
                // Delete from Firebase
                const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
                await deleteDoc(doc(this.db, 'reports', reportId));
                
                this.showMessage('Report deleted successfully', 'success');
                await this.loadUserReports(); // Refresh the list
            } catch (error) {
                console.error('Error deleting report:', error);
                this.showMessage('Failed to delete report: ' + error.message, 'error');
            }
        }
    }

    editReportTitle(reportId) {
        const titleElement = document.getElementById(`title-${reportId}`);
        if (!titleElement) {
            console.error('❌ Title element not found for report:', reportId);
            return;
        }

        const currentTitle = titleElement.textContent;
        const newTitle = prompt('Enter new report title:', currentTitle);
        
        if (newTitle && newTitle.trim() !== '' && newTitle !== currentTitle) {
            this.updateReportTitle(reportId, newTitle.trim());
        }
    }

    async updateReportTitle(reportId, newTitle) {
        try {
            console.log('📝 Updating report title:', reportId, 'to:', newTitle);
            
            // Update in Firebase
            const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            await updateDoc(doc(this.db, 'reports', reportId), {
                title: newTitle
            });
            
            // Update the display immediately
            const titleElement = document.getElementById(`title-${reportId}`);
            if (titleElement) {
                titleElement.textContent = newTitle;
            }
            
            this.showMessage('Report title updated successfully', 'success');
        } catch (error) {
            console.error('❌ Error updating report title:', error);
            this.showMessage('Failed to update report title: ' + error.message, 'error');
        }
    }

    getMethodDisplayName(methodId) {
        const methodNames = {
            'traditional': 'Traditional',
            'single_stage': 'Single-Stage',
            'two_stage_optimized': 'Two-Stage',
            'hybrid_staged': 'Hybrid',
            'progressive_refinement': 'Progressive'
        };
        return methodNames[methodId] || 'Two-Stage';
    }

    showAnalysisForm() {
        // Hide dashboard and show the main analysis form
        const dashboard = document.getElementById('userDashboard');
        const mainForm = document.getElementById('discoveryForm');
        
        if (dashboard) dashboard.style.display = 'none';
        if (mainForm) {
            mainForm.style.display = 'block';
            mainForm.style.visibility = 'visible';
            mainForm.style.height = 'auto';
            mainForm.style.overflow = 'visible';
            mainForm.style.margin = '';
            mainForm.style.padding = '';
            mainForm.style.position = '';
            mainForm.style.left = '';
            console.log('✅ Main form (questionnaire) restored and visible');
            
            // Restore the main container
            const mainContainer = mainForm.closest('main, .main, .container, .content');
            if (mainContainer) {
                mainContainer.style.display = 'block';
                console.log('✅ Main container restored');
            }
            
            // Add back to dashboard button if not already present
            this.addBackToDashboardButton();
        }
        
        console.log('✅ Analysis form shown, dashboard hidden');
    }

    addBackToDashboardButton() {
        // Check if button already exists
        if (document.getElementById('backToDashboardBtn')) {
            return;
        }
        
        // Find the main form container
        const mainForm = document.getElementById('discoveryForm');
        if (!mainForm) return;
        
        // Create back to dashboard button
        const backButton = document.createElement('div');
        backButton.id = 'backToDashboardBtn';
        backButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        
        backButton.innerHTML = '← Back to Dashboard';
        backButton.onclick = (e) => {
            e.preventDefault();
            console.log('🔄 Back to dashboard button clicked');
            this.showDashboard();
        };
        
        // Add hover effect
        backButton.onmouseenter = () => {
            backButton.style.transform = 'translateY(-2px)';
            backButton.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
        };
        backButton.onmouseleave = () => {
            backButton.style.transform = 'translateY(0)';
            backButton.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
        };
        
        // Add to page
        document.body.appendChild(backButton);
        console.log('✅ Back to dashboard button added');
    }

    showLoading(show) {
        const loading = document.getElementById('authLoading');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (loading) loading.style.display = show ? 'block' : 'none';
        if (loginForm) loginForm.style.display = show ? 'none' : 'block';
        if (registerForm) registerForm.style.display = show ? 'none' : 'block';
    }

    showMessage(message, type) {
        const messageEl = document.getElementById('authMessage');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `auth-message ${type}`;
            messageEl.style.display = 'block';
            
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 5000);
        }
    }

    showFirebaseSetupError() {
        // Show a helpful error message about Firebase setup
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.innerHTML = `
                <div class="auth-modal-content">
                    <div class="auth-modal-header">
                        <h2>🔧 Firebase Setup Required</h2>
                    </div>
                    <div class="auth-modal-body">
                        <div class="auth-message error">
                            <h3>Authentication not configured yet</h3>
                            <p>To enable user accounts and report saving, you need to set up Firebase:</p>
                            <ol style="text-align: left; margin: 20px 0;">
                                <li>Go to <a href="https://console.firebase.google.com/" target="_blank">Firebase Console</a></li>
                                <li>Create a new project or select existing one</li>
                                <li>Enable Authentication (Email/Password)</li>
                                <li>Enable Firestore Database</li>
                                <li>Get your config and update the code</li>
                            </ol>
                            <p><strong>For now, you can use the app without authentication.</strong></p>
                            <button onclick="window.location.reload()" class="btn btn-primary" style="margin-top: 20px;">
                                Continue Without Authentication
                            </button>
                        </div>
                    </div>
                </div>
            `;
            authModal.style.display = 'flex';
        }
    }

    // Demo mode for testing without Firebase
    enableDemoMode() {
        console.log('🎭 Enabling demo mode - no authentication required');
        
        // Hide auth modal and show main form
        const authModal = document.getElementById('authModal');
        const mainForm = document.getElementById('discoveryForm');
        
        if (authModal) authModal.style.display = 'none';
        if (mainForm) mainForm.style.display = 'block';
        
        // Show a demo notice
        const notice = document.createElement('div');
        notice.innerHTML = `
            <div style="background: #e6f3ff; border: 1px solid #0066cc; border-radius: 8px; padding: 15px; margin: 20px; text-align: center;">
                <strong>🎭 Demo Mode:</strong> Authentication is not configured. Reports will not be saved to your account.
                <br><small>To enable full features, set up Firebase authentication.</small>
            </div>
        `;
        
        const form = document.getElementById('discoveryForm');
        if (form) {
            form.insertBefore(notice, form.firstChild);
        }
    }
}

// Initialize the auth dashboard manager
window.authDashboardManager = new AuthDashboardManager();
