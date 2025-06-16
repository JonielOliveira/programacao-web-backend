import { Request, Response } from 'express';
import { login, logout, getMe, requestPasswordReset, changePassword } from '../services/auth.service';

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

export const requestPasswordResetController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'E-mail inválido.' });
      return;
    }

    // Tenta resetar a senha (silenciosamente se o usuário não existir)
    await requestPasswordReset(email);

    res.status(200).json({
      message: 'Se o e-mail informado estiver cadastrado, uma senha temporária foi enviada.',
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || 'Erro ao solicitar redefinição de senha.',
    });
  }
};

export const changePasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias.' });
      return;
    }

    const result = await changePassword({
      userId: user.userId,
      currentPassword,
      newPassword,
    });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao alterar senha.' });
  }
};
