import { Request, Response } from 'express';
import { errorResponse } from '../utils/response';
import { listPaginatedConnections,
         deleteConnection,
         } from '../services/connection.service';

export const listConnectionsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      errorResponse(res, 401, "Erro ao buscar conexões", undefined, "Usuário não autenticado.");
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string)?.trim() || undefined;
    const sort = (req.query.sort as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const result = await listPaginatedConnections(userId, page, limit, search, sort);
    res.status(200).json(result);
  } catch (error: any) {
    errorResponse(res, 500, "Erro ao buscar conexões", undefined, error.message);
  }
};

export async function deleteConnectionController(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id: connectionId } = req.params;

    if (!userId) {
      errorResponse(res, 401, "Erro ao excluir conexão", undefined, "Usuário não autenticado.");
      return;
    }
    if (!connectionId) {
      errorResponse(res, 400, "Erro ao excluir conexão", undefined, "ID da conexão não fornecido.");
      return;
    }

    const result = await deleteConnection(connectionId, userId);
    res.status(200).json(result);
  } catch (error: any) {
    errorResponse(res, 400, "Erro ao excluir conexão", undefined, error.message);
  }
}
