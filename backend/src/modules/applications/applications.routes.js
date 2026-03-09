const express = require('express');
const router = express.Router();
const applicationsController = require('./applications.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { applyToOpportunityValidator } = require('../../validators/applicationValidator');
const validate = require('../../middlewares/validate.middleware');

/**
 * Application Routes
 * Owner: Backend Developer 2
 */

// All routes require authentication
router.use(protect);

router.post('/', applyToOpportunityValidator, validate, applicationsController.applyToOpportunity);
router.delete('/:id', applicationsController.withdrawApplication);

router.get('/opportunity/:id', applicationsController.getApplicationsByOpportunity);
router.get('/user/:id', applicationsController.getApplicationsByAdvertiser);

router.put('/:id/accept', applicationsController.acceptApplication);
router.put('/:id/reject', applicationsController.rejectApplication);

module.exports = router;
