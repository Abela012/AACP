const express = require('express');
const router = express.Router();

// Import routes
const walletRoutes = require('../modules/wallet/wallet.routes');

// Use routes
router.use('/wallet', walletRoutes);

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API is running' });
});

module.exports = router;
