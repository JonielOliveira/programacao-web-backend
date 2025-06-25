import { Request, Response } from 'express';
import { listPaginatedConnections,
         deleteConnection,
         } from '../services/connection.service';

export const listConnectionsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const sort = (req.query.sort as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const result = await listPaginatedConnections(userId, page, limit, search, sort);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao listar conexões.' });
  }
};

export async function deleteConnectionController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const result = await deleteConnection(id, userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao excluir conexão.' });
  }
}
