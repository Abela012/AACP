import express from 'express';
import opportunityRoutes from '../modules/opportunities/opportunities.routes';
import applicationRoutes from '../modules/applications/applications.routes';
import collaborationRoutes from '../modules/collaborations/collaborations.routes';
import reviewRoutes from '../modules/reviews/reviews.routes';
import walletRoutes from '../modules/wallet/wallet.routes';
import paymentsRoutes from '../modules/payments/payments.routes';
import userRoutes from '../modules/User/userRoute';
import adminRoutes from '../modules/Admin/adminRoute';
import superAdminRoutes from '../modules/super-admin/superAdmin.routes';
import chatRoutes from '../modules/chat/chat.routes';

import recommendationRoutes from '../modules/recommendations/recommendation.routes';
import marketingAnalysisRoutes from '../modules/marketing-analysis/marketing-analysis.routes';
import socialRoutes from '../modules/social/social.routes';

/**
 * @swagger
 * tags:
 *   - name: Health
 *     description: API health check
 *   - name: Users
 *     description: User profile management & sync
 *   - name: Opportunities
 *     description: Advertisement campaign opportunities
 *   - name: Applications
 *     description: Advertiser applications for opportunities
 *   - name: Collaborations
 *     description: Active collaborations between business owners and advertisers
 *   - name: Reviews
 *     description: Post-collaboration ratings and reviews
 *   - name: Wallet
 *     description: AACP coin wallet management
 *   - name: Payments
 *     description: Chapa payment gateway integration
 *   - name: Chat
 *     description: Real-time messaging and conversations
 *   - name: Admin
 *     description: Admin dashboard and user management
 *   - name: Super Admin
 *     description: Super admin governance, audit, and configuration
 *   - name: Facebook
 *     description: Facebook Ads integration and AI insights
 *   - name: Social
 *     description: Social media platform connections and OAuth
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         clerkId:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         username:
 *           type: string
 *         profilePicture:
 *           type: string
 *         coverImage:
 *           type: string
 *         location:
 *           type: string
 *         role:
 *           type: string
 *           enum: [business_owner, advertiser, admin, super_admin]
 *         status:
 *           type: string
 *           enum: [pending, active, approved, banned, suspended]
 *         isVerified:
 *           type: boolean
 *         profileData:
 *           type: object
 *         totalPosts:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Opportunity:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         businessOwner:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         platforms:
 *           type: array
 *           items:
 *             type: string
 *         deliverables:
 *           type: array
 *           items:
 *             type: string
 *         budget:
 *           type: object
 *           properties:
 *             amount:
 *               type: number
 *             currency:
 *               type: string
 *               default: ETB
 *         requirements:
 *           type: object
 *           properties:
 *             minFollowers:
 *               type: integer
 *             preferredNiches:
 *               type: array
 *               items:
 *                 type: string
 *             location:
 *               type: string
 *         deadline:
 *           type: string
 *           format: date-time
 *         applicationDeadline:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [draft, open, in_review, closed, completed, cancelled]
 *         coinsRequired:
 *           type: integer
 *         maxApplicants:
 *           type: integer
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         viewsCount:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Application:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         opportunity:
 *           type: string
 *         advertiser:
 *           type: string
 *         coverLetter:
 *           type: string
 *         proposedRate:
 *           type: object
 *           properties:
 *             amount:
 *               type: number
 *             currency:
 *               type: string
 *         proposedTimeline:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, shortlisted, accepted, rejected, withdrawn, completed]
 *         coinsSpent:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Collaboration:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         opportunity:
 *           type: string
 *         application:
 *           type: string
 *         businessOwner:
 *           type: string
 *         advertiser:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, on_hold, completed, cancelled, disputed]
 *         agreedBudget:
 *           type: object
 *           properties:
 *             amount:
 *               type: number
 *             currency:
 *               type: string
 *         startDate:
 *           type: string
 *           format: date-time
 *         overallProgress:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Review:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         collaboration:
 *           type: string
 *         reviewer:
 *           type: string
 *         reviewee:
 *           type: string
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         comment:
 *           type: string
 *         categories:
 *           type: object
 *           properties:
 *             communication:
 *               type: integer
 *             quality:
 *               type: integer
 *             timeliness:
 *               type: integer
 *             professionalism:
 *               type: integer
 *         isPublic:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Wallet:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *         totalCoins:
 *           type: number
 *         lockedCoins:
 *           type: number
 *         availableCoins:
 *           type: number
 *         isActive:
 *           type: boolean
 *     Transaction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         wallet:
 *           type: string
 *         user:
 *           type: string
 *         type:
 *           type: string
 *           enum: [credit, debit, lock, unlock, refund, penalty, payment]
 *         amount:
 *           type: number
 *         balanceBefore:
 *           type: number
 *         balanceAfter:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, completed, failed, reversed]
 *         description:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Conversation:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *         lastMessage:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         conversation:
 *           type: string
 *         sender:
 *           type: string
 *         text:
 *           type: string
 *         isRead:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */

const router = express.Router();

router.use('/opportunities', opportunityRoutes);
router.use('/applications', applicationRoutes);
router.use('/collaborations', collaborationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/wallet', walletRoutes);
router.use('/payments', paymentsRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/super-admin', superAdminRoutes);
router.use('/chat', chatRoutes);

router.use('/recommendations', recommendationRoutes);
router.use('/marketing-analysis', marketingAnalysisRoutes);
router.use('/social', socialRoutes);

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: API health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: API is running
 */
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API is running' });
});

export default router;
