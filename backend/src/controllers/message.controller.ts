import { Request, Response } from 'express';
import { errorResponse } from '../utils/response';
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
      errorResponse(res, 401, "Erro ao buscar mensagens", undefined, "Usuário não autenticado.");
      return;
    }
    if (!conversationId) {
      errorResponse(res, 400, "Erro ao buscar mensagens", undefined, "ID da conversa não fornecido.");
      return;
    }

    const messages = await getAllMessagesByConversationId({ conversationId, userId });
    res.status(200).json(messages);
  } catch (error: any) {
    errorResponse(res, 400, "Erro ao buscar mensagens", undefined, error.message);
  }
};

export const getMessageByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id: conversationId, msgId: messageId } = req.params;

    if (!userId) {
      errorResponse(res, 401, "Erro ao buscar mensagem", undefined, "Usuário não autenticado.");
      return;
    }
    if (!conversationId) {
      errorResponse(res, 400, "Erro ao buscar mensagem", undefined, "ID da conversa não fornecido.");
      return;
    }
    if (!messageId) {
      errorResponse(res, 400, "Erro ao buscar mensagem", undefined, "ID da mensagem não fornecido.");
      return;
    }

    const message = await getMessageById({ conversationId, messageId, userId });
    res.status(200).json(message);
  } catch (error: any) {
    errorResponse(res, 400, "Erro ao buscar mensagem", undefined, error.message);
  }
};

export const createMessageController = async (req: Request, res: Response): Promise<void> => {
  try {
    const senderId = req.user?.userId;
    const { id: conversationId } = req.params;
    const { content } = req.body;
    
    if (!senderId) {
      errorResponse(res, 401, "Erro ao criar mensagem", undefined, "Usuário não autenticado.");
      return;
    } 
    if (!conversationId) {
      errorResponse(res, 400, "Erro ao criar mensagem", undefined, "ID da conversa não fornecido.");
      return;
    }
    if (!content || content.trim() === '') {
      errorResponse(res, 400, "Erro ao criar mensagem", undefined, "O conteúdo da mensagem não pode ser vazio.");
      return;
    }

    const message = await createMessage({ conversationId, senderId, content });
    res.status(201).json(message);
  } catch (error: any) {
    errorResponse(res, 400, "Erro ao criar mensagem", undefined, error.message);
  }
};

export const updateMessageController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id: conversationId, msgId: messageId } = req.params;
    const { content } = req.body;

    if (!userId) {
      errorResponse(res, 401, "Erro ao atualizar mensagem", undefined, "Usuário não autenticado.");      
      return;
    } 
    if (!conversationId) {
      errorResponse(res, 400, "Erro ao atualizar mensagem", undefined, "ID da conversa não fornecido.");
      return;
    }
    if (!messageId) {
      errorResponse(res, 400, "Erro ao atualizar mensagem", undefined, "ID da mensagem não fornecido.");
      return;
    }
    if (!content || content.trim() === '') {
      errorResponse(res, 400, "Erro ao atualizar mensagem", undefined, "O conteúdo da mensagem não pode ser vazio.");
      return;
    }

    const message = await updateMessage({ conversationId, messageId, userId, content });
    res.status(200).json(message);
  } catch (error: any) {
    errorResponse(res, 400, "Erro ao atualizar mensagem", undefined, error.message);
  }
};

export const deleteMessageController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id: conversationId, msgId: messageId } = req.params;

    if (!userId) {
      errorResponse(res, 401, "Erro ao excluir mensagem", undefined, "Usuário não autenticado.");
      return;
    }
    if (!conversationId) {
      errorResponse(res, 400, "Erro ao excluir mensagem", undefined, "ID da conversa não fornecido.");
      return;
    }
    if (!messageId) {
      errorResponse(res, 400, "Erro ao excluir mensagem", undefined, "ID da mensagem não fornecido.");
      return;
    }

    const result = await deleteMessage({ conversationId, messageId, userId });
    res.status(200).json(result);
  } catch (error: any) {
    errorResponse(res, 400, "Erro ao excluir mensagem", undefined, error.message);
  }
};
