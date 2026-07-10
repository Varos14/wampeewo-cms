import { Router } from 'express';
import { sendMessage, getConversations, getMessages } from '../controllers/messageController';
import { requireAuth } from '../middleware/auth';

export const messageRoutes = Router();

// Protect all message routes
messageRoutes.use(requireAuth);

messageRoutes.post('/', sendMessage);
messageRoutes.get('/conversations', getConversations);
messageRoutes.get('/:userId', getMessages);

