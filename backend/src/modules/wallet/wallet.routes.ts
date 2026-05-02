import express from 'express';
import * as walletController from './wallet.controller';
import { protect } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';

const router = express.Router();

/**
 * Wallet routes
 * Base path: /api/v1/wallet
 */
router.use(protect);

/**
 * @swagger
 * /api/v1/wallet:
 *   post:
 *     summary: Create a wallet
 *     description: Creates a new coin wallet for the authenticated user. Admins can create wallets for other users by providing a userId in the body.
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: "(Admin only) Create wallet for a specific user"
 *     responses:
 *       201:
 *         description: Wallet created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Wallet'
 *       401:
 *         description: Unauthorized
 */
router.post('/', walletController.createWallet);

/**
 * @swagger
 * /api/v1/wallet/balance:
 *   get:
 *     summary: Get wallet balance
 *     description: Returns the wallet balance for the authenticated user, including total, locked, and available coins. Admins can check other users' balances via `?userId=`.
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: "(Admin only) Check balance for a specific user"
 *     responses:
 *       200:
 *         description: Balance retrieved
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
 *                         balance:
 *                           type: number
 *                           description: Total coins
 *                         lockedBalance:
 *                           type: number
 *                           description: Coins locked in escrow
 *                         availableBalance:
 *                           type: number
 *                           description: Spendable coins
 *       401:
 *         description: Unauthorized
 */
router.get('/balance', walletController.getBalance);

/**
 * @swagger
 * /api/v1/wallet/transactions:
 *   get:
 *     summary: Get wallet transactions
 *     description: Returns the transaction history for the authenticated user's wallet. Admins can view any user's transactions via `?userId=`.
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: "(Admin only) View transactions for a specific user"
 *     responses:
 *       200:
 *         description: Transactions retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Unauthorized
 */
router.get('/transactions', walletController.getTransactions);

/**
 * @swagger
 * /api/v1/wallet/credit:
 *   post:
 *     summary: Credit coins to a user (Admin)
 *     description: Adds coins to a user's wallet. Admin or Super Admin only.
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - amount
 *             properties:
 *               userId:
 *                 type: string
 *               amount:
 *                 type: number
 *                 example: 100
 *               description:
 *                 type: string
 *                 example: "Bonus coins for campaign"
 *               referenceType:
 *                 type: string
 *               referenceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Coins credited
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin role required
 */
router.post('/credit', authorize('admin', 'super_admin'), walletController.creditCoins);

/**
 * @swagger
 * /api/v1/wallet/debit:
 *   post:
 *     summary: Debit coins from wallet
 *     description: Deducts coins from the authenticated user's wallet. Admins can debit from specific users.
 *     tags: [Wallet]
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
 *               userId:
 *                 type: string
 *                 description: "(Admin only) Debit from a specific user"
 *               amount:
 *                 type: number
 *                 example: 50
 *               description:
 *                 type: string
 *               referenceType:
 *                 type: string
 *               referenceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Coins debited
 *       401:
 *         description: Unauthorized
 */
router.post('/debit', walletController.debitCoins);

/**
 * @swagger
 * /api/v1/wallet/lock:
 *   post:
 *     summary: Lock coins in escrow (Admin)
 *     description: Locks coins in a user's wallet for escrow purposes (e.g., collaboration payment). Admin or Super Admin only.
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - amount
 *             properties:
 *               userId:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               referenceType:
 *                 type: string
 *                 default: collaboration
 *               referenceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Coins locked
 *       403:
 *         description: Forbidden
 */
router.post('/lock', authorize('admin', 'super_admin'), walletController.lockCoins);

/**
 * @swagger
 * /api/v1/wallet/unlock:
 *   post:
 *     summary: Unlock escrowed coins (Admin)
 *     description: Unlocks previously locked coins in a user's wallet. Admin or Super Admin only.
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - amount
 *             properties:
 *               userId:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               referenceType:
 *                 type: string
 *                 default: collaboration
 *               referenceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Coins unlocked
 *       403:
 *         description: Forbidden
 */
router.post('/unlock', authorize('admin', 'super_admin'), walletController.unlockCoins);

/**
 * @swagger
 * /api/v1/wallet/request-coins:
 *   post:
 *     summary: Request coins (pending admin approval)
 *     description: Submits a coin purchase request that requires admin approval before coins are credited. The request is recorded as a pending transaction.
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coins
 *             properties:
 *               coins:
 *                 type: number
 *                 example: 200
 *               paymentMethod:
 *                 type: string
 *                 example: "bank_transfer"
 *               pricePaid:
 *                 type: number
 *                 example: 1000
 *     responses:
 *       201:
 *         description: Coin request submitted
 *       401:
 *         description: Unauthorized
 */
router.post('/request-coins', walletController.requestCoins);

export default router;
