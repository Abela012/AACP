import { Router } from 'express';
import { callbackTikTokAuth, startTikTokAuth } from './tiktokAuth.controller';

const router = Router();

/** Public — browser redirect to TikTok (scope: user.info.basic only). */
router.get('/start', startTikTokAuth);

/** Public — TikTok redirect target; must match TikTok Developer Portal. */
router.get('/callback', callbackTikTokAuth);

export default router;
