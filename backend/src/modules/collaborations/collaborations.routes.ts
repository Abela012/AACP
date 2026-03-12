import express from 'express';
import * as collaborationsController from './collaborations.controller';
import { protect } from '../../middlewares/auth.middleware';
import { startCollaborationValidator } from '../../validators/collaborationValidator';
import validate from '../../middlewares/validate.middleware';

/**
 * Collaboration Routes
 * Owner: Backend Developer 2
 */

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/start', startCollaborationValidator, validate, collaborationsController.startCollaboration);
router.put('/:id/complete', collaborationsController.completeCollaboration);

router.get('/user/:userId', collaborationsController.getCollaborationsByUser);
router.get('/:id', collaborationsController.getCollaborationById);

export default router;
