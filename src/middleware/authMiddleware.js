// Authentication and Permission Middleware
const PermissionService = require('../services/permissionService.js');

class AuthMiddleware {
  constructor() {
    this.permissionService = new PermissionService();
  }

  // Middleware to check authentication
  requireAuth() {
    return async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({
            success: false,
            error: 'Authentication required'
          });
        }

        const token = authHeader.split(' ')[1];
        // Verify Firebase token here
        // const decodedToken = await admin.auth().verifyIdToken(token);
        // req.user = decodedToken;
        
        next();
      } catch (error) {
        return res.status(401).json({
          success: false,
          error: 'Invalid authentication token'
        });
      }
    };
  }

  // Middleware to check specific permission
  requirePermission(permission) {
    return async (req, res, next) => {
      try {
        if (!req.user || !req.user.uid) {
          return res.status(401).json({
            success: false,
            error: 'Authentication required'
          });
        }

        const hasPermission = await this.permissionService.hasPermission(req.user.uid, permission);
        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            error: 'Insufficient permissions'
          });
        }

        next();
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: 'Permission check failed'
        });
      }
    };
  }

  // Middleware to check if user can perform action (with limits)
  requireAction(action) {
    return async (req, res, next) => {
      try {
        if (!req.user || !req.user.uid) {
          return res.status(401).json({
            success: false,
            error: 'Authentication required'
          });
        }

        const canPerform = await this.permissionService.canPerformAction(req.user.uid, action);
        if (!canPerform.canPerform) {
          return res.status(403).json({
            success: false,
            error: canPerform.reason
          });
        }

        next();
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: 'Action permission check failed'
        });
      }
    };
  }

  // Middleware to check role
  requireRole(role) {
    return async (req, res, next) => {
      try {
        if (!req.user || !req.user.uid) {
          return res.status(401).json({
            success: false,
            error: 'Authentication required'
          });
        }

        const permissions = await this.permissionService.getUserPermissions(req.user.uid);
        if (!permissions.success || permissions.permissions.role !== role) {
          return res.status(403).json({
            success: false,
            error: `Role '${role}' required`
          });
        }

        next();
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: 'Role check failed'
        });
      }
    };
  }
}

module.exports = AuthMiddleware;
