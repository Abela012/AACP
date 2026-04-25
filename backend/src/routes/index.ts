import express from 'express';
import opportunityRoutes from '../modules/opportunities/opportunities.routes';
import applicationRoutes from '../modules/applications/applications.routes';
import collaborationRoutes from '../modules/collaborations/collaborations.routes';
import reviewRoutes from '../modules/reviews/reviews.routes';
import walletRoutes from '../modules/wallet/wallet.routes';
import paymentsRoutes from '../modules/payments/payments.routes';
import userRoutes from '../modules/User/userRoute';
import adminRoutes from '../modules/Admin/adminRoute';
import chatRoutes from '../modules/chat/chat.routes';

/**
 * API Routes Index
 */

const router = express.Router();

// Use routes
router.use('/opportunities', opportunityRoutes);
router.use('/applications', applicationRoutes);
router.use('/collaborations', collaborationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/wallet', walletRoutes);
router.use('/payments', paymentsRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/chat', chatRoutes);

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API is running' });
});

export default router;
