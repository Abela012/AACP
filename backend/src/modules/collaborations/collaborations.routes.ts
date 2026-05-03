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

/**
 * @swagger
 * /api/v1/collaborations/start:
 *   post:
 *     summary: Start a new collaboration
 *     description: Creates a collaboration from an accepted application. Only the business owner can start a collaboration.
 *     tags: [Collaborations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - applicationId
 *             properties:
 *               applicationId:
 *                 type: string
 *                 description: The accepted application ID to create a collaboration from
 *     responses:
 *       201:
 *         description: Collaboration started
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Collaboration'
 *       400:
 *         description: Invalid application or already has a collaboration
 */
router.post('/start', startCollaborationValidator, validate, collaborationsController.startCollaboration);

/**
 * @swagger
 * /api/v1/collaborations/{id}/complete:
 *   put:
 *     summary: Mark collaboration as completed
 *     description: Business owner marks a collaboration as completed. This finalizes the project and triggers any payment/coin release.
 *     tags: [Collaborations]
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
 *         description: Collaboration completed
 *       403:
 *         description: Not authorized to complete
 */
router.put('/:id/complete', collaborationsController.completeCollaboration);

/**
 * @swagger
 * /api/v1/collaborations/user/{userId}:
 *   get:
 *     summary: Get collaborations by user
 *     description: Returns all collaborations where the user is either the business owner or advertiser. Use 'me' as userId for the current user.
 *     tags: [Collaborations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: "User ID or 'me' for current user"
 *     responses:
 *       200:
 *         description: Collaborations retrieved
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
 *                         $ref: '#/components/schemas/Collaboration'
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', collaborationsController.getCollaborationsByUser);

/**
 * @swagger
 * /api/v1/collaborations/{id}:
 *   get:
 *     summary: Get collaboration by ID
 *     description: Returns detailed information about a specific collaboration, including milestones and submissions.
 *     tags: [Collaborations]
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
 *         description: Collaboration details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Collaboration'
 *       500:
 *         description: Server error
 */
router.get('/:id', collaborationsController.getCollaborationById);

// Milestone & Submission management
router.post('/:id/milestones', collaborationsController.addMilestone);
router.post('/:id/milestones/:milestoneId/submit', collaborationsController.submitDeliverable);
router.put('/:id/milestones/:milestoneId/submissions/:submissionId/review', collaborationsController.reviewSubmission);

export default router;
