import { Request, Response } from 'express';
import { uploadUserPhoto, getUserPhotoById, deleteUserPhoto } from '../services/userPhoto.service';

export const uploadPhotoController = async (req: Request, res: Response): Promise<void> => {
  const user = req.user;
  const file = req.file;

  if (!user || !file) {
    res.status(400).json({ error: 'Usuário ou arquivo não enviado.' });
    return;
  }

  await uploadUserPhoto(user.userId, file);
  res.status(200).json({ message: 'Foto enviada com sucesso.' });
}

export const getPhotoController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const photo = await getUserPhotoById(id);

    res.setHeader('Content-Type', photo.mimeType);
    res.send(photo.content);
  } catch (error: any) {
    res.status(404).json({ error: error.message || 'Erro ao buscar foto.' });
  }
}

export const deletePhotoController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const requester = req.user;

    if (!requester) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }

    // Somente o próprio usuário ou um admin (role '0') pode excluir
    if (requester.userId !== id && requester.role !== '0') {
      res.status(403).json({ error: 'Acesso negado. Você não pode excluir esta foto.' });
      return;
    }

    const result = await deleteUserPhoto(id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao excluir foto.' });
  }
}
