import express from 'express';
import { protect } from '../../middlewares/auth.middleware';
import * as paymentsController from './payments.controller';

const router = express.Router();

router.post('/chapa/webhook', paymentsController.chapaWebhook);
router.get('/chapa/callback', paymentsController.chapaCallback);

router.use(protect);
router.post('/chapa/initialize', paymentsController.initializeTopup);
router.post('/chapa/verify', paymentsController.verifyTopup);

export default router;
