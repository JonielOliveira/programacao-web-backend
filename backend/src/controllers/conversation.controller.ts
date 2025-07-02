import { Request, Response } from 'express';
import { errorResponse } from '../utils/response';
import { getConversationByConnectionId } from '../services/conversation.service';

export const getConversationByConnectionController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id: connectionId } = req.params;

    if (!userId) {
        errorResponse(res, 401, "Erro ao buscar conversa", undefined, "Usuário não autenticado.");
        return;
    }
    if (!connectionId) {
        errorResponse(res, 400, "Erro ao buscar conversa", undefined, "ID da conexão não fornecido.");
        return;
    }

    const conversation = await getConversationByConnectionId(connectionId, userId);
    res.status(200).json(conversation);
  } catch (error: any) {
    errorResponse(res, 400, "Erro ao buscar conversa", undefined, error.message);
  }
};
