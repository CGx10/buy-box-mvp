// Protected API Routes with Permission Checks
import express from 'express';
import AuthMiddleware from '../middleware/authMiddleware.js';
import PermissionService from '../services/permissionService.js';

const router = express.Router();
const authMiddleware = new AuthMiddleware();
const permissionService = new PermissionService();

// Apply authentication to all routes
router.use(authMiddleware.requireAuth());

// Get user permissions and limits
router.get('/permissions', async (req, res) => {
  try {
    const permissions = await permissionService.getUserPermissions(req.user.uid);
    res.json(permissions);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get permissions'
    });
  }
});

// Get available AI engines for user
router.get('/engines', async (req, res) => {
  try {
    const engines = await permissionService.getAvailableEngines(req.user.uid);
    res.json(engines);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get available engines'
    });
  }
});

// Check if user can create reports (with limits)
router.get('/can-create-report', authMiddleware.requireAction('create_reports'), async (req, res) => {
  try {
    const canPerform = await permissionService.canPerformAction(req.user.uid, 'create_reports');
    res.json({
      success: true,
      canCreate: canPerform.canPerform,
      reason: canPerform.reason
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check report creation permission'
    });
  }
});

// Update user usage after report creation
router.post('/update-usage', authMiddleware.requireAction('create_reports'), async (req, res) => {
  try {
    const { action } = req.body;
    const result = await permissionService.updateUsage(req.user.uid, action);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update usage'
    });
  }
});

// Admin-only routes
router.get('/admin/users', authMiddleware.requireRole('admin'), async (req, res) => {
  try {
    // Get all users (admin only)
    res.json({
      success: true,
      message: 'Admin user management endpoint'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get users'
    });
  }
});

// Upgrade user role (admin only)
router.post('/admin/upgrade-role', authMiddleware.requireRole('admin'), async (req, res) => {
  try {
    const { userId, newRole, subscriptionData } = req.body;
    const result = await permissionService.upgradeUserRole(userId, newRole, subscriptionData);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to upgrade user role'
    });
  }
});

export default router;
