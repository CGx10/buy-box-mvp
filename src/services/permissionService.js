// Permission Service for Role-Based Access Control
const { doc, getDoc, updateDoc } = require('firebase/firestore');
const { db } = require('./firebaseConfig.js');

class PermissionService {
  constructor() {
    this.USER_ROLES = {
      ADMIN: 'admin',
      PREMIUM: 'premium', 
      BASIC: 'basic'
    };

    this.PERMISSIONS = {
      // Report Management
      CREATE_REPORTS: 'create_reports',
      VIEW_OWN_REPORTS: 'view_own_reports',
      DELETE_OWN_REPORTS: 'delete_own_reports',
      EXPORT_REPORTS: 'export_reports',
      
      // AI Engine Access
      USE_GEMINI: 'use_gemini',
      USE_OPENAI: 'use_openai',
      USE_CLAUDE: 'use_claude',
      USE_HYBRID: 'use_hybrid',
      
      // Advanced Features
      COMPARISON_MODE: 'comparison_mode',
      BULK_ANALYSIS: 'bulk_analysis',
      API_ACCESS: 'api_access',
      
      // Admin Features
      VIEW_ALL_REPORTS: 'view_all_reports',
      MANAGE_USERS: 'manage_users',
      SYSTEM_SETTINGS: 'system_settings'
    };

    // Role-based permission mapping
    this.ROLE_PERMISSIONS = {
      [this.USER_ROLES.ADMIN]: [
        this.PERMISSIONS.CREATE_REPORTS,
        this.PERMISSIONS.VIEW_OWN_REPORTS,
        this.PERMISSIONS.DELETE_OWN_REPORTS,
        this.PERMISSIONS.EXPORT_REPORTS,
        this.PERMISSIONS.USE_GEMINI,
        this.PERMISSIONS.USE_OPENAI,
        this.PERMISSIONS.USE_CLAUDE,
        this.PERMISSIONS.USE_HYBRID,
        this.PERMISSIONS.COMPARISON_MODE,
        this.PERMISSIONS.BULK_ANALYSIS,
        this.PERMISSIONS.API_ACCESS,
        this.PERMISSIONS.VIEW_ALL_REPORTS,
        this.PERMISSIONS.MANAGE_USERS,
        this.PERMISSIONS.SYSTEM_SETTINGS
      ],
      [this.USER_ROLES.PREMIUM]: [
        this.PERMISSIONS.CREATE_REPORTS,
        this.PERMISSIONS.VIEW_OWN_REPORTS,
        this.PERMISSIONS.DELETE_OWN_REPORTS,
        this.PERMISSIONS.EXPORT_REPORTS,
        this.PERMISSIONS.USE_GEMINI,
        this.PERMISSIONS.USE_OPENAI,
        this.PERMISSIONS.USE_CLAUDE,
        this.PERMISSIONS.USE_HYBRID,
        this.PERMISSIONS.COMPARISON_MODE,
        this.PERMISSIONS.BULK_ANALYSIS,
        this.PERMISSIONS.API_ACCESS
      ],
      [this.USER_ROLES.BASIC]: [
        this.PERMISSIONS.CREATE_REPORTS,
        this.PERMISSIONS.VIEW_OWN_REPORTS,
        this.PERMISSIONS.DELETE_OWN_REPORTS,
        this.PERMISSIONS.USE_GEMINI
      ]
    };

    // Usage limits by role
    this.ROLE_LIMITS = {
      [this.USER_ROLES.ADMIN]: {
        monthlyReports: -1, // unlimited
        dailyReports: -1,
        maxReportHistory: -1,
        apiCallsPerMonth: -1
      },
      [this.USER_ROLES.PREMIUM]: {
        monthlyReports: 100,
        dailyReports: 10,
        maxReportHistory: 1000,
        apiCallsPerMonth: 1000
      },
      [this.USER_ROLES.BASIC]: {
        monthlyReports: 5,
        dailyReports: 2,
        maxReportHistory: 50,
        apiCallsPerMonth: 50
      }
    };
  }

  // Get user permissions
  async getUserPermissions(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        return { success: false, error: 'User not found' };
      }

      const userData = userDoc.data();
      
      // Check if this is the admin email
      const isAdminEmail = userData.email === 'capitalgainsx10@gmail.com';
      
      // Set role - admin email gets admin role, otherwise use stored role or default to basic
      const role = isAdminEmail ? this.USER_ROLES.ADMIN : (userData.role || this.USER_ROLES.BASIC);
      
      // If this is admin email but not stored as admin, update the user record
      if (isAdminEmail && userData.role !== this.USER_ROLES.ADMIN) {
        console.log('🔐 Upgrading user to admin:', userData.email);
        await this.upgradeUserRole(userId, this.USER_ROLES.ADMIN);
      }
      
      const permissions = this.ROLE_PERMISSIONS[role] || this.ROLE_PERMISSIONS[this.USER_ROLES.BASIC];
      const limits = this.ROLE_LIMITS[role] || this.ROLE_LIMITS[this.USER_ROLES.BASIC];

