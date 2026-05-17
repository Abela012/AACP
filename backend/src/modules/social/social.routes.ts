import express from 'express';
import * as socialController from './social.controller';
import { requireAuth } from '../../middlewares/auth.middleware';

const router = express.Router();

router.get('/connections', requireAuth, socialController.getConnections);
router.get('/initiate/:platform', requireAuth, socialController.initiateAuth);
router.post('/connect/:platform', requireAuth, socialController.connectWithToken);
router.delete('/disconnect/:platform', requireAuth, socialController.disconnectPlatform);

export default router;
