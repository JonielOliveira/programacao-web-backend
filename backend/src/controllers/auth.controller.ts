import { Request, Response } from 'express';
import { login } from '../services/auth.service';

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
