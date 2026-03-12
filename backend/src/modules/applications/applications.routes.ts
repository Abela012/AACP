import express from 'express';
import * as applicationsController from './applications.controller';
import { protect } from '../../middlewares/auth.middleware';
import { applyToOpportunityValidator } from '../../validators/applicationValidator';
import validate from '../../middlewares/validate.middleware';

/**
 * Application Routes
 * Owner: Backend Developer 2
 */

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/', applyToOpportunityValidator, validate, applicationsController.applyToOpportunity);
router.delete('/:id', applicationsController.withdrawApplication);

router.get('/opportunity/:id', applicationsController.getApplicationsByOpportunity);
router.get('/user/:id', applicationsController.getApplicationsByAdvertiser);

router.put('/:id/accept', applicationsController.acceptApplication);
router.put('/:id/reject', applicationsController.rejectApplication);

export default router;
