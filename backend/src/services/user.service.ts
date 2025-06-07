import prisma from '../prisma/client';

interface CreateUserInput {
  username: string;
  email: string;
  fullName: string;
  role: string; // '0' (admin) ou '1' (usuário comum)
  status?: string; // 'A', 'I', 'B'
}

interface UpdateUserInput {
  username?: string;
  email?: string;
  fullName?: string;
  role?: string;
  status?: string;
}

export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
      status: true,
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
    },
  });

  if (!user) throw new Error('Usuário não encontrado.');

  return user;
}

export async function createUser(data: CreateUserInput) {
  return prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      status: data.status || 'A',
    },
  });
}

export async function updateUser(id: string, data: UpdateUserInput) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('Usuário não encontrado.');

  return prisma.user.update({
    where: { id },
    data,
  });
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
  sort: 'asc' | 'desc'
) {
  const skip = (page - 1) * limit;

  // Campos válidos para ordenação
  const allowedOrderFields = ['username', 'email', 'fullName', 'role', 'status'];

  const orderField = allowedOrderFields.includes(orderBy) ? orderBy : 'username';

  const [total, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      skip,
      take: limit,
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
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: users,
    total,
    page,
    limit,
    totalPages,
  };
}