      return {
        success: true,
        permissions: {
          role,
          permissions,
          limits,
          usage: userData.usage || {
            reportsThisMonth: 0,
            reportsToday: 0,
            totalReports: 0
          }
        }
      };
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if user has specific permission
  async hasPermission(userId, permission) {
    try {
      const result = await this.getUserPermissions(userId);
      if (!result.success) {
        return false;
      }

      return result.permissions.permissions.includes(permission);
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  // Check if user can perform action (considering limits)
  async canPerformAction(userId, action) {
    try {
      const result = await this.getUserPermissions(userId);
      if (!result.success) {
        return { canPerform: false, reason: 'User not found' };
      }

      const { permissions, limits, usage } = result.permissions;

      // Check permission
      if (!permissions.includes(action)) {
        return { canPerform: false, reason: 'Insufficient permissions' };
      }

      // Check limits for report creation
      if (action === this.PERMISSIONS.CREATE_REPORTS) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Check monthly limit
        if (limits.monthlyReports !== -1 && usage.reportsThisMonth >= limits.monthlyReports) {
          return { canPerform: false, reason: 'Monthly report limit reached' };
        }

        // Check daily limit
        if (limits.dailyReports !== -1 && usage.reportsToday >= limits.dailyReports) {
          return { canPerform: false, reason: 'Daily report limit reached' };
        }
      }

      return { canPerform: true };
    } catch (error) {
      console.error('Error checking action permission:', error);
      return { canPerform: false, reason: 'System error' };
    }
  }

  // Update user usage
  async updateUsage(userId, action) {
    try {
      const userDoc = doc(db, 'users', userId);
      const userData = await getDoc(userDoc);
      
      if (!userData.exists()) {
        return { success: false, error: 'User not found' };
      }

      const currentData = userData.data();
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const usage = currentData.usage || {
        reportsThisMonth: 0,
        reportsToday: 0,
        totalReports: 0,
        lastReportAt: null
      };

      // Reset counters if needed
      if (usage.lastReportAt) {
        const lastReport = usage.lastReportAt.toDate();
        
        // Reset monthly counter
        if (lastReport < startOfMonth) {
          usage.reportsThisMonth = 0;
        }
        
        // Reset daily counter
        if (lastReport < startOfDay) {
          usage.reportsToday = 0;
        }
      }

      // Increment counters
      if (action === this.PERMISSIONS.CREATE_REPORTS) {
        usage.reportsThisMonth += 1;
        usage.reportsToday += 1;
        usage.totalReports += 1;
        usage.lastReportAt = now;
      }

      await updateDoc(userDoc, { usage });

      return { success: true };
    } catch (error) {
      console.error('Error updating usage:', error);
      return { success: false, error: error.message };
    }
  }

  // Upgrade user role
  async upgradeUserRole(userId, newRole, subscriptionData = {}) {
    try {
      const userDoc = doc(db, 'users', userId);
      const userData = await getDoc(userDoc);
      
      if (!userData.exists()) {
        return { success: false, error: 'User not found' };
      }

      const currentData = userData.data();
      const newPermissions = this.ROLE_PERMISSIONS[newRole] || this.ROLE_PERMISSIONS[this.USER_ROLES.BASIC];
      const newLimits = this.ROLE_LIMITS[newRole] || this.ROLE_LIMITS[this.USER_ROLES.BASIC];

      const updateData = {
        role: newRole,
        permissions: newPermissions,
        limits: newLimits,
        updatedAt: new Date()
      };

      // Add subscription data if provided
      if (subscriptionData.plan) {
        updateData.subscription = {
          plan: subscriptionData.plan,
          status: subscriptionData.status || 'active',
          expiresAt: subscriptionData.expiresAt || null,
          features: subscriptionData.features || newPermissions,
          ...subscriptionData
        };
      }

      await updateDoc(userDoc, updateData);

      return { success: true };
    } catch (error) {
      console.error('Error upgrading user role:', error);
      return { success: false, error: error.message };
    }
  }

  // Get available AI engines for user
  async getAvailableEngines(userId) {
    try {
      const result = await this.getUserPermissions(userId);
      if (!result.success) {
        return { success: false, error: result.error };
      }

      const { permissions } = result.permissions;
      const availableEngines = {};

      if (permissions.includes(this.PERMISSIONS.USE_GEMINI)) {
        availableEngines.gemini = { name: 'Google Gemini', enabled: true, available: true };
      }
      if (permissions.includes(this.PERMISSIONS.USE_OPENAI)) {
        availableEngines.openai = { name: 'OpenAI GPT-4', enabled: true, available: true };
      }
      if (permissions.includes(this.PERMISSIONS.USE_CLAUDE)) {
        availableEngines.claude = { name: 'Anthropic Claude 3.5', enabled: true, available: true };
      }
      if (permissions.includes(this.PERMISSIONS.USE_HYBRID)) {
        availableEngines.hybrid = { name: 'Hybrid AI Engine', enabled: true, available: true };
      }

      return { success: true, engines: availableEngines };
    } catch (error) {
      console.error('Error getting available engines:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = PermissionService;
