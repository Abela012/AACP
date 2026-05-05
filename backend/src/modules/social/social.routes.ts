import express from 'express';
import * as socialController from './social.controller';
import { requireAuth } from '@clerk/express';

const router = express.Router();

/**
 * @swagger
 * /api/v1/social/connections:
 *   get:
 *     summary: Get all social media connections
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of connections
 */
router.get('/connections', requireAuth(), socialController.getConnections);

/**
 * @swagger
 * /api/v1/social/initiate/{platform}:
 *   get:
 *     summary: Initiate OAuth flow for a platform
 *     tags: [Social]
 *     parameters:
 *       - in: path
 *         name: platform
 *         required: true
 *         schema:
 *           type: string
 *           enum: [facebook, instagram, tiktok]
 *     responses:
 *       200:
 *         description: Auth URL returned
 */
router.get('/initiate/:platform', requireAuth(), socialController.initiateAuth);

/**
 * @swagger
 * /api/v1/social/callback/{platform}:
 *   get:
 *     summary: Handle OAuth callback
 *     tags: [Social]
 *     parameters:
 *       - in: path
 *         name: platform
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully connected
 */
router.get('/callback/:platform', requireAuth(), socialController.handleCallback);

/**
 * @swagger
 * /api/v1/social/disconnect/{platform}:
 *   delete:
 *     summary: Disconnect a social media platform
 *     tags: [Social]
 *     parameters:
 *       - in: path
 *         name: platform
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully disconnected
 */
router.delete('/disconnect/:platform', requireAuth(), socialController.disconnectPlatform);

export default router;
