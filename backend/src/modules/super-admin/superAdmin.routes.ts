import express from 'express';
import { requireSuperAdmin } from '../../middlewares/auth.middleware';
import {
  getAdmins,
  getAuditLogs,
  getPlatformConfig,
  updatePlatformConfig,
  getSecuritySummary,
  promoteExistingUserToAdmin,
  createAdminUser,
  updateAdminUser,
  getSuperAdminNotifications,
  getSuperAdminProfile,
} from './superAdmin.controller';

const router = express.Router();

router.use(requireSuperAdmin);

router.get('/admins', getAdmins);
router.post('/admins/promote', promoteExistingUserToAdmin);
router.post('/admins/create', createAdminUser);
router.patch('/admins/:userId', updateAdminUser);
router.get('/audit-logs', getAuditLogs);
router.get('/platform-config', getPlatformConfig);
router.put('/platform-config', updatePlatformConfig);
router.get('/security-summary', getSecuritySummary);
router.get('/notifications', getSuperAdminNotifications);
router.get('/profile', getSuperAdminProfile);

export default router;

