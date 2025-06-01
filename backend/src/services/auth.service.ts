import prisma from '../prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto'; // Idealmente em .env
const JWT_EXPIRES_IN = '1h'; // Ajustável

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

  // 8. Retornar token e dados do usuário
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
