import { Router } from 'express';
import { uploadPhotoController, 
         getPhotoController,
         deletePhotoController } from '../controllers/userPhoto.controller';
import { upload } from '../middlewares/upload.middleware';
import { authMiddleware, requireOwnership, requireRoleOrOwner } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:id/photo', authMiddleware, getPhotoController);
router.post('/:id/upload-photo', authMiddleware, requireOwnership('id'), upload.single('photo'), uploadPhotoController);
router.delete('/:id/photo', authMiddleware, requireRoleOrOwner(['0']), deletePhotoController);

export default router;
