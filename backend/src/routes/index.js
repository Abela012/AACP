const express = require('express');
const router = express.Router();

// Import routes
// const authRoutes = require('../modules/auth/auth.routes');
const opportunityRoutes = require('../modules/opportunities/opportunities.routes');
const applicationRoutes = require('../modules/applications/applications.routes');
const collaborationRoutes = require('../modules/collaborations/collaborations.routes');
const reviewRoutes = require('../modules/reviews/reviews.routes');

// Use routes
// router.use('/auth', authRoutes);
router.use('/opportunities', opportunityRoutes);
router.use('/applications', applicationRoutes);
router.use('/collaborations', collaborationRoutes);
router.use('/reviews', reviewRoutes);

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API is running' });
});

module.exports = router;
