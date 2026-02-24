const express = require('express');
const router = express.Router();

// Import routes
// const authRoutes = require('../modules/auth/auth.routes');
// const opportunityRoutes = require('../modules/opportunities/opportunity.routes');

// Use routes
// router.use('/auth', authRoutes);
// router.use('/opportunities', opportunityRoutes);

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API is running' });
});

module.exports = router;
