import express from 'express';
import * as opportunitiesController from './opportunities.controller';
import { protect } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { createOpportunityValidator } from '../../validators/opportunityValidator';
import validate from '../../middlewares/validate.middleware';

/**
 * Opportunity Routes
 * Owner: Backend Developer 2
 * Base path: /api/v1/opportunities
 */

const router = express.Router();

// Public routes
router.get('/', opportunitiesController.getAllOpportunities);
router.get('/user/:userId', opportunitiesController.getOpportunitiesByUser);
router.get('/:id', opportunitiesController.getOpportunityById);

// Protected routes
router.post('/', protect, authorize('business_owner'), createOpportunityValidator, validate, opportunitiesController.createOpportunity);
router.put('/:id', protect, opportunitiesController.updateOpportunity);
router.delete('/:id', protect, opportunitiesController.deleteOpportunity);

export default router;
