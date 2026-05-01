import express from 'express';
import * as applicationsController from './applications.controller';
import { protect } from '../../middlewares/auth.middleware';
import { applyToOpportunityValidator } from '../../validators/applicationValidator';
import validate from '../../middlewares/validate.middleware';

/**
 * Application Routes
 * Owner: Backend Developer 2
 */

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/v1/applications:
 *   post:
 *     summary: Apply to an opportunity
 *     description: Submits an application for an opportunity. Deducts 50 AACP coins from the advertiser. Automatically sends a notification message to the business owner via chat.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - opportunity
 *             properties:
 *               opportunity:
 *                 type: string
 *                 description: Opportunity ID to apply for
 *               coverLetter:
 *                 type: string
 *                 maxLength: 3000
 *                 example: "I have 3 years of experience in social media marketing..."
 *               proposedPrice:
 *                 type: number
 *                 example: 3000
 *               currency:
 *                 type: string
 *                 default: ETB
 *               proposedTimeline:
 *                 type: string
 *                 example: "2 weeks"
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Application'
 *       400:
 *         description: Insufficient coins or validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', applyToOpportunityValidator, validate, applicationsController.applyToOpportunity);

/**
 * @swagger
 * /api/v1/applications/{id}:
 *   delete:
 *     summary: Withdraw an application
 *     description: Withdraws a previously submitted application. Only the applicant can withdraw.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application withdrawn
 *       403:
 *         description: Not authorized to withdraw
 */
router.delete('/:id', applicationsController.withdrawApplication);

/**
 * @swagger
 * /api/v1/applications/business-owner:
 *   get:
 *     summary: Get all applications for business owner's opportunities
 *     description: Returns all applications received across all opportunities owned by the currently logged-in business owner.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applications retrieved
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
 *                         $ref: '#/components/schemas/Application'
 *       401:
 *         description: Unauthorized
 */
router.get('/business-owner', applicationsController.getApplicationsForBusinessOwner);

/**
 * @swagger
 * /api/v1/applications/opportunity/{id}:
 *   get:
 *     summary: Get applications by opportunity
 *     description: Returns all applications submitted for a specific opportunity.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Opportunity ID
 *     responses:
 *       200:
 *         description: Applications retrieved
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
 *                         $ref: '#/components/schemas/Application'
 *       500:
 *         description: Server error
 */
router.get('/opportunity/:id', applicationsController.getApplicationsByOpportunity);

/**
 * @swagger
 * /api/v1/applications/user/{id}:
 *   get:
 *     summary: Get applications by advertiser
 *     description: Returns all applications submitted by a specific advertiser.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Advertiser's User ID
 *     responses:
 *       200:
 *         description: Applications retrieved
 *       500:
 *         description: Server error
 */
router.get('/user/:id', applicationsController.getApplicationsByAdvertiser);

/**
 * @swagger
 * /api/v1/applications/{id}/accept:
 *   put:
 *     summary: Accept an application
 *     description: Business owner accepts an advertiser's application for their opportunity.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application accepted
 *       403:
 *         description: Not authorized
 */
router.put('/:id/accept', applicationsController.acceptApplication);

/**
 * @swagger
 * /api/v1/applications/{id}/reject:
 *   put:
 *     summary: Reject an application
 *     description: Business owner rejects an advertiser's application. Optionally includes a rejection reason.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rejectionReason:
 *                 type: string
 *                 example: "Profile does not match requirements"
 *     responses:
 *       200:
 *         description: Application rejected
 *       403:
 *         description: Not authorized
 */
router.put('/:id/reject', applicationsController.rejectApplication);

export default router;
