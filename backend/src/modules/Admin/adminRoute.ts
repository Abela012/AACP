import express from "express";
import { requireAdmin } from "../../middlewares/auth.middleware";
import {
  getDashboardStats,
  getEfficiencyPulse,
  calculateTrustScore,
  getApplicantMetrics,
  getProfitabilityMetrics,
  getChartData,
  getAllUsers,
  getUserById,
  updateUserRole,
  banUser,
  getReports,
  resolveReport,
  createNews,
  getWalletRequests,
  approveWalletRequest,
  rejectWalletRequest,
  getAdminSettings,
  patchAdminSettings,
  getAdminNotifications,
} from "./adminController";

import {
  getDisputes,
  resolveDispute,
  escalateDispute,
} from "./disputeController";

const router = express.Router();

/**
 * Admin Routes
 * Base path: /api/v1/admin
 * All routes require 'admin' or 'super_admin' role
 */

// Apply admin check to all routes
router.use(requireAdmin);

router.get("/settings", getAdminSettings);
router.patch("/settings", patchAdminSettings);
router.get("/notifications", getAdminNotifications);

/**
 * @swagger
 * /api/v1/admin/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Returns aggregated metrics for the admin dashboard (total users, suspended users, verified users, etc.)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: integer
 *                         byRole:
 *                           type: array
 *                           items:
 *                             type: object
 *                         recentUsers:
 *                           type: integer
 *                         verifiedUsers:
 *                           type: integer
 *                         suspendedUsers:
 *                           type: integer
 *                         pendingCoinRequests:
 *                           type: integer
 *       403:
 *         description: Forbidden
 */
router.get("/stats", getDashboardStats);

/**
 * Get efficiency pulse metrics (verification rate, response time, actions logged)
 */
router.get("/analytics/efficiency-pulse", getEfficiencyPulse);

/**
 * Get applicant reach and engagement metrics for "Reach vs Engagement" graph
 */
router.get("/analytics/applicants/metrics", getApplicantMetrics);

/**
 * Get profitability metrics for "Profitability Trend" graph
 */
router.get("/analytics/applicants/profitability", getProfitabilityMetrics);

/**
 * Calculate trust score for a specific user
 */
router.get("/analytics/trust-score/:userId", calculateTrustScore);

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieves a paginated list of users with optional search filtering by username, email, or name.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         users:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/User'
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         pages:
 *                           type: integer
 */
router.get("/users", getAllUsers);

/**
 * @swagger
 * /api/v1/admin/users/{userId}:
 *   get:
 *     summary: Get user details
 *     description: Retrieves details of a specific user by ID.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get("/users/:userId", getUserById);

/**
 * @swagger
 * /api/v1/admin/users/{userId}/role:
 *   put:
 *     summary: Update user role
 *     description: Changes a user's role (e.g., from advertiser to business_owner). Creates an audit log.
 *     tags: [Admin]
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
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [business_owner, advertiser, admin, super_admin]
 *     responses:
 *       200:
 *         description: User role updated
 *       400:
 *         description: Invalid role
 */
router.put("/users/:userId/role", updateUserRole);

/**
 * @swagger
 * /api/v1/admin/users/{userId}/status:
 *   put:
 *     summary: Update user status (Ban/Suspend)
 *     description: Changes a user's status to restrict their access. Creates an audit log.
 *     tags: [Admin]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, banned, suspended]
 *     responses:
 *       200:
 *         description: User status updated
 */
router.put("/users/:userId/status", banUser);

// Moderation
router.get("/reports", getReports);
router.put("/reports/:reportId", resolveReport);

/**
 * @swagger
 * /api/v1/admin/disputes:
 *   get:
 *     summary: Get a list of disputes
 *     description: Retrieves disputes with optional filtering for status, priority, and category.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Disputes retrieved
 */
router.get("/disputes", getDisputes);

/**
 * @swagger
 * /api/v1/admin/disputes/{disputeId}/resolve:
 *   put:
 *     summary: Resolve a dispute
 *     description: Marks a dispute as resolved and records the resolution reason. Creates an audit log.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: disputeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The custom readable ID (e.g., DISP-1234)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "User refunded"
 *     responses:
 *       200:
 *         description: Dispute resolved
 *       404:
 *         description: Dispute not found
 */
router.put("/disputes/:disputeId/resolve", resolveDispute);

/**
 * @swagger
 * /api/v1/admin/disputes/{disputeId}/escalate:
 *   put:
 *     summary: Escalate a dispute
 *     description: Marks a dispute as ESCALATED and HIGH priority. Used when admin cannot resolve immediately.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: disputeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dispute escalated
 *       404:
 *         description: Dispute not found
 */
router.put("/disputes/:disputeId/escalate", escalateDispute);

/**
 * @swagger
 * /api/v1/admin/wallet/requests:
 *   get:
 *     summary: Get wallet coin requests
 *     description: Retrieves pending or processed coin purchase requests submitted by users.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Wallet requests retrieved
 */
router.get("/wallet/requests", getWalletRequests);

/**
 * @swagger
 * /api/v1/admin/wallet/requests/{requestId}/approve:
 *   post:
 *     summary: Approve wallet coin request
 *     description: Approves a coin purchase request, automatically crediting the requested coins to the user's wallet. Action is audited.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID of the request
 *     responses:
 *       200:
 *         description: Request approved and coins credited
 */
router.post("/wallet/requests/:requestId/approve", approveWalletRequest);

/**
 * @swagger
 * /api/v1/admin/wallet/requests/{requestId}/reject:
 *   post:
 *     summary: Reject wallet coin request
 *     description: Rejects a coin purchase request and marks it as failed with a reason. Action is audited.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID of the request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Payment unverified"
 *     responses:
 *       200:
 *         description: Request rejected
 */
router.post("/wallet/requests/:requestId/reject", rejectWalletRequest);

export default router;
