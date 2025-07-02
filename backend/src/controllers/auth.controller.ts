import { Request, Response } from 'express';
import { errorResponse } from '../utils/response';
import { login, logout, getMe, requestPasswordReset, changePassword } from '../services/auth.service';

export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validação simples de entrada
    if (!email || !password) {
      errorResponse(res, 400, "Erro ao fazer login", undefined, "Email e senha são obrigatórios.");
      return;
    }

    // Chama o serviço de login
    const { token, user } = await login({ email, password });

    // Retorna token e dados do usuário
    res.status(200).json({ token, user });

  } catch (error: any) {
    errorResponse(res, 401, "Erro ao fazer login", undefined, error.message);
    return;
  }
};

export const logoutController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const token = req.headers.authorization?.split(' ')[1];

    if (!userId) {
      errorResponse(res, 401, "Erro ao fazer logout", undefined, "Usuário não autenticado.");
      return;
    }
    if (!token) {
      errorResponse(res, 400, "Erro ao fazer logout", undefined, "Token não fornecido.");
      return;
    }

    const result = await logout(userId, token);
    res.status(200).json(result);
  } catch (error: any) {
    errorResponse(res, 400, "Erro ao fazer logout", undefined, error.message);
    return;
  }
};

export const getMeController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      errorResponse(res, 401, "Erro ao obter informações do usuário autenticado", undefined, "Usuário não autenticado.");
      return;
    }

    const user = await getMe(userId);
    res.status(200).json(user);
  } catch (error: any) {
    errorResponse(res, 400, "Erro ao obter informações do usuário autenticado", undefined, error.message);
  }
};

export const requestPasswordResetController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      errorResponse(res, 400, "Erro ao solicitar redefinição de senha", undefined, "E-mail inválido.");
      return;
    }

    // Tenta resetar a senha (silenciosamente se o usuário não existir)
    await requestPasswordReset(email);

    res.status(200).json({
      message: 'Se o e-mail informado estiver cadastrado, uma senha temporária foi enviada.',
    });
  } catch (error: any) {
    errorResponse(res, 400, "Erro ao solicitar redefinição de senha", undefined, error.message);
  }
};

export const changePasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      errorResponse(res, 401, "Erro ao alterar senha", undefined, "Usuário não autenticado.");
      return;
    }
    if (!currentPassword || !newPassword) {
      errorResponse(res, 400, "Erro ao alterar senha", undefined, "Senha atual e nova senha são obrigatórias.");
      return;
    }

    const result = await changePassword({
      userId: userId,
      currentPassword,
      newPassword,
    });

    res.status(200).json(result);
  } catch (error: any) {
    errorResponse(res, 400, "Erro ao alterar senha", undefined, error.message);
  }
};
