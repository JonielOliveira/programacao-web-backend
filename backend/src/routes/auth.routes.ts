import { Router } from 'express';
import { loginController, 
         logoutController, 
         getMeController,
         requestPasswordResetController,
         changePasswordController
       } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Rota de login
router.post('/login', loginController);
router.post('/logout', authMiddleware, logoutController);
router.get('/me', authMiddleware, getMeController);
router.post('/request-password-reset', requestPasswordResetController);
router.post('/change-password', authMiddleware, changePasswordController);

export default router;
