import prisma from '../prisma/client';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { JWT_SECRET } from '../config/config';

interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthPayload;
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não fornecido ou inválido.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Verifica validade do token JWT
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;

    // 2. Busca todas as sessões válidas do usuário
    const sessions = await prisma.session.findMany({
      where: {
        userId: decoded.userId,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    // 3. Compara o token recebido com o hash armazenado
    let validSessionFound = false;

    for (const session of sessions) {
      const match = await bcrypt.compare(token, session.tokenHash);
      if (match) {
        validSessionFound = true;
        break;
      }
    }

    if (!validSessionFound) {
      res.status(401).json({ error: 'Sessão inválida ou expirada.' });
      return;
    }

    // 4. Token é válido e sessão também
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}
