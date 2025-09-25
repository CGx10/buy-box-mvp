// Admin Manager - Handles admin-specific functionality
class AdminManager {
    constructor() {
        this.isAdmin = false;
        this.adminEmail = 'capitalgainsx10@gmail.com';
        this.init();
    }

    async init() {
        // Wait for auth to be ready
        if (window.authDashboardManager && window.authDashboardManager.currentUser) {
            await this.checkAdminStatus();
        } else {
            // Listen for auth state changes
            document.addEventListener('authStateChanged', async () => {
                await this.checkAdminStatus();
            });
            
            // Also check periodically in case the event doesn't fire
            setTimeout(async () => {
                await this.checkAdminStatus();
            }, 2000);
        }
    }

    async checkAdminStatus() {
        console.log('🔍 Checking admin status...');
        console.log('AuthDashboardManager available:', !!window.authDashboardManager);
        console.log('Current user:', window.authDashboardManager?.currentUser);
        
        if (window.authDashboardManager && window.authDashboardManager.currentUser) {
            const userEmail = window.authDashboardManager.currentUser.email;
            console.log('User email:', userEmail);
            console.log('Admin email:', this.adminEmail);
            
            this.isAdmin = userEmail === this.adminEmail;
            
            if (this.isAdmin) {
                console.log('🔐 Admin access granted for:', userEmail);
                this.addAdminControls();
                this.setupAdminEventListeners();
                
                // Refresh engine selection to show AI Model Selection
                if (window.acquisitionAdvisorApp && window.acquisitionAdvisorApp.refreshEngineSelection) {
                    await window.acquisitionAdvisorApp.refreshEngineSelection();
                }
            } else {
                console.log('👤 Regular user:', userEmail);
                
                // Refresh engine selection to hide AI Model Selection
                if (window.acquisitionAdvisorApp && window.acquisitionAdvisorApp.refreshEngineSelection) {
                    await window.acquisitionAdvisorApp.refreshEngineSelection();
                }
            }
        } else {
            console.log('❌ No authenticated user found');
        }
    }

    addAdminControls() {
        // Add admin button to the header
        const header = document.querySelector('.header');
        if (header && !document.getElementById('adminControls')) {
            const adminControls = document.createElement('div');
            adminControls.id = 'adminControls';
            adminControls.style.cssText = `
                position: absolute;
                top: 20px;
                right: 20px;
                z-index: 1000;
            `;
            
            adminControls.innerHTML = `
                <button id="adminPanelBtn" style="
                    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
                    transition: all 0.3s ease;
                " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    🔐 Admin Panel
                </button>
            `;
            
            header.appendChild(adminControls);
        }

        // Add admin section to dashboard if it exists
        this.addAdminDashboardSection();
        
        // Also try to add admin controls to the main dashboard area
        this.addAdminControlsToDashboard();
    }

    addAdminDashboardSection() {
        const dashboardContainer = document.getElementById('dashboardContainer');
        if (dashboardContainer && !document.getElementById('adminDashboardSection')) {
            const adminSection = document.createElement('div');
            adminSection.id = 'adminDashboardSection';
            adminSection.style.cssText = `
                background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                color: white;
                padding: 20px;
                margin: 20px 0;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(220, 53, 69, 0.2);
            `;
            
            adminSection.innerHTML = `
                <h3 style="margin: 0 0 15px 0; display: flex; align-items: center;">
                    🔐 Admin Controls
                </h3>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button id="viewAllUsersBtn" style="
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: 1px solid rgba(255,255,255,0.3);
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                    ">👥 View All Users</button>
                    <button id="systemStatsBtn" style="
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: 1px solid rgba(255,255,255,0.3);
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                    ">📊 System Stats</button>
                    <button id="manageRolesBtn" style="
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: 1px solid rgba(255,255,255,0.3);
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                    ">🎭 Manage Roles</button>
                    <button id="exportDataBtn" style="
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: 1px solid rgba(255,255,255,0.3);
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                    ">📤 Export Data</button>
                </div>
            `;
            
            dashboardContainer.appendChild(adminSection);
        }
    }

