import { Router } from 'express';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';
import {
  getAllUsersController,
  getUserByIdController,
  createUserController,
  updateUserController,
  deleteUserController
} from '../controllers/user.controller';

const router = Router();

// Todas as rotas de usuário são protegidas e acessíveis apenas por admin (role "0")
router.use(authMiddleware, requireRole(['0']));

router.get('/', getAllUsersController);
router.get('/:id', getUserByIdController);
router.post('/', createUserController);
router.put('/:id', updateUserController);
router.delete('/:id', deleteUserController);

export default router;
