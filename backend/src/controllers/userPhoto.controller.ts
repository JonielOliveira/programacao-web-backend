import { Request, Response } from 'express';
import { uploadUserPhoto, getUserPhotoById } from '../services/userPhoto.service';

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