    addAdminControlsToDashboard() {
        // Look for the main dashboard content area
        const dashboardContent = document.querySelector('.dashboard-content') || 
                                 document.querySelector('.main-content') ||
                                 document.querySelector('[class*="dashboard"]');
        
        if (dashboardContent && !document.getElementById('adminDashboardSection')) {
            console.log('🔐 Adding admin section to dashboard');
            const adminSection = document.createElement('div');
            adminSection.id = 'adminDashboardSection';
            adminSection.style.cssText = `
                background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                color: white;
                padding: 20px;
                margin: 20px 0;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(220, 53, 69, 0.2);
            `;
            
            adminSection.innerHTML = `
                <h3 style="margin: 0 0 15px 0; display: flex; align-items: center;">
                    🔐 Admin Controls
                </h3>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button id="viewAllUsersBtn" style="
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: 1px solid rgba(255,255,255,0.3);
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                    ">👥 View All Users</button>
                    <button id="systemStatsBtn" style="
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: 1px solid rgba(255,255,255,0.3);
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                    ">📊 System Stats</button>
                    <button id="manageRolesBtn" style="
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: 1px solid rgba(255,255,255,0.3);
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                    ">🎭 Manage Roles</button>
                    <button id="exportDataBtn" style="
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: 1px solid rgba(255,255,255,0.3);
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                    ">📤 Export Data</button>
                </div>
            `;
            
            // Insert at the top of the dashboard content
            dashboardContent.insertBefore(adminSection, dashboardContent.firstChild);
        }
    }

