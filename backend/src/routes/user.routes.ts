import { Router } from 'express';
import { authMiddleware, requireRole, requireRoleOrOwner } from '../middlewares/auth.middleware';
import {
  getAllUsersController,
  getUserByIdController,
  createUserController,
  updateUserController,
  deleteUserController
} from '../controllers/user.controller';

const router = Router();

router.get('/', authMiddleware, requireRole(['0']), getAllUsersController);
router.get('/:id', authMiddleware, requireRoleOrOwner(['0']), getUserByIdController);
router.post('/', authMiddleware, requireRole(['0']), createUserController);
router.put('/:id', authMiddleware, requireRoleOrOwner(['0']), updateUserController);
router.delete('/:id', authMiddleware, requireRole(['0']), deleteUserController);

export default router;
