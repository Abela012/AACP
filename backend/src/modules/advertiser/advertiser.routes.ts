import express from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import * as advertiserController from './advertiser.controller';

const router = express.Router();

router.get('/profile/setup', requireAuth, advertiserController.getProfileSetup);
router.put('/profile/basic', requireAuth, advertiserController.updateBasicInfo);
router.post('/social/initiate', requireAuth, advertiserController.initiateSocialConnection);
router.post('/social/verify', requireAuth, advertiserController.verifySocialConnection);
router.post('/social/disconnect/:platform', requireAuth, advertiserController.disconnectSocialConnection);
router.put('/profile/content', requireAuth, advertiserController.updateContentNiche);
router.get('/profile/status', requireAuth, advertiserController.getProfileStatus);

export default router;
