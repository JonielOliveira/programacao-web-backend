import { Router } from 'express';
import { listConnectionsController } from '../controllers/connection.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, listConnectionsController);

export default router;
