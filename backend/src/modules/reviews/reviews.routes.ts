import express from 'express';
import * as reviewsController from './reviews.controller';
import { protect } from '../../middlewares/auth.middleware';
import { createReviewValidator } from '../../validators/reviewValidator';
import validate from '../../middlewares/validate.middleware';

/**
 * Review Routes
 * Owner: Backend Developer 2
 */

const router = express.Router();

// Creation and collaboration-specific retrieval require auth
router.use(protect);

router.post('/', createReviewValidator, validate, reviewsController.createReview);
router.get('/collaboration/:id', reviewsController.getReviewsByCollaboration);

// Publicly reachable user review list
// Redefining the router behavior for this specific route if we want it public
router.get('/user/:id', reviewsController.getReviewsByUser);

export default router;
