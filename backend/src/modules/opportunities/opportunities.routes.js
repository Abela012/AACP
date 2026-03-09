const express = require('express');
const router = express.Router();
const opportunitiesController = require('./opportunities.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { createOpportunityValidator } = require('../../validators/opportunityValidator');
const validate = require('../../middlewares/validate.middleware');

/**
 * Opportunity Routes
 * Owner: Backend Developer 2
 * Base path: /api/v1/opportunities
 */

// Public routes
router.get('/', opportunitiesController.getAllOpportunities);
router.get('/user/:userId', opportunitiesController.getOpportunitiesByUser);
router.get('/:id', opportunitiesController.getOpportunityById);

// Protected routes
router.post('/', protect, authorize('business_owner'), createOpportunityValidator, validate, opportunitiesController.createOpportunity);
router.put('/:id', protect, opportunitiesController.updateOpportunity);
router.delete('/:id', protect, opportunitiesController.deleteOpportunity);

module.exports = router;
