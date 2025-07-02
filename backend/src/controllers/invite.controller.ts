import { Request, Response } from 'express';
import { errorResponse } from '../utils/response';
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
      errorResponse(res, 401, "Erro ao enviar convite", undefined, "Usuário não autenticado.");
      return;
    }
    if (!receiverUsername) {
      errorResponse(res, 400, "Erro ao enviar convite", undefined, "Username do destinatário é obrigatório.");
      return;
    }

    const invite = await sendInvite(senderId, receiverUsername);
    res.status(201).json(invite);
  } catch (error: any) {
    errorResponse(res, 400, "Erro ao enviar convite", undefined, error.message);
  }
};

export const getPaginatedReceivedInvitesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = (req.query.sort as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    if (!userId) {
      errorResponse(res, 401, "Erro ao buscar convites recebidos", undefined, "Usuário não autenticado.");
      return;
    }

    const result = await listPaginatedReceivedInvites(userId, page, limit, sort);
    res.status(200).json(result);
  } catch (error: any) {
    errorResponse(res, 500, "Erro ao buscar convites recebidos", undefined, error.message);
  }
};

export const getPaginatedSentInvitesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = (req.query.sort as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    if (!userId) {
      errorResponse(res, 401, "Erro ao buscar convites enviados", undefined, "Usuário não autenticado.");
      return;
    }

    const result = await listPaginatedSentInvites(userId, page, limit, sort);
    res.status(200).json(result);
  } catch (error: any) {
    errorResponse(res, 500, "Erro ao buscar convites enviados", undefined, error.message);
  }
};

export const acceptInviteController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id: inviteId } = req.params;

    if (!userId) {
      errorResponse(res, 401, "Erro ao aceitar convite", undefined, "Usuário não autenticado.");
      return;
    }
    if (!inviteId) {
      errorResponse(res, 400, "Erro ao aceitar convite", undefined, "ID do convite não fornecido.");
      return;
    }

    const result = await acceptInvite(inviteId, userId);
    res.status(200).json(result);
  } catch (error: any) {
    errorResponse(res, 400, "Erro ao aceitar convite", undefined, error.message);
  }
};

export const rejectInviteController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id: inviteId } = req.params;

    if (!userId) {
      errorResponse(res, 401, "Erro ao rejeitar convite", undefined, "Usuário não autenticado.");
      return;
    }
    if (!inviteId) {
      errorResponse(res, 400, "Erro ao rejeitar convite", undefined, "ID do convite não fornecido.");
      return;
    }

    const result = await rejectInvite(inviteId, userId);
    res.status(200).json(result);
  } catch (error: any) {
    errorResponse(res, 400, "Erro ao rejeitar convite", undefined, error.message);
  }
};

export const cancelInviteController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id: inviteId } = req.params;

    if (!userId) {
      errorResponse(res, 401, "Erro ao cancelar convite", undefined, "Usuário não autenticado.");
      return;
    }
    if (!inviteId) {
      errorResponse(res, 400, "Erro ao cancelar convite", undefined, "ID do convite não fornecido.");
      return;
    }

    const result = await cancelInvite(inviteId, userId);
    res.status(200).json(result);
  } catch (error: any) {
    errorResponse(res, 400, "Erro ao cancelar convite", undefined, error.message);
  }
};
