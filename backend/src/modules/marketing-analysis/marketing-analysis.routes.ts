import express from 'express';
import { getMarketingAnalysis } from './marketing-analysis.controller';
import { protect } from '../../middlewares/auth.middleware';

/**
 * Marketing Analysis Routes
 * All routes require authentication
 */

const router = express.Router();

// GET /api/v1/marketing-analysis/:opportunityId
router.get('/:opportunityId', protect, getMarketingAnalysis);

export default router;
