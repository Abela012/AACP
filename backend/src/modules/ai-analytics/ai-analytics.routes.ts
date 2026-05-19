/**
 * AI Analytics Routes
 *
 * Follows the same routing pattern as your existing
 * marketing-analysis.routes.ts and recommendation.routes.ts
 */

import express from 'express';
import {
    getMyAnalytics,
    getAdvertiserAnalytics,
    refreshMyAnalytics,
    getCacheStats,
} from './ai-analytics.controller';
import { protect } from '../../middlewares/auth.middleware';

const router = express.Router();

// GET /api/v1/ai-analytics — Get analytics for the authenticated user
router.get('/', protect, getMyAnalytics);

// GET /api/v1/ai-analytics/cache-stats — Admin cache monitoring
router.get('/cache-stats', protect, getCacheStats);

// POST /api/v1/ai-analytics/refresh — Force regenerate (invalidates cache)
router.post('/refresh', protect, refreshMyAnalytics);

// GET /api/v1/ai-analytics/advertiser/:advertiserId — View a creator's analytics
router.get('/advertiser/:advertiserId', protect, getAdvertiserAnalytics);

export default router;
