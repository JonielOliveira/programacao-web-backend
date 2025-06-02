import prisma from '../prisma/client';

interface CreateMessageInput {
  senderId: string;
  receiverId: string;
  content: string;
}

interface UpdateMessageInput {
  content?: string;
  status?: 'SENT' | 'DELIVERED' | 'READ' | 'ARCHIVED';
  isDeleted?: boolean;
  deletedAt?: Date;
  readAt?: Date;
}

export async function getAllMessagesForUser(userId: string) {
  return prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId }
      ],
    },
    orderBy: {
      sentAt: 'desc',
    },
  });
}

export async function getConversationBetweenUsers(userAId: string, userBId: string) {
  return prisma.message.findMany({
    where: {
      OR: [
        { senderId: userAId, receiverId: userBId },
        { senderId: userBId, receiverId: userAId },
      ],
    },
    orderBy: {
      sentAt: 'asc', // ordem cronológica
    },
  });
}

export async function getMessageById(id: string) {
  const message = await prisma.message.findUnique({
    where: { id },
  });

  if (!message) {
    throw new Error('Mensagem não encontrada.');
  }

  return message;
}

export async function createMessage(data: CreateMessageInput) {
  return prisma.message.create({
    data: {
      senderId: data.senderId,
      receiverId: data.receiverId,
      content: data.content,
    },
  });
}

export async function updateMessage(id: string, data: UpdateMessageInput) {
  const existing = await prisma.message.findUnique({ where: { id } });
  if (!existing) throw new Error('Mensagem não encontrada.');

  return prisma.message.update({
    where: { id },
    data,
  });
}

export async function deleteMessage(id: string) {
  const existing = await prisma.message.findUnique({ where: { id } });
  if (!existing) throw new Error('Mensagem não encontrada.');

  return prisma.message.delete({
    where: { id },
  });
}
