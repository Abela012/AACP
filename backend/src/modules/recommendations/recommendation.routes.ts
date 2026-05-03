import express from 'express';
import { getUserRecommendations } from './recommendation.controller';
import { protect } from '../../middlewares/auth.middleware';

/**
 * Recommendation Routes
 * All routes require authentication
 */

const router = express.Router();

// Requires auth — recommendations are personalized per user
router.get('/', protect, getUserRecommendations);

export default router;
