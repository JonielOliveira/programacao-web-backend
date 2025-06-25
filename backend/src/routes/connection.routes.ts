import { Router } from 'express';
import { listConnectionsController,
         deleteConnectionController,
       } from '../controllers/connection.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.delete('/:id', authMiddleware, deleteConnectionController);
router.get('/', authMiddleware, listConnectionsController);

export default router;
