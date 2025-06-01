import { Router } from 'express';
import { loginController } from '../controllers/auth.controller';

const router = Router();

// Rota de login
router.post('/login', loginController);

export default router;
