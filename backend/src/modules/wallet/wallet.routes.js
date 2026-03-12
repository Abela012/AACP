const express = require('express');
const walletController = require('./wallet.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

const router = express.Router();

/**
 * Wallet routes
 * Base path: /api/v1/wallet
 */
router.use(protect);

router.post('/', walletController.createWallet);
router.get('/balance', walletController.getBalance);

// Admin/System managed wallet operations
router.post('/credit', authorize('admin', 'super_admin'), walletController.creditCoins);
router.post('/debit', walletController.debitCoins);
router.post('/lock', authorize('admin', 'super_admin'), walletController.lockCoins);
router.post('/unlock', authorize('admin', 'super_admin'), walletController.unlockCoins);

module.exports = router;
