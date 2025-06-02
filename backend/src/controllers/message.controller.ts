import { Request, Response } from 'express';
import {
  getAllMessagesForUser,
  getConversationBetweenUsers,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage
} from '../services/message.service';

export const getAllMessagesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
    }
    const messages = await getAllMessagesForUser(userId);
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getConversationController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userAId = req.user?.userId;
    const userBId = req.params.userId;

    if (!userAId) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
    } 

    const messages = await getConversationBetweenUsers(userAId, userBId);
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMessageByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const message = await getMessageById(id);
    res.json(message);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const createMessageController = async (req: Request, res: Response): Promise<void> => {
  try {
    const senderId = req.user?.userId;
    const { receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
      res.status(400).json({ error: 'Dados incompletos.' });
      return;
    }

    const message = await createMessage({ senderId, receiverId, content });
    res.status(201).json(message);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateMessageController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const message = await updateMessage(id, req.body);
    res.json(message);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteMessageController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await deleteMessage(id);
    res.json({ message: 'Mensagem excluída com sucesso.', deleted });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
