import express from 'express';
import { requireAuth } from '@clerk/express';
import * as fbAnalyticsController from './facebookAnalytics.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Facebook Analytics
 *     description: Facebook Page analytics OAuth flow and insights
 */

/**
 * @swagger
 * /api/v1/auth/facebook/analytics/login:
 *   get:
 *     summary: Initiate Facebook Analytics OAuth flow
 *     tags: [Facebook Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the Facebook OAuth authorization URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     authUrl:
 *                       type: string
 */
router.get('/auth/facebook/analytics/login', requireAuth(), fbAnalyticsController.initiateAnalyticsAuth);

/**
 * @swagger
 * /api/v1/auth/facebook/analytics/callback:
 *   get:
 *     summary: Handle Facebook OAuth callback (redirect endpoint)
 *     tags: [Facebook Analytics]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirects to frontend with status
 */
// NOTE: No requireAuth() here — Facebook redirects the browser, not an API call.
// User identity is verified via the state parameter.
router.get('/auth/facebook/analytics/callback', fbAnalyticsController.handleAnalyticsCallback);

/**
 * @swagger
 * /api/v1/api/facebook/pages:
 *   get:
 *     summary: Get connected Facebook Pages
 *     tags: [Facebook Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of connected pages
 */
router.get('/api/facebook/pages', requireAuth(), fbAnalyticsController.getPages);

/**
 * @swagger
 * /api/v1/api/facebook/insights:
 *   get:
 *     summary: Get page insights/analytics
 *     tags: [Facebook Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pageId
 *         schema:
 *           type: string
 *         description: Optional page ID to fetch specific page insights
 *       - in: query
 *         name: refresh
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Force refresh from Facebook API
 *     responses:
 *       200:
 *         description: Page insights data
 */
router.get('/api/facebook/insights', requireAuth(), fbAnalyticsController.getInsights);

/**
 * @swagger
 * /api/v1/api/facebook/disconnect:
 *   delete:
 *     summary: Disconnect Facebook Analytics
 *     tags: [Facebook Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully disconnected
 */
router.delete('/api/facebook/disconnect', requireAuth(), fbAnalyticsController.disconnectAnalytics);

export default router;
