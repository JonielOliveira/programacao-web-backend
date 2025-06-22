import { Router } from 'express';
import {
  sendInviteController,
  getPaginatedReceivedInvitesController,
  getPaginatedSentInvitesController,
  acceptInviteController,
  rejectInviteController,
  cancelInviteController,
} from '../controllers/invite.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/:id/accept', authMiddleware, acceptInviteController);
router.post('/:id/reject', authMiddleware, rejectInviteController);
router.delete('/:id/cancel', authMiddleware, cancelInviteController);
router.post('/', authMiddleware, sendInviteController);
router.get('/received', authMiddleware, getPaginatedReceivedInvitesController);
router.get('/sent', authMiddleware, getPaginatedSentInvitesController);

export default router;
