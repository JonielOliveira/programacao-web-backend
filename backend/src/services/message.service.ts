import prisma from '../prisma/client';
import { encryptMessage, decryptMessage } from '../utils/crypto.util';

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
  const messages = await prisma.message.findMany({
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

  return messages.map((msg) => ({
    ...msg,
    content: decryptMessage(msg.content, msg.iv),
  }));
}

export async function getConversationBetweenUsers(userAId: string, userBId: string) {
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userAId, receiverId: userBId },
        { senderId: userBId, receiverId: userAId },
      ],
    },
    orderBy: {
      sentAt: 'asc',
    },
  });

  return messages.map((msg) => ({
    ...msg,
    content: decryptMessage(msg.content, msg.iv),
  }));
}

export async function getMessageById(id: string) {
  const message = await prisma.message.findUnique({
    where: { id },
  });

  if (!message) {
    throw new Error('Mensagem não encontrada.');
  }

  return {
    ...message,
    content: decryptMessage(message.content, message.iv),
  };
}

export async function createMessage(data: CreateMessageInput) {
  const encrypted = encryptMessage(data.content);

  return prisma.message.create({
    data: {
      senderId: data.senderId,
      receiverId: data.receiverId,
      content: encrypted.content,
      iv: encrypted.iv,
    },
  });
}

export async function updateMessage(id: string, data: UpdateMessageInput) {
  const existing = await prisma.message.findUnique({ where: { id } });
  if (!existing) throw new Error('Mensagem não encontrada.');

  const updatedData: any = { ...data };

  if (data.content !== undefined) {
    const encrypted = encryptMessage(data.content);
    updatedData.content = encrypted.content;
    updatedData.iv = encrypted.iv;
  }

  return prisma.message.update({
    where: { id },
    data: updatedData,
  });
}

export async function deleteMessage(id: string) {
  const existing = await prisma.message.findUnique({ where: { id } });
  if (!existing) throw new Error('Mensagem não encontrada.');

  return prisma.message.delete({
    where: { id },
  });
}