    setupAdminEventListeners() {
        // Admin panel button
        const adminPanelBtn = document.getElementById('adminPanelBtn');
        if (adminPanelBtn) {
            adminPanelBtn.addEventListener('click', () => {
                this.openAdminPanel();
            });
        }

        // Dashboard admin buttons
        const viewAllUsersBtn = document.getElementById('viewAllUsersBtn');
        if (viewAllUsersBtn) {
            viewAllUsersBtn.addEventListener('click', () => {
                this.showAllUsers();
            });
        }

        const systemStatsBtn = document.getElementById('systemStatsBtn');
        if (systemStatsBtn) {
            systemStatsBtn.addEventListener('click', () => {
                this.showSystemStats();
            });
        }

        const manageRolesBtn = document.getElementById('manageRolesBtn');
        if (manageRolesBtn) {
            manageRolesBtn.addEventListener('click', () => {
                this.showRoleManagement();
            });
        }

        const exportDataBtn = document.getElementById('exportDataBtn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => {
                this.exportSystemData();
            });
        }
    }

    openAdminPanel() {
        // Open admin panel in new window
        const adminWindow = window.open(
            '/admin-panel.html',
            'adminPanel',
            'width=1200,height=800,scrollbars=yes,resizable=yes'
        );
        
        if (!adminWindow) {
            alert('Please allow popups to open the admin panel');
        }
    }

    async showAllUsers() {
        try {
            // This would call your backend API
            console.log('Fetching all users...');
            
            // For now, show a mock dialog
            const userData = [
                { email: 'capitalgainsx10@gmail.com', role: 'admin', reports: 25, lastLogin: 'Today' },
                { email: 'user1@example.com', role: 'premium', reports: 15, lastLogin: '2 days ago' },
                { email: 'user2@example.com', role: 'basic', reports: 3, lastLogin: '1 week ago' }
            ];
            
            this.showModal('All Users', this.createUserTableHTML(userData));
        } catch (error) {
            console.error('Error fetching users:', error);
            this.showModal('Error', 'Failed to fetch users');
        }
    }

    async showSystemStats() {
        try {
            console.log('Fetching system statistics...');
            
            // Mock system stats
            const stats = {
                totalUsers: 150,
                activeUsers: 45,
                totalReports: 1250,
                reportsThisMonth: 89,
                systemUptime: '99.9%',
                averageResponseTime: '1.2s'
            };
            
            this.showModal('System Statistics', this.createStatsHTML(stats));
        } catch (error) {
            console.error('Error fetching stats:', error);
            this.showModal('Error', 'Failed to fetch system statistics');
        }
    }

    async showRoleManagement() {
        try {
            console.log('Opening role management...');
            
            const roleData = [
                { role: 'admin', count: 1, permissions: 'All permissions' },
                { role: 'premium', count: 25, permissions: 'Enhanced features' },
                { role: 'basic', count: 124, permissions: 'Basic features' }
            ];
            
            this.showModal('Role Management', this.createRoleManagementHTML(roleData));
        } catch (error) {
            console.error('Error in role management:', error);
            this.showModal('Error', 'Failed to load role management');
        }
    }

    async exportSystemData() {
        try {
            console.log('Exporting system data...');
            
            // Create a mock export
            const exportData = {
                timestamp: new Date().toISOString(),
                users: 'user_data.csv',
                reports: 'reports_data.csv',
                analytics: 'analytics_data.json'
            };
            
            this.showModal('Data Export', this.createExportHTML(exportData));
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showModal('Error', 'Failed to export data');
        }
    }

    createUserTableHTML(users) {
        return `
            <div style="max-height: 400px; overflow-y: auto;">
                <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Email</th>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Role</th>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Reports</th>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Last Login</th>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">${user.email}</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">
                                    <span style="
                                        padding: 4px 8px; 
                                        border-radius: 4px; 
                                        font-size: 12px; 
                                        font-weight: bold;
                                        background: ${user.role === 'admin' ? '#dc3545' : user.role === 'premium' ? '#28a745' : '#6c757d'};
                                        color: white;
                                    ">${user.role.toUpperCase()}</span>
                                </td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${user.reports}</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${user.lastLogin}</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">
                                    <button style="
                                        background: #007bff; 
                                        color: white; 
                                        border: none; 
                                        padding: 4px 8px; 
                                        border-radius: 4px; 
                                        cursor: pointer;
                                        font-size: 12px;
                                    ">Manage</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    createStatsHTML(stats) {
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                    <h4 style="margin: 0 0 10px 0; color: #333;">Total Users</h4>
                    <div style="font-size: 24px; font-weight: bold; color: #007bff;">${stats.totalUsers}</div>
                </div>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                    <h4 style="margin: 0 0 10px 0; color: #333;">Active Users</h4>
                    <div style="font-size: 24px; font-weight: bold; color: #28a745;">${stats.activeUsers}</div>
                </div>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                    <h4 style="margin: 0 0 10px 0; color: #333;">Total Reports</h4>
                    <div style="font-size: 24px; font-weight: bold; color: #ffc107;">${stats.totalReports}</div>
                </div>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                    <h4 style="margin: 0 0 10px 0; color: #333;">This Month</h4>
                    <div style="font-size: 24px; font-weight: bold; color: #17a2b8;">${stats.reportsThisMonth}</div>
                </div>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                    <h4 style="margin: 0 0 10px 0; color: #333;">Uptime</h4>
                    <div style="font-size: 24px; font-weight: bold; color: #28a745;">${stats.systemUptime}</div>
                </div>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                    <h4 style="margin: 0 0 10px 0; color: #333;">Avg Response</h4>
                    <div style="font-size: 24px; font-weight: bold; color: #6f42c1;">${stats.averageResponseTime}</div>
                </div>
            </div>
        `;
    }

    createRoleManagementHTML(roles) {
        return `
            <div style="max-height: 400px; overflow-y: auto;">
                ${roles.map(role => `
                    <div style="
                        background: #f8f9fa; 
                        padding: 15px; 
                        margin: 10px 0; 
                        border-radius: 8px; 
                        border-left: 4px solid ${role.role === 'admin' ? '#dc3545' : role.role === 'premium' ? '#28a745' : '#6c757d'};
                    ">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h4 style="margin: 0 0 5px 0; text-transform: uppercase;">${role.role}</h4>
                                <p style="margin: 0; color: #666;">${role.permissions}</p>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 24px; font-weight: bold; color: #333;">${role.count}</div>
                                <div style="font-size: 12px; color: #666;">users</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    createExportHTML(exportData) {
        return `
            <div style="text-align: center;">
                <h4>Export Ready</h4>
                <p>Data exported at: ${new Date(exportData.timestamp).toLocaleString()}</p>
                <div style="margin: 20px 0;">
                    <button style="
                        background: #28a745; 
                        color: white; 
                        border: none; 
                        padding: 10px 20px; 
                        border-radius: 6px; 
                        cursor: pointer;
                        margin: 5px;
                    ">Download Users CSV</button>
                    <button style="
                        background: #17a2b8; 
                        color: white; 
                        border: none; 
                        padding: 10px 20px; 
                        border-radius: 6px; 
                        cursor: pointer;
                        margin: 5px;
                    ">Download Reports CSV</button>
                    <button style="
                        background: #6f42c1; 
                        color: white; 
                        border: none; 
                        padding: 10px 20px; 
                        border-radius: 6px; 
                        cursor: pointer;
                        margin: 5px;
                    ">Download Analytics JSON</button>
                </div>
            </div>
        `;
    }

    showModal(title, content) {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        
        // Create modal content
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 30px;
            max-width: 80%;
            max-height: 80%;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        `;
        
        modal.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #333;">${title}</h2>
                <button id="closeModal" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                ">×</button>
            </div>
            <div>${content}</div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Close modal functionality
        const closeModal = () => {
            document.body.removeChild(overlay);
        };
        
        document.getElementById('closeModal').addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
    }
}

// Initialize admin manager
window.adminManager = new AdminManager();

// Add manual trigger for testing
window.triggerAdminCheck = () => {
    console.log('🔧 Manually triggering admin check...');
    window.adminManager.checkAdminStatus();
};
