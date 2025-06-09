import { Router } from 'express';
import { loginController, logoutController, getMeController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Rota de login
router.post('/login', loginController);
router.post('/logout', authMiddleware, logoutController);
router.get('/me', authMiddleware, getMeController);

export default router;
