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

/**
 * @swagger
 * /api/v1/reviews:
 *   post:
 *     summary: Create a review
 *     description: Submit a review for a completed collaboration. Both business owners and advertisers can leave reviews. Only one review per user per collaboration is allowed.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collaborationId
 *               - rating
 *             properties:
 *               collaborationId:
 *                 type: string
 *                 description: The collaboration to review
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 maxLength: 2000
 *                 example: "Great communication and delivered on time!"
 *     responses:
 *       201:
 *         description: Review submitted
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Review'
 *       400:
 *         description: Validation error or duplicate review
 */
router.post('/', createReviewValidator, validate, reviewsController.createReview);

/**
 * @swagger
 * /api/v1/reviews/collaboration/{id}:
 *   get:
 *     summary: Get reviews for a collaboration
 *     description: Returns all reviews submitted for a specific collaboration.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Collaboration ID
 *     responses:
 *       200:
 *         description: Reviews retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Review'
 *       500:
 *         description: Server error
 */
router.get('/collaboration/:id', reviewsController.getReviewsByCollaboration);

/**
 * @swagger
 * /api/v1/reviews/user/{id}:
 *   get:
 *     summary: Get reviews for a user
 *     description: Returns all public reviews received by a specific user.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Reviews retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Review'
 *       500:
 *         description: Server error
 */
router.get('/user/:id', reviewsController.getReviewsByUser);

export default router;
