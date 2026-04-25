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

router.post('/', walletController.createWallet);
router.get('/balance', walletController.getBalance);
router.get('/transactions', walletController.getTransactions);

// Admin/System managed wallet operations
router.post('/credit', authorize('admin', 'super_admin'), walletController.creditCoins);
router.post('/debit', walletController.debitCoins);
router.post('/lock', authorize('admin', 'super_admin'), walletController.lockCoins);
router.post('/unlock', authorize('admin', 'super_admin'), walletController.unlockCoins);

// User: submit a pending coin purchase request (awaits admin approval)
router.post('/request-coins', walletController.requestCoins);

export default router;
