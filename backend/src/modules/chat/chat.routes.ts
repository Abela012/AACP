import express from 'express';
import * as chatController from './chat.controller';
import { requireAuth } from '../../middlewares/auth.middleware';

const router = express.Router();

/**
 * Chat Routes
 * Base: /api/v1/chat
 */

router.use(requireAuth); // All chat routes require authentication

router.get('/conversations', chatController.getConversations);
router.post('/conversations', chatController.startConversation);
router.get('/messages/:conversationId', chatController.getMessages);
router.put('/messages/:conversationId/read', chatController.markRead);

export default router;
