const express = require('express');
const router = express.Router();
const collaborationsController = require('./collaborations.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { startCollaborationValidator } = require('../../validators/collaborationValidator');
const validate = require('../../middlewares/validate.middleware');

/**
 * Collaboration Routes
 * Owner: Backend Developer 2
 */

// All routes require authentication
router.use(protect);

router.post('/start', startCollaborationValidator, validate, collaborationsController.startCollaboration);
router.put('/:id/complete', collaborationsController.completeCollaboration);

router.get('/user/:userId', collaborationsController.getCollaborationsByUser);
router.get('/:id', collaborationsController.getCollaborationById);

module.exports = router;
