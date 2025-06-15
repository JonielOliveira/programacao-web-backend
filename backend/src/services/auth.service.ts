import prisma from '../prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN, JWT_EXPIRES_IN_MS } from '../config/config';
import { addMilliseconds, addMinutes } from 'date-fns';
import { Session } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { sendTemporaryPasswordEmail } from '../utils/email.util';

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

  // 3. Atualiza estados de senha antes de login
  await refreshPasswordStates(user.id);

  // 4. Busca as senhas válidas (não expiradas ou bloqueadas)
  const [tempPassword, permPassword] = await Promise.all([
    prisma.userPassword.findFirst({
      where: { userId: user.id, isTemp: true, status: 'valid' },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.userPassword.findFirst({
      where: { userId: user.id, isTemp: false, status: 'valid' },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // 5. Verificar senhas
  const passwordsToTry = [tempPassword, permPassword].filter(Boolean);

  if (passwordsToTry.length === 0) {
    throw new Error('Nenhuma senha válida encontrada.');
  }

  const now = new Date();
  let senhaValida = false;
  let senhaUtilizada: typeof tempPassword | typeof permPassword = null;

  for (const senha of passwordsToTry) {
    // Verifica bloqueio
    if (senha!.lockedUntil && senha!.lockedUntil > now) continue;

    const match = await bcrypt.compare(password, senha!.passwordHash);
    if (match) {
      senhaValida = true;
      senhaUtilizada = senha;
      break;
    }
  }

  if (!senhaValida) {
    for (const senha of passwordsToTry) {
      const novasTentativas = senha!.attempts + 1;
      const updates: any = { attempts: novasTentativas };

      if (novasTentativas >= senha!.maxAttempts) {
        updates.lockedUntil = new Date(now.getTime() + 15 * 60000);
        updates.lockoutLevel = 1; 
        updates.status = 'blocked';
      }

      await prisma.userPassword.update({
        where: { id: senha!.id },
        data: updates,
      });
    }

    throw new Error('Senha incorreta.');
  }

  // 6. Resetar tentativas apenas da senha utilizada
  await prisma.userPassword.update({
    where: { id: senhaUtilizada!.id },
    data: { attempts: 0, lockedUntil: null },
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

  // 8. Salvar sessão
  const expiresAt = addMilliseconds(new Date(), JWT_EXPIRES_IN_MS);
  const tokenHash = await bcrypt.hash(token, 10);

  await prisma.session.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  // 9. Incrementar accessCount
  await prisma.user.update({
    where: { id: user.id },
    data: { accessCount: { increment: 1 } },
  });

  // 10. Retornar token e dados do usuário
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

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      fullName: true,
      email: true,
      role: true,
      status: true,
      accessCount: true,
    },
  });

  if (!user) {
    throw new Error('Usuário não encontrado.');
  }

  return user;
}

export async function refreshPasswordStates(userId: string): Promise<void> {
  const now = new Date();

  // Função interna para aplicar as atualizações de consistência
  async function refresh(passwordId: string) {
    const password = await prisma.userPassword.findUnique({ where: { id: passwordId } });
    if (!password) return;

    const updates: any = {};

    // Se estiver bloqueado mas o tempo de bloqueio já passou
    if (password.lockedUntil && password.lockedUntil <= now && password.status === 'blocked') {
      updates.lockedUntil = null;
      updates.lockoutLevel = 0;
      updates.attempts = 0;
      updates.status = 'valid';
    }

    // Se já expirou (e ainda não foi marcado como expirado)
    if (password.isTemp && password.expiresAt && password.expiresAt <= now && (password.status === 'valid' || updates.status)) {
      updates.status = 'expired';
    }

    if (Object.keys(updates).length > 0) {
      await prisma.userPassword.update({
        where: { id: password.id },
        data: updates,
      });
    }
  }

  // Busca senha temporária
  const existingTemp = await prisma.userPassword.findFirst({
    where: { userId, isTemp: true },
    orderBy: { createdAt: 'desc' },
  });

  // Busca senha permanente
  const existingPerm = await prisma.userPassword.findFirst({
    where: { userId, isTemp: false },
    orderBy: { createdAt: 'desc' },
  });

  // Executa reconciliação em ambas, se existirem
  if (existingTemp) await refresh(existingTemp.id);
  if (existingPerm) await refresh(existingPerm.id);
}

export async function requestPasswordReset(email: string): Promise<void> {
  // 1. Busca o usuário com base no e-mail
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // 2. Se não existir, retorna silenciosamente (não revela)
  if (!user) return;

  // 3. Atualiza estados de senhas para o usuário
  await refreshPasswordStates(user.id);

  // 4. Gera uma senha temporária
  const tempPassword = uuidv4().slice(0, 8); // 8 caracteres
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  
  // 5. Verifica se já existe uma senha temporária
  const existingTemp = await prisma.userPassword.findFirst({
    where: {
      userId: user.id,
      isTemp: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // 6. Se existir, atualiza ou cria uma nova senha temporária
  if (existingTemp) {

    const now = new Date();

    // Verificações permanecem
    if (existingTemp.lockedUntil && existingTemp.lockedUntil > now) {
      throw new Error('Sua conta está temporariamente bloqueada. Tente novamente mais tarde.');
    }

    if (existingTemp.expiresAt && existingTemp.expiresAt > now) {
      throw new Error('Já existe uma senha temporária ativa. Verifique seu e-mail.');
    }

    // Aqui sim, substitui por nova senha
    await prisma.userPassword.update({
      where: { id: existingTemp.id },
      data: {
        passwordHash,
        attempts: 0,
        lockedUntil: null,
        lockoutLevel: 0,
        status: 'valid',
        expiresAt: addMinutes(new Date(), 15),
      },
    });
    await sendTemporaryPasswordEmail(user, tempPassword);
  } else {
    // Criação normal
    await prisma.userPassword.create({
      data: {
        userId: user.id,
        passwordHash,
        isTemp: true,
        status: 'valid',
        expiresAt: addMinutes(new Date(), 15),
      },
    });
    await sendTemporaryPasswordEmail(user, tempPassword);
  }
}
