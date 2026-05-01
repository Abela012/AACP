import express from 'express';
import { requireAuth } from '@clerk/express';
import {
    connectFacebook,
    disconnectFacebook,
    getConnections,
    getProfile,
    getAdAccounts,
    getPages,
    getAdsInsights,
    syncData,
    getAIInsights,
    analyzeEntity,
} from './facebook.controller';

/**
 * Facebook API Routes
 *
 * All routes require Clerk authentication.
 *
 * Connection Management:
 *   POST   /connect                              → Connect a Facebook account
 *   DELETE /disconnect/:connectionId             → Disconnect a Facebook account
 *   GET    /connections                           → List all connections
 *
 * Data Access:
 *   GET    /profile                               → Get Facebook profile
 *   GET    /ad-accounts                           → List ad accounts
 *   GET    /pages                                 → List managed pages
 *   GET    /ads/:adAccountId/insights             → Get ads insights
 *   POST   /sync/:connectionId                    → Trigger data sync
 *
 * AI Insights:
 *   GET    /ai/insights/:adAccountId              → Get AI-generated report
 *   GET    /ai/analyze/:adAccountId/:level/:entityId → Analyze specific entity
 */

const router = express.Router();

// ── Connection Management ────────────────────────────────────────────────────
router.post('/connect', requireAuth(), connectFacebook);
router.delete('/disconnect/:connectionId', requireAuth(), disconnectFacebook);
router.get('/connections', requireAuth(), getConnections);

// ── Data Access ──────────────────────────────────────────────────────────────
router.get('/profile', requireAuth(), getProfile);
router.get('/ad-accounts', requireAuth(), getAdAccounts);
router.get('/pages', requireAuth(), getPages);
router.get('/ads/:adAccountId/insights', requireAuth(), getAdsInsights);
router.post('/sync/:connectionId', requireAuth(), syncData);

// ── AI Insights ──────────────────────────────────────────────────────────────
router.get('/ai/insights/:adAccountId', requireAuth(), getAIInsights);
router.get('/ai/analyze/:adAccountId/:level/:entityId', requireAuth(), analyzeEntity);

export default router;
