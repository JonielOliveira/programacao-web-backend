import { Request, Response } from 'express';
import { errorResponse } from '../utils/response';
import { uploadUserPhoto, getUserPhotoById, deleteUserPhoto } from '../services/userPhoto.service';

export const uploadPhotoController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const file = req.file;

    if (!userId) {
      errorResponse(res, 401, "Erro ao enviar foto", undefined, "Usuário não autenticado.");
      return;
    }
    if (!file) {
      errorResponse(res, 400, "Erro ao enviar foto", undefined, "Arquivo ausente na requisição.");
      return;
    }

    await uploadUserPhoto(userId, file);
    res.status(200).json({ message: 'Foto enviada com sucesso.' });
  } catch (error: any) {
    errorResponse(res, 400, "Erro ao enviar foto", undefined, error.message);
  }
}

export const getPhotoController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      errorResponse(res, 400, "Erro ao buscar foto", undefined, "ID da foto não fornecido.");
      return;
    }

    const photo = await getUserPhotoById(id);

    res.setHeader('Content-Type', photo.mimeType);
    res.send(photo.content);
  } catch (error: any) {
    errorResponse(res, 404, "Erro ao buscar foto", undefined, error.message);
  }
}

export const deletePhotoController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      errorResponse(res, 400, "Erro ao excluir foto", undefined, "ID da foto não fornecido.");
      return;
    }

    const result = await deleteUserPhoto(id);
    res.status(200).json(result);
  } catch (error: any) {
    errorResponse(res, 400, "Erro ao excluir foto", undefined, error.message);
  }
};
