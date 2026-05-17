import { Router } from 'express';
import { callbackTikTokAuth, startTikTokAuth } from './tiktokAuth.controller';
import { initiateTikTokVerification, verifyTikTokCode, resendTikTokCode } from './tiktokDemo.controller';

const router = Router();

/** Public — browser redirect to TikTok (scope: user.info.basic only). */
router.get('/start', startTikTokAuth);

/** Public — TikTok redirect target; must match TikTok Developer Portal. */
router.get('/callback', callbackTikTokAuth);

// ── Demo Verification Flow (No email/password) ──────────────────────────────────
router.post('/initiate', initiateTikTokVerification);
router.post('/verify', verifyTikTokCode);
router.post('/resend-code', resendTikTokCode);

export default router;
