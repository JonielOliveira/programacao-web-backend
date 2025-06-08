import prisma from '../prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN, JWT_EXPIRES_IN_MS } from '../config/config';
import { addMilliseconds } from 'date-fns';
import { Session } from '@prisma/client';

interface LoginInput {
  email: string;
  password: string;
}

export async function login({ email, password }: LoginInput) {
  // 1. Buscar usuário por email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Credenciais inválidas.');
  }

  // 2. Verificar status do usuário
  if (user.status !== 'A') {
    throw new Error('Usuário inativo ou bloqueado.');
  }

  // 3. Buscar a senha mais recente e válida
  const latestPassword = await prisma.userPassword.findFirst({
    where: {
      userId: user.id,
      status: 'valid',
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!latestPassword) {
    throw new Error('Senha não encontrada ou expirada.');
  }

  // 4. Verificar bloqueio temporário
  const now = new Date();
  if (latestPassword.lockedUntil && latestPassword.lockedUntil > now) {
    throw new Error('Usuário temporariamente bloqueado. Tente novamente mais tarde.');
  }

  // 5. Verificar senha
  const senhaValida = await bcrypt.compare(password, latestPassword.passwordHash);

  if (!senhaValida) {
    // Incrementar tentativa
    const novasTentativas = latestPassword.attempts + 1;

    const atualizacoes: any = {
      attempts: novasTentativas,
    };

    if (novasTentativas >= latestPassword.maxAttempts) {
      atualizacoes.lockedUntil = new Date(now.getTime() + 15 * 60000); // 15 minutos
      atualizacoes.status = 'blocked';
    }

    await prisma.userPassword.update({
      where: { id: latestPassword.id },
      data: atualizacoes,
    });

    throw new Error('Senha incorreta.');
  }

  // 6. Resetar tentativas
  await prisma.userPassword.update({
    where: { id: latestPassword.id },
    data: {
      attempts: 0,
      lockedUntil: null,
    },
  });

  // 7. Gerar token
  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  const expiresAt: Date = addMilliseconds(new Date(), JWT_EXPIRES_IN_MS);

  // 8. Salvar sessão
  const tokenHash = await bcrypt.hash(token, 10);
  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt
    }
  });

  // 9. Retornar token e dados do usuário
  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
}

export async function logout(userId: string, token: string) {
  // 1. Buscar todas as sessões válidas do usuário
  const sessions = await prisma.session.findMany({
    where: {
      userId,
      revoked: false,
      expiresAt: { gt: new Date() },
    },
  });

  // 2. Procurar a sessão cujo tokenHash bate com o token fornecido
  let matchedSession = null;

  for (const session of sessions) {
    const match = await bcrypt.compare(token, session.tokenHash);
    if (match) {
      matchedSession = session;
      break;
    }
  }

  if (!matchedSession) {
    throw new Error('Sessão não encontrada ou token inválido.');
  }

  // 3. Revogar a sessão
  await prisma.session.update({
    where: { id: matchedSession.id },
    data: { revoked: true },
  });

  return { message: 'Logout realizado com sucesso.' };
}
