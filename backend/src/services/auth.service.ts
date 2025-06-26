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

  // 4. Validar a senha do usuário
  await verifyUserPassword(user.id, password);

  // 5. Gerar token
  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  // 6. Limpa sessões antigas, revogadas ou expiradas do usuário
  await cleanUserSessions(user.id, 3);

  // 7. Salvar sessão
  const expiresAt = addMilliseconds(new Date(), JWT_EXPIRES_IN_MS);
  const tokenHash = await bcrypt.hash(token, 10);

  await prisma.session.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  // 8. Incrementar accessCount
  await prisma.user.update({
    where: { id: user.id },
    data: { accessCount: { increment: 1 } },
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

export async function verifyUserPassword(userId: string, password: string) {
  const now = new Date();

  // 1. Busca as senhas válidas (não expiradas ou bloqueadas)
  const [tempPassword, permPassword] = await Promise.all([
    prisma.userPassword.findFirst({
      where: { userId: userId, isTemp: true, status: 'valid' },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.userPassword.findFirst({
      where: { userId: userId, isTemp: false, status: 'valid' },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // 2. Verificar senhas
  const passwordsToTry = [tempPassword, permPassword].filter(Boolean);

  if (passwordsToTry.length === 0) {
    throw new Error('Nenhuma senha válida encontrada.');
  }

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

    const qtdSenhas = passwordsToTry.length;
    let qtdBloqueadas = passwordsToTry.filter(s => s!.lockedUntil && s!.lockedUntil > now).length;

    for (const senha of passwordsToTry) {
      const novasTentativas = senha!.attempts + 1;
      const updates: any = { attempts: novasTentativas };

      if (novasTentativas >= senha!.maxAttempts) {
        updates.lockedUntil = new Date(now.getTime() + 15 * 60000);
        updates.lockoutLevel = 1; 
        updates.status = 'blocked';
        qtdBloqueadas++;
      }

      await prisma.userPassword.update({
        where: { id: senha!.id },
        data: updates,
      });
    }
    
    // Se todas as senhas foram bloqueadas, bloquear o usuário
    if (qtdBloqueadas === qtdSenhas) {
      await prisma.user.update({
        where: { id: userId },
        data: { status: 'B' },
      });
    }

    throw new Error('Senha incorreta.');
  }

  // 3. Resetar tentativas apenas da senha utilizada
  await prisma.userPassword.update({
    where: { id: senhaUtilizada!.id },
    data: { attempts: 0, lockedUntil: null, lockoutLevel: 0 },
  });

  return senhaUtilizada;
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

  let passwordWasUnblocked = false;

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
      passwordWasUnblocked = true;
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

  // Se a senha foi desbloqueada, liberar também o usuário, se estiver bloqueado
  if (passwordWasUnblocked) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.status === 'B') {
      await prisma.user.update({
        where: { id: userId },
        data: { status: 'A' },
      });
    }
  }
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

interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export async function changePassword({ userId, currentPassword, newPassword }: ChangePasswordInput) {

  // 1. Atualiza estados de senhas (expired, unlocked, etc)
  await refreshPasswordStates(userId);

  // 2. Verifica se a senha atual é válida (temporária ou permanente)
  await verifyUserPassword(userId, currentPassword);

  // 3. Criptografa a nova senha
  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  // 4. Verifica se já existe uma senha permanente
  const existingPerm = await prisma.userPassword.findFirst({
    where: { userId, isTemp: false },
    orderBy: { createdAt: 'desc' },
  });

  if (existingPerm) {
    // Atualiza a senha permanente existente
    await prisma.userPassword.update({
      where: { id: existingPerm.id },
      data: {
        passwordHash: newPasswordHash,
        attempts: 0,
        lockedUntil: null,
        lockoutLevel: 0,
        status: 'valid',
      },
    });
  } else {
    // Cria nova senha permanente
    await prisma.userPassword.create({
      data: {
        userId,
        passwordHash: newPasswordHash,
        isTemp: false,
        status: 'valid',
      },
    });
  }

  // 5. Invalida a senha temporária, se existir
  await prisma.userPassword.updateMany({
    where: { userId, isTemp: true, status: 'valid' },
    data: { status: 'expired' },
  });

  return { message: 'Senha atualizada com sucesso.' };
}

export async function cleanUserSessions(userId: string, maxSessions: number = 3) {
  const now = new Date();

  // 1. Remove sessões expiradas
  await prisma.session.deleteMany({
    where: {
      userId,
      expiresAt: { lt: now },
    },
  });

  // 2. Remove sessões revogadas
  await prisma.session.deleteMany({
    where: {
      userId,
      revoked: true,
    },
  });

  // 3. Mantém apenas (maxSessions - 1) válidas mais recentes
  const activeSessions = await prisma.session.findMany({
    where: {
      userId,
      revoked: false,
      expiresAt: { gte: now },
    },
    orderBy: { createdAt: 'desc' },
    skip: maxSessions - 1,
    select: { id: true },
  });

  if (activeSessions.length > 0) {
    await prisma.session.deleteMany({
      where: { id: { in: activeSessions.map((s) => s.id) } },
    });
  }
}
