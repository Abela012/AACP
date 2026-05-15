import express from 'express';
import * as facebookController from './facebook.controller';

const router = express.Router();

/**
 * @swagger
 * /api/v1/facebook/data-deletion:
 *   post:
 *     summary: Facebook User Data Deletion Callback
 *     description: Endpoint for Facebook to request user data deletion or for users to trigger it.
 *     tags: [Facebook]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               facebookUserId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully processed deletion request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                 confirmation_code:
 *                   type: string
 */
router.post('/data-deletion', facebookController.handleDataDeletion);

export default router;
