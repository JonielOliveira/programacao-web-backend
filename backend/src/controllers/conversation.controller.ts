import { Request, Response } from 'express';
import { getConversationByConnectionId } from '../services/conversation.service';

export const getConversationByConnectionController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
    }
    const { id: connectionId } = req.params;
    if (!connectionId) {
        res.status(400).json({ error: 'ID da conexão não fornecido.' });
        return;
    }
    const conversation = await getConversationByConnectionId(connectionId, userId);
    res.json(conversation);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
