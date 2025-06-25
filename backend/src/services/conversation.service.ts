import prisma from '../prisma/client';

export async function getConversationByConnectionId(connectionId: string, userId: string) {
  // Verifica se a conexão existe
  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
    select: { userAId: true, userBId: true },
  });
  if (!connection) {
    throw new Error('Conexão não encontrada.');
  }

  // Verifica se o usuário faz parte da conexão
  if (connection.userAId !== userId && connection.userBId !== userId) {
    throw new Error('Acesso negado. Você não faz parte desta conexão.');
  }

  const conversation = await prisma.conversation.findUnique({
    where: { connectionId },
    include: {
      messages: {
        orderBy: { sentAt: 'asc' },
        select: {
          id: true,
          content: true,
          iv: true,
          sentAt: true,
          readAt: true,
          status: true,
          senderId: true,
          receiverId: true,
          isDeleted: true,
        },
      },
    },
  });

  if (!conversation) {
    throw new Error('Conversa não encontrada para esta conexão.');
  }

  return conversation;
}
