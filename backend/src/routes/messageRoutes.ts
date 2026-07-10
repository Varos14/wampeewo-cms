import { Router } from 'express';
import { sendMessage, getConversations, getMessages } from '../controllers/messageController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Protect all message routes
router.use(requireAuth);

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/:userId', getMessages);

export default router;
