import express from 'express';
import * as chatController from './chat.controller';
import { requireAuth } from '../../middlewares/auth.middleware';

const router = express.Router();

/**
 * Chat Routes
 * Base: /api/v1/chat
 */

router.use(requireAuth); // All chat routes require authentication

/**
 * @swagger
 * /api/v1/chat/conversations:
 *   get:
 *     summary: Get user's conversations
 *     description: Returns all conversations the authenticated user is a participant of, with populated participant details and last message.
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversations retrieved
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
 *                         $ref: '#/components/schemas/Conversation'
 *       401:
 *         description: Unauthorized
 */
router.get('/conversations', chatController.getConversations);

/**
 * @swagger
 * /api/v1/chat/conversations:
 *   post:
 *     summary: Start or retrieve a conversation
 *     description: Creates a new conversation with the specified recipient, or returns the existing one if it already exists.
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *             properties:
 *               recipientId:
 *                 type: string
 *                 description: MongoDB User ID of the other participant
 *     responses:
 *       200:
 *         description: Conversation initialized
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Conversation'
 *       400:
 *         description: Recipient ID is required
 *       401:
 *         description: Unauthorized
 */
router.post('/conversations', chatController.startConversation);

/**
 * @swagger
 * /api/v1/chat/messages/{conversationId}:
 *   get:
 *     summary: Get messages in a conversation
 *     description: Retrieves paginated messages for a conversation, ordered by creation time.
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of messages to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of messages to skip (for pagination)
 *     responses:
 *       200:
 *         description: Messages retrieved
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
 *                         $ref: '#/components/schemas/Message'
 *       500:
 *         description: Server error
 */
router.get('/messages/:conversationId', chatController.getMessages);

/**
 * @swagger
 * /api/v1/chat/messages/{conversationId}/read:
 *   put:
 *     summary: Mark messages as read
 *     description: Marks all messages in a conversation as read for the authenticated user.
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Messages marked as read
 *       401:
 *         description: Unauthorized
 */
router.put('/messages/:conversationId/read', chatController.markRead);

export default router;
