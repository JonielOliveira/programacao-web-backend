import prisma from '../prisma/client';
import { CreateUserInput, UpdateUserInput } from '../types/user';
import { validateUserInput } from '../utils/validators';
import { sanitizeCreateUserInput, sanitizeUpdateUserInput } from '../utils/sanitizers';

export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
      status: true,
      accessCount: true,
    },
  });
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
      status: true,
      accessCount: true,
    },
  });

  if (!user) throw new Error('Usuário não encontrado.');

  return user;
}

export async function createUser(data: CreateUserInput) {
  // Sanitiza os dados de entrada
  const sanitizedData = sanitizeCreateUserInput(data); 
  
  // Validação dos campos existentes
  validateUserInput(sanitizedData);

  const { username, email, fullName, role, status } = sanitizedData;

  // Verificações de unicidade
  const [existingUsername, existingEmail] = await Promise.all([
    prisma.user.findUnique({ where: { username } }),
    prisma.user.findUnique({ where: { email } }),
  ]);

  if (existingUsername) {
    throw new Error("Já existe um usuário com esse username.");
  }

  if (existingEmail) {
    throw new Error("Já existe um usuário com esse e-mail.");
  }

  // Criação do usuário
  return prisma.user.create({
    data: {
      username,
      email,
      fullName,
      role,
      status,
    },
  });
}

export async function updateUser(id: string, data: UpdateUserInput) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("Usuário não encontrado.");

  const sanitizedData = sanitizeUpdateUserInput(data);

  // Valida os campos que foram passados
  validateUserInput(sanitizedData);

  const { username, email } = sanitizedData;

  // Verifica se novo username já está em uso (por outro usuário)
  if (username && username !== user.username) {
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      throw new Error("Já existe um usuário com esse username.");
    }
  }

  // Verifica se novo email já está em uso (por outro usuário)
  if (email && email !== user.email) {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      throw new Error("Já existe um usuário com esse e-mail.");
    }
  }

  // Atualiza o usuário com os campos sanitizados
  const updatedUser = prisma.user.update({
    where: { id },
    data: sanitizedData,
  });

  const { status: inputStatus } = sanitizedData;

  // Se o status foi alterado para 'A' (ativo), desbloqueia senhas bloqueadas
  if (inputStatus === 'A' && user.status !== 'A') {
    const [tempPassword, permPassword] = await Promise.all([
      prisma.userPassword.findFirst({
        where: { userId: id, isTemp: true, status: 'blocked' },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.userPassword.findFirst({
        where: { userId: id, isTemp: false, status: 'blocked' },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const updates = [];

    if (tempPassword) {
      updates.push(
        prisma.userPassword.update({
          where: { id: tempPassword.id },
          data: {
            lockedUntil: null,
            lockoutLevel: 0,
            attempts: 0,
            status: 'valid',
          },
        })
      );
    }

    if (permPassword) {
      updates.push(
        prisma.userPassword.update({
          where: { id: permPassword.id },
          data: {
            lockedUntil: null,
            lockoutLevel: 0,
            attempts: 0,
            status: 'valid',
          },
        })
      );
    }

    await Promise.all(updates);
  }

  return updatedUser;
}

export async function deleteUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('Usuário não encontrado.');

  return prisma.user.delete({ where: { id } });
}

export async function getPaginatedUsers(
  page: number,
  limit: number,
  orderBy: string,
  sort: 'asc' | 'desc',
  search?: string,
  status?: string,
  role?: string
) {
  const skip = (page - 1) * limit;

  // Campos válidos para ordenação
  const allowedOrderFields = ['username', 'email', 'fullName', 'role', 'status'];
  const orderField = allowedOrderFields.includes(orderBy) ? orderBy : 'username';

  // Filtros
  const where: any = {};

  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { fullName: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (role) {
    where.role = role;
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      skip,
      take: limit,
      where,
      orderBy: {
        [orderField]: sort,
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        accessCount: true,
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const currentPage = total === 0 ? 0 : page;

  return {
    data: users,
    total,
    page: currentPage,
    limit,
    totalPages,
  };
}
