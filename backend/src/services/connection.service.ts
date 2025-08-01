import prisma from '../prisma/client';
import { Prisma } from '@prisma/client';

export async function listPaginatedConnections(
  userId: string,
  page: number,
  limit: number,
  search?: string,
  sort: 'asc' | 'desc' = 'desc'
) {
  const skip = (page - 1) * limit;

  const whereA = {
    userAId: userId,
    ...(search
      ? {
          userB: {
            is: {
              OR: [
                { username: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
                { fullName: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
              ],
            },
          },
        }
      : {}),
  };

  const whereB = {
    userBId: userId,
    ...(search
      ? {
          userA: {
            is: {
              OR: [
                { username: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
                { fullName: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
              ],
            },
          },
        }
      : {}),
  };

  const [totalA, connectionsAsA, totalB, connectionsAsB] = await Promise.all([
    prisma.connection.count({ where: whereA }),
    prisma.connection.findMany({
      where: whereA,
      select: {
        id: true,
        createdAt: true,
        userB: {
          select: { id: true, username: true, fullName: true },
        },
      },
    }),
    prisma.connection.count({ where: whereB }),
    prisma.connection.findMany({
      where: whereB,
      select: {
        id: true,
        createdAt: true,
        userA: {
          select: { id: true, username: true, fullName: true },
        },
      },
    }),
  ]);

  const connections = [...connectionsAsA, ...connectionsAsB].map((conn) => ({
    id: conn.id,
    createdAt: conn.createdAt,
    user: 'userA' in conn ? conn.userA : conn.userB,
  }));

  const sorted = connections.sort((a, b) =>
    sort === 'asc'
      ? a.user.fullName.localeCompare(b.user.fullName, 'pt-BR')
      : b.user.fullName.localeCompare(a.user.fullName, 'pt-BR')
  );

  const paginated = sorted.slice(skip, skip + limit);
  const total = totalA + totalB;
  const totalPages = Math.ceil(total / limit);
  const currentPage = total === 0 ? 0 : page;

  return {
    data: paginated,
    total,
    page: currentPage,
    limit,
    totalPages,
  };
}

export async function deleteConnection(connectionId: string, userId: string) {
  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) {
    throw new Error('Conexão não encontrada.');
  }

  if (connection.userAId !== userId && connection.userBId !== userId) {
    throw new Error('Você não tem permissão para excluir essa conexão.');
  }

  await prisma.connection.delete({
    where: { id: connectionId },
  });

  return { message: 'Conexão excluída com sucesso.' };
}
