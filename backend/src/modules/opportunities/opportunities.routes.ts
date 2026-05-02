import express from 'express';
import * as opportunitiesController from './opportunities.controller';
import { protect } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { createOpportunityValidator } from '../../validators/opportunityValidator';
import validate from '../../middlewares/validate.middleware';


const router = express.Router();

/**
 * @swagger
 * /api/v1/opportunities:
 *   get:
 *     summary: Get all opportunities
 *     description: Retrieves all available advertisement opportunities. No authentication required.
 *     tags: [Opportunities]
 *     responses:
 *       200:
 *         description: Opportunities retrieved successfully
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
 *                         $ref: '#/components/schemas/Opportunity'
 *       500:
 *         description: Server error
 */
router.get('/', opportunitiesController.getAllOpportunities);

/**
 * @swagger
 * /api/v1/opportunities/user/{userId}:
 *   get:
 *     summary: Get opportunities by business owner
 *     description: Retrieves all opportunities created by a specific business owner.
 *     tags: [Opportunities]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB User ID of the business owner
 *     responses:
 *       200:
 *         description: Opportunities retrieved successfully
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
 *                         $ref: '#/components/schemas/Opportunity'
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', opportunitiesController.getOpportunitiesByUser);

/**
 * @swagger
 * /api/v1/opportunities/{id}:
 *   get:
 *     summary: Get opportunity by ID
 *     description: Retrieves a single opportunity by its ID.
 *     tags: [Opportunities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Opportunity ID
 *     responses:
 *       200:
 *         description: Opportunity retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Opportunity'
 *       404:
 *         description: Opportunity not found
 *       500:
 *         description: Server error
 */
router.get('/:id', opportunitiesController.getOpportunityById);

/**
 * @swagger
 * /api/v1/opportunities:
 *   post:
 *     summary: Create a new opportunity
 *     description: Creates a new advertisement campaign opportunity. Requires business_owner role. Deducts 50 AACP coins as a posting fee.
 *     tags: [Opportunities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - budget
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 example: "Instagram Product Review Campaign"
 *               description:
 *                 type: string
 *                 maxLength: 5000
 *               category:
 *                 type: string
 *                 example: "Technology"
 *               platforms:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Instagram", "TikTok"]
 *               deliverables:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["1 Reel", "3 Stories"]
 *               budget:
 *                 type: object
 *                 required:
 *                   - amount
 *                 properties:
 *                   amount:
 *                     type: number
 *                     example: 5000
 *                   currency:
 *                     type: string
 *                     default: ETB
 *               requirements:
 *                 type: object
 *                 properties:
 *                   minFollowers:
 *                     type: integer
 *                     example: 1000
 *                   preferredNiches:
 *                     type: array
 *                     items:
 *                       type: string
 *                   location:
 *                     type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               applicationDeadline:
 *                 type: string
 *                 format: date-time
 *               maxApplicants:
 *                 type: integer
 *                 default: 10
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Opportunity created successfully
 *       400:
 *         description: Insufficient coins or validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', protect, authorize('business_owner'), createOpportunityValidator, validate, opportunitiesController.createOpportunity);

/**
 * @swagger
 * /api/v1/opportunities/{id}:
 *   put:
 *     summary: Update an opportunity
 *     description: Updates an existing opportunity. Only the business owner who created it can update.
 *     tags: [Opportunities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Opportunity ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, open, in_review, closed, completed, cancelled]
 *               budget:
 *                 type: object
 *                 properties:
 *                   amount:
 *                     type: number
 *                   currency:
 *                     type: string
 *     responses:
 *       200:
 *         description: Opportunity updated
 *       403:
 *         description: Not authorized to update
 *       404:
 *         description: Opportunity not found
 *       500:
 *         description: Server error
 */
router.put('/:id', protect, opportunitiesController.updateOpportunity);

/**
 * @swagger
 * /api/v1/opportunities/{id}:
 *   delete:
 *     summary: Delete an opportunity
 *     description: Deletes an opportunity. Only the business owner who created it can delete.
 *     tags: [Opportunities]
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
 *         description: Opportunity deleted
 *       403:
 *         description: Not authorized to delete
 *       404:
 *         description: Opportunity not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, opportunitiesController.deleteOpportunity);

export default router;
