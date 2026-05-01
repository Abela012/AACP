import express from 'express';
import { requireAuth } from '@clerk/express';
import {
    connectFacebook,
    disconnectFacebook,
    getConnections,
    getProfile,
    getAdAccounts,
    getPages,
    getAdsInsights,
    syncData,
    getAIInsights,
    analyzeEntity,
} from './facebook.controller';

/**
 * Facebook API Routes
 * All routes require Clerk authentication.
 */

const router = express.Router();

// ── Connection Management ────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/facebook/connect:
 *   post:
 *     summary: Connect a Facebook account
 *     description: Exhanges a short-lived user token for a long-lived one, encrypts it, and saves the connection. Starts background sync of pages/ad accounts.
 *     tags: [Facebook]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accessToken
 *             properties:
 *               accessToken:
 *                 type: string
 *                 description: Short-lived access token from Facebook Login
 *     responses:
 *       200:
 *         description: Facebook account connected successfully
 *       400:
 *         description: Missing token
 *       404:
 *         description: User profile not synced
 */
router.post('/connect', requireAuth(), connectFacebook);

/**
 * @swagger
 * /api/v1/facebook/disconnect/{connectionId}:
 *   delete:
 *     summary: Disconnect a Facebook account
 *     description: Soft-deletes a Facebook connection, keeping history but invalidating the token.
 *     tags: [Facebook]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Facebook account disconnected
 *       404:
 *         description: Connection not found
 */
router.delete('/disconnect/:connectionId', requireAuth(), disconnectFacebook);

/**
 * @swagger
 * /api/v1/facebook/connections:
 *   get:
 *     summary: List Facebook connections
 *     description: Retrieves all Facebook connections for the authenticated user (access tokens are not exposed).
 *     tags: [Facebook]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Connections retrieved
 */
router.get('/connections', requireAuth(), getConnections);

// ── Data Access ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/facebook/profile:
 *   get:
 *     summary: Get Facebook profile
 *     description: Fetches the user's Facebook profile details from Graph API using their stored token.
 *     tags: [Facebook]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Facebook profile retrieved
 */
router.get('/profile', requireAuth(), getProfile);

/**
 * @swagger
 * /api/v1/facebook/ad-accounts:
 *   get:
 *     summary: Get Facebook Ad Accounts
 *     description: Retrieves connected ad accounts and updates local cache.
 *     tags: [Facebook]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ad accounts retrieved
 */
router.get('/ad-accounts', requireAuth(), getAdAccounts);

/**
 * @swagger
 * /api/v1/facebook/pages:
 *   get:
 *     summary: Get Facebook Pages
 *     description: Retrieves managed pages and caches their tokens securely.
 *     tags: [Facebook]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pages retrieved
 */
router.get('/pages', requireAuth(), getPages);

/**
 * @swagger
 * /api/v1/facebook/ads/{adAccountId}/insights:
 *   get:
 *     summary: Get Ads Insights
 *     description: Fetches performance insights (impressions, clicks, spend) for a specific ad account. Insights are also cached locally for AI analysis.
 *     tags: [Facebook]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adAccountId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: since
 *         schema:
 *           type: string
 *           format: date
 *         description: "YYYY-MM-DD"
 *       - in: query
 *         name: until
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [account, campaign, adset, ad]
 *           default: campaign
 *       - in: query
 *         name: breakdowns
 *         schema:
 *           type: string
 *         description: "Comma separated breakdowns (e.g., age,gender)"
 *     responses:
 *       200:
 *         description: Insights retrieved successfully
 */
router.get('/ads/:adAccountId/insights', requireAuth(), getAdsInsights);

/**
 * @swagger
 * /api/v1/facebook/sync/{connectionId}:
 *   post:
 *     summary: Trigger manual data sync
 *     description: Forces a full synchronization of ad accounts, pages, and the last 30 days of campaign insights.
 *     tags: [Facebook]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data sync initiated successfully
 */
router.post('/sync/:connectionId', requireAuth(), syncData);

// ── AI Insights ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/facebook/ai/insights/{adAccountId}:
 *   get:
 *     summary: Get AI-generated report
 *     description: Triggers the Gemini AI to analyze raw cached insights for a specific ad account and generate a comprehensive performance report.
 *     tags: [Facebook]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adAccountId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: AI Insights generated successfully
 */
router.get('/ai/insights/:adAccountId', requireAuth(), getAIInsights);

/**
 * @swagger
 * /api/v1/facebook/ai/analyze/{adAccountId}/{level}/{entityId}:
 *   get:
 *     summary: Analyze specific ad entity
 *     description: Requests AI-driven recommendations for improving a specific campaign, adset, or ad based on its recent performance metrics.
 *     tags: [Facebook]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adAccountId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: level
 *         required: true
 *         schema:
 *           type: string
 *           enum: [campaign, adset, ad]
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Entity analysis complete
 */
router.get('/ai/analyze/:adAccountId/:level/:entityId', requireAuth(), analyzeEntity);

export default router;
