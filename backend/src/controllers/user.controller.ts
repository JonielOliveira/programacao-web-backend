import { Request, Response } from 'express';
import { errorResponse } from '../utils/response';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getPaginatedUsers
} from '../services/user.service';

export const getAllUsersController = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const orderBy = (req.query.orderBy as string) || 'username';
    const sort = (req.query.sort as string)?.toLowerCase() === 'desc' ? 'desc' : 'asc';

    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const role = req.query.role as string | undefined;

    const result = await getPaginatedUsers(page, limit, orderBy, sort, search, status, role);
    res.json(result);
  } catch (error: any) {
    errorResponse(res, 500, "Erro ao buscar usuários", undefined, error.message);
  }
};

export const getUserByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    res.json(user);
  } catch (error: any) {
    errorResponse(res, 404, "Erro ao buscar usuário", undefined, error.message);
  }
};

export const createUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    errorResponse(res, 400, "Erro ao criar usuário", undefined, error.message);
  }
};

export const updateUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await updateUser(id, req.body);
    res.json(user);
  } catch (error: any) {
    errorResponse(res, 400, "Erro ao atualizar usuário", undefined, error.message);
  }
};

export const deleteUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await deleteUser(id);
    res.json({ message: "Usuário excluído com sucesso.", user: deleted });
  } catch (error: any) {
    errorResponse(res, 400, "Erro ao excluir usuário", undefined, error.message);
  }
};
