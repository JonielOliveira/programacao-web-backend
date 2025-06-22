import { Request, Response } from 'express';
import { sendInvite, 
         listPaginatedReceivedInvites, 
         listPaginatedSentInvites,
         acceptInvite,
         rejectInvite,
         cancelInvite,
         } from '../services/invite.service';

export const sendInviteController = async (req: Request, res: Response): Promise<void> => {
  try {
    const senderId = req.user?.userId;
    const { receiverUsername } = req.body;

    if (!senderId) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }

    if (!receiverUsername) {
      res.status(400).json({ error: 'Username do destinatário é obrigatório.' });
      return;
    }

    const invite = await sendInvite(senderId, receiverUsername);
    res.status(201).json(invite);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getPaginatedReceivedInvitesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = (req.query.sort as string) === 'asc' ? 'asc' : 'desc';

    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }

    const result = await listPaginatedReceivedInvites(userId, page, limit, sort);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPaginatedSentInvitesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = (req.query.sort as string) === 'asc' ? 'asc' : 'desc';

    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }

    const result = await listPaginatedSentInvites(userId, page, limit, sort);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const acceptInviteController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: inviteId } = req.params;
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }

    const result = await acceptInvite(inviteId, user.userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao aceitar convite.' });
  }
};

export const rejectInviteController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: inviteId } = req.params;
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }

    const result = await rejectInvite(inviteId, user.userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao rejeitar convite.' });
  }
};

export const cancelInviteController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: inviteId } = req.params;
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }

    const result = await cancelInvite(inviteId, user.userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao cancelar convite.' });
  }
};
