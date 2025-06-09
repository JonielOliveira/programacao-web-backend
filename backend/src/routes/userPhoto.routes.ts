import { Router } from 'express';
import { uploadPhotoController, 
         getPhotoController,
         deletePhotoController } from '../controllers/userPhoto.controller';
import { upload } from '../middlewares/upload.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:id/photo', authMiddleware, getPhotoController);
router.post('/upload-photo', authMiddleware, upload.single('photo'), uploadPhotoController);
router.delete('/:id/photo', authMiddleware, deletePhotoController);

export default router;
