import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { getConversationByConnectionController } from '../controllers/conversation.controller';

const router = Router();

router.get('/connection/:id', authMiddleware, getConversationByConnectionController);

export default router;
