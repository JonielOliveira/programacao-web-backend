import { Request, Response } from 'express';
import { login, logout, getMe } from '../services/auth.service';

export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validação simples de entrada
    if (!email || !password) {
      res.status(400).json({ error: 'Email e senha são obrigatórios.' });
      return;
    }

    // Chama o serviço de login
    const { token, user } = await login({ email, password });

    // Retorna token e dados do usuário
    res.status(200).json({ token, user });

  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Erro no login.' });
    return;
  }
};

export const logoutController = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const user = req.user;

    if (!user || !token) {
      res.status(400).json({ error: 'Usuário ou token não fornecido.' });
      return;
    }

    const result = await logout(user.userId, token);
    res.status(200).json(result);
    return;
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao fazer logout.' });
    return;
  }
};

export const getMeController = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }

    const user = await getMe(req.user.userId);
    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao buscar usuário.' });
  }
};

