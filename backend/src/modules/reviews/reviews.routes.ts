import express from 'express';
import * as reviewsController from './reviews.controller';
import { requireAuth } from "@clerk/express";

const router = express.Router();

/**
 * @swagger
 * /api/v1/reviews:
 *   post:
 *     summary: Create a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', requireAuth(), reviewsController.createReview);

/**
 * @swagger
 * /api/v1/reviews/my-sent:
 *   get:
 *     summary: Get reviews sent by current user
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 */
router.get('/my-sent', requireAuth(), reviewsController.getMySentReviews);

/**
 * @swagger
 * /api/v1/reviews/collaboration/{id}:
 *   get:
 *     summary: Get reviews for a collaboration
 *     tags: [Reviews]
 */
router.get('/collaboration/:id', reviewsController.getReviewsByCollaboration);

/**
 * @swagger
 * /api/v1/reviews/user/{id}:
 *   get:
 *     summary: Get reviews for a user
 *     tags: [Reviews]
 */
router.get('/user/:id', reviewsController.getReviewsByUser);

/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', requireAuth(), reviewsController.deleteReview);

export default router;
