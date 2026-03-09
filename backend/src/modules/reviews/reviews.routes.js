const express = require('express');
const router = express.Router();
const reviewsController = require('./reviews.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { createReviewValidator } = require('../../validators/reviewValidator');
const validate = require('../../middlewares/validate.middleware');

/**
 * Review Routes
 * Owner: Backend Developer 2
 */

// Creation and collaboration-specific retrieval require auth
router.use(protect);

router.post('/', createReviewValidator, validate, reviewsController.createReview);
router.get('/collaboration/:id', reviewsController.getReviewsByCollaboration);

// Publicly reachable user review list
// Redefining the router behavior for this specific route if we want it public
router.get('/user/:id', reviewsController.getReviewsByUser);

module.exports = router;
