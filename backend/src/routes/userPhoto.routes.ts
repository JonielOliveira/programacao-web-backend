import { Router } from 'express';
import { uploadPhotoController } from '../controllers/userPhoto.controller';
import { upload } from '../middlewares/upload.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/upload-photo', authMiddleware, upload.single('photo'), uploadPhotoController);

export default router;
