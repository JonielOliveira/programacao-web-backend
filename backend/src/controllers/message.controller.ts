import { Request, Response } from 'express';
import {
  getAllMessagesByConversationId,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage
} from '../services/message.service';

export const getAllMessagesByConversationController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id: conversationId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }
    if (!conversationId) {
      res.status(400).json({ error: 'ID da conversa não fornecido.' });
      return;
    }

    const messages = await getAllMessagesByConversationId({ conversationId, userId });
    res.status(200).json(messages);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMessageByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id: conversationId, msgId: messageId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }
    if (!conversationId) {
      res.status(400).json({ error: 'ID da conversa não fornecido.' });
      return;
    }
    if (!messageId) {
      res.status(400).json({ error: 'ID da mensagem não fornecido.' });
      return;
    }

    const message = await getMessageById({ conversationId, messageId, userId });
    res.status(200).json(message);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const createMessageController = async (req: Request, res: Response): Promise<void> => {
  try {
    const senderId = req.user?.userId;
    const { id: conversationId } = req.params;
    const { content } = req.body;
    
    if (!senderId) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    } 
    if (!conversationId) {
      res.status(400).json({ error: 'ID da conversa não fornecido.' });
      return;
    }
    if (!content || content.trim() === '') {
      res.status(400).json({ error: 'O conteúdo da mensagem não pode ser vazio.' });
      return;
    }

    const message = await createMessage({ conversationId, senderId, content });
    res.status(201).json(message);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateMessageController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id: conversationId, msgId: messageId } = req.params;
    const { content } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    } 
    if (!conversationId) {
      res.status(400).json({ error: 'ID da conversa não fornecido.' });
      return;
    }
    if (!messageId) {
      res.status(400).json({ error: 'ID da mensagem não fornecido.' });
      return;
    }
    if (!content || content.trim() === '') {
      res.status(400).json({ error: 'O conteúdo da mensagem não pode ser vazio.' });
      return;
    }

    const message = await updateMessage({ conversationId, messageId, userId, content });
    res.status(200).json(message);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteMessageController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id: conversationId, msgId: messageId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }
    if (!conversationId) {
      res.status(400).json({ error: 'ID da conversa não fornecido.' });
      return;
    }
    if (!messageId) {
      res.status(400).json({ error: 'ID da mensagem não fornecido.' });
      return;
    }

    const result = await deleteMessage({ conversationId, messageId, userId });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
