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
