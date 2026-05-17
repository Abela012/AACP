import express from 'express';
import * as socialController from './social.controller';
import { requireAuth } from '../../middlewares/auth.middleware';

const router = express.Router();

router.get('/connections', requireAuth, socialController.getConnections);
router.post('/initiate', requireAuth, socialController.initiateConnection);
router.post('/verify', requireAuth, socialController.verifyConnection);
router.post('/sync/:platform', requireAuth, socialController.syncMetrics);
router.delete('/disconnect/:platform', requireAuth, socialController.disconnectPlatform);

export default router;
