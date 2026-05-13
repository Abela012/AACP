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

/**
 * Super Admin Routes
 * All routes strictly require 'super_admin' role
 */
router.use(requireSuperAdmin);

/**
 * @swagger
 * /api/v1/super-admin/admins:
 *   get:
 *     summary: Get all admins
 *     description: Retrieves a list of users with 'admin' or 'super_admin' roles.
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admins retrieved
 */
router.get('/admins', getAdmins);

/**
 * @swagger
 * /api/v1/super-admin/admins/promote:
 *   post:
 *     summary: Promote a user to admin
 *     description: Promotes an existing user to an administrative role by email.
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, super_admin]
 *                 default: admin
 *     responses:
 *       200:
 *         description: User promoted successfully
 *       404:
 *         description: User not found
 */
router.post('/admins/promote', promoteExistingUserToAdmin);

/**
 * @swagger
 * /api/v1/super-admin/admins/create:
 *   post:
 *     summary: Create an admin user
 *     description: Directly provisions a new administrator account (both in Clerk and local DB).
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin account created successfully
 *       400:
 *         description: Invalid input or password too short
 *       409:
 *         description: User already exists
 */
router.post('/admins/create', createAdminUser);

/**
 * @swagger
 * /api/v1/super-admin/admins/{userId}:
 *   patch:
 *     summary: Update an admin user
 *     description: Modifies an existing admin's role or status (suspend/ban).
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, super_admin]
 *               status:
 *                 type: string
 *                 enum: [active, banned, suspended]
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *       400:
 *         description: Cannot suspend own account
 */
router.patch('/admins/:userId', updateAdminUser);

/**
 * @swagger
 * /api/v1/super-admin/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     description: Retrieves paginated platform audit logs of critical actions.
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit logs retrieved
 */
router.get('/audit-logs', getAuditLogs);

/**
 * @swagger
 * /api/v1/super-admin/platform-config:
 *   get:
 *     summary: Get platform configuration
 *     description: Retrieves the global system configuration including commission rates and masked secrets.
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform config retrieved
 */
router.get('/platform-config', getPlatformConfig);

/**
 * @swagger
 * /api/v1/super-admin/platform-config:
 *   put:
 *     summary: Update platform configuration
 *     description: Modifies global settings like commission rates and application fees.
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maintenanceMode:
 *                 type: boolean
 *               coinCostPostingAds:
 *                 type: number
 *               coinCostApplicationFee:
 *                 type: number
 *               globalCommissionRate:
 *                 type: number
 *                 description: Percentage (e.g. 0.10 for 10%)
 *     responses:
 *       200:
 *         description: Platform config updated
 */
router.put('/platform-config', updatePlatformConfig);

/**
 * @swagger
 * /api/v1/super-admin/security-summary:
 *   get:
 *     summary: Get security summary
 *     description: Provides a high-level overview of system security posture, pending transactions, and recent critical audit events.
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Security summary retrieved
 */
router.get('/security-summary', getSecuritySummary);

/**
 * @swagger
 * /api/v1/super-admin/notifications:
 *   get:
 *     summary: Get super admin notifications
 *     description: Retrieves recent critical alerts formatted as notifications (escalations, config changes, etc.).
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved
 */
router.get('/notifications', getSuperAdminNotifications);

/**
 * @swagger
 * /api/v1/super-admin/profile:
 *   get:
 *     summary: Get super admin profile
 *     description: Retrieves stats specific to the authenticated super admin account.
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Super admin profile retrieved
 */
router.get('/profile', getSuperAdminProfile);

export default router;
