import { Request, Response } from 'express';
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

    const result = await getPaginatedUsers(page, limit, orderBy, sort);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    res.json(user);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const createUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await updateUser(id, req.body);
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await deleteUser(id);
    res.json({ message: 'Usuário deletado com sucesso.', user: deleted });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
