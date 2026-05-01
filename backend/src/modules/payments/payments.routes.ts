import express from 'express';
import { protect } from '../../middlewares/auth.middleware';
import * as paymentsController from './payments.controller';

const router = express.Router();

/**
 * @swagger
 * /api/v1/payments/chapa/webhook:
 *   post:
 *     summary: Chapa webhook handler
 *     description: Receives payment completion webhooks from Chapa. No authentication required – called by Chapa servers.
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tx_ref:
 *                 type: string
 *                 description: Transaction reference from Chapa
 *     responses:
 *       200:
 *         description: Webhook processed
 *       400:
 *         description: tx_ref is required
 */
router.post('/chapa/webhook', paymentsController.chapaWebhook);

/**
 * @swagger
 * /api/v1/payments/chapa/callback:
 *   get:
 *     summary: Chapa payment callback
 *     description: Callback URL that Chapa redirects to after payment. Returns the transaction reference.
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: tx_ref
 *         schema:
 *           type: string
 *         description: Transaction reference from Chapa
 *     responses:
 *       200:
 *         description: Callback received
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 txRef:
 *                   type: string
 */
router.get('/chapa/callback', paymentsController.chapaCallback);

router.use(protect);

/**
 * @swagger
 * /api/v1/payments/chapa/initialize:
 *   post:
 *     summary: Initialize a Chapa payment
 *     description: Creates a new Chapa payment session for topping up the user's wallet. Returns a checkout URL to redirect the user.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 500
 *               currency:
 *                 type: string
 *                 default: ETB
 *               callbackUrl:
 *                 type: string
 *               returnUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment initialized
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
 *                         checkoutUrl:
 *                           type: string
 *                           description: Redirect user to this URL
 *                         txRef:
 *                           type: string
 *       401:
 *         description: Unauthorized
 */
router.post('/chapa/initialize', paymentsController.initializeTopup);

/**
 * @swagger
 * /api/v1/payments/chapa/verify:
 *   post:
 *     summary: Verify a Chapa payment
 *     description: Verifies a Chapa payment by transaction reference and credits coins to the user's wallet if successful.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - txRef
 *             properties:
 *               txRef:
 *                 type: string
 *                 description: Transaction reference to verify
 *     responses:
 *       200:
 *         description: Payment verification completed
 *       401:
 *         description: Unauthorized
 */
router.post('/chapa/verify', paymentsController.verifyTopup);

export default router;
