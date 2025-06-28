import prisma from '../prisma/client';
import { encryptMessage, decryptMessage } from '../utils/crypto.util';

type GetMessagesByConversationParams = {
  conversationId: string;
  userId: string;
};

interface GetMessageByIdParams {
  messageId: string;
  conversationId: string;
  userId: string;
};

interface CreateMessageInput {
  conversationId: string;
  senderId: string;
  content: string;
};

interface UpdateMessageInput {
  conversationId: string,
  messageId: string,
  userId: string,
  content: string;
};

interface DeleteMessageParams {
  conversationId: string;
  messageId: string;
  userId: string;
};

export async function getAllMessagesByConversationId({
  conversationId,
  userId,
}: GetMessagesByConversationParams) {
  // Verifica se o usuário faz parte da conversa
  const connection = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      connection: {
        select: {
          userAId: true,
          userBId: true,
        },
      },
    },
  });

  if (!connection) {
    throw new Error('Conversa não encontrada.');
  }

  const { userAId, userBId } = connection.connection;
  if (userId !== userAId && userId !== userBId) {
    throw new Error('Você não tem permissão para acessar esta conversa.');
  }

  // Busca todas as mensagens da conversa
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { sentAt: 'asc' },
    select: {
      id: true,
      content: true,
      iv: true,
      sentAt: true,
      isDeleted: true,
      isUpdated: true,
      senderId: true,
      receiverId: true,
    },
  });

  return messages.map((msg) => ({
    id: msg.id,
    content: msg.isDeleted ? null : decryptMessage(msg.content, msg.iv),
    sentAt: msg.sentAt,
    isUpdated: msg.isUpdated,
    isDeleted: msg.isDeleted,
    isOwnMessage: msg.senderId === userId,
  }));
}

export async function getMessageById({ conversationId, messageId, userId }: GetMessageByIdParams) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: {
      id: true,
      conversationId: true,
      content: true,
      iv: true,
      sentAt: true,
      isUpdated: true,
      isDeleted: true,
      senderId: true,
      receiverId: true,
    },
  });

  if (!message) throw new Error('Mensagem não encontrada.');
  if (message.conversationId !== conversationId) throw new Error('Mensagem não pertence à conversa.');
  const isOwnMessage = userId === message.senderId;
  if (!isOwnMessage && message.receiverId !== userId) {
    throw new Error('Você não tem permissão para acessar esta mensagem.');
  }

  return {
    id: message.id,
    content: message.isDeleted ? null : decryptMessage(message.content, message.iv),
    sentAt: message.sentAt,
    isUpdated: message.isUpdated,
    isDeleted: message.isDeleted,
    isOwnMessage: isOwnMessage,
  };
}

export async function createMessage(data: CreateMessageInput) {
  // 1. Recupera a conversa e os usuários participantes
  const conversation = await prisma.conversation.findUnique({
    where: { id: data.conversationId },
    include: {
      connection: {
        select: {
          userAId: true,
          userBId: true,
        },
      },
    },
  });

  if (!conversation) {
    throw new Error('Conversa não encontrada.');
  }

  const { userAId, userBId } = conversation.connection;

  // 2. Verifica se o usuário é participante da conversa
  if (data.senderId !== userAId && data.senderId !== userBId) {
    throw new Error('Você não tem permissão para enviar mensagens nesta conversa.');
  }

  // 3. Determina o receiverId automaticamente
  const receiverId = data.senderId === userAId ? userBId : userAId;

  // 4. Criptografa a mensagem
  const encrypted = encryptMessage(data.content);

  // 5. Cria a mensagem
  const message = await prisma.message.create({
    data: {
      conversationId: data.conversationId,
      senderId: data.senderId,
      receiverId,
      content: encrypted.content,
      iv: encrypted.iv,
    },
  });

  // 6. Retorna a mensagem criada
  return {
    id: message.id,
    content: message.isDeleted ? null : decryptMessage(message.content, message.iv),
    sentAt: message.sentAt,
    isUpdated: message.isUpdated,
    isDeleted: message.isDeleted,
    isOwnMessage: true,
  };
}

export async function updateMessage({ conversationId, messageId, userId, content }: UpdateMessageInput) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: {
      senderId: true,
      conversationId: true,
      isDeleted: true,
      content: true,
      iv: true,
    },
  });

  if (!message) throw new Error('Mensagem não encontrada.');
  if (message.conversationId !== conversationId) throw new Error('Mensagem não pertence à conversa.');
  if (message.senderId !== userId) throw new Error('Você não tem permissão para editar esta mensagem.');
  if (message.isDeleted) throw new Error('Mensagem já foi excluída. Não é possível editar.');

  const currentContent = decryptMessage(message.content, message.iv)
  if (currentContent === content) throw new Error('O conteúdo da mensagem não foi alterado.');

  const updatedData: any = {};

  if (content !== undefined) {
    const encrypted = encryptMessage(content);
    updatedData.content = encrypted.content;
    updatedData.iv = encrypted.iv;
    updatedData.isUpdated = true;
    updatedData.updatedAt = new Date();
  }

  await prisma.message.update({
    where: { id: messageId },
    data: updatedData,
  });

  return getMessageById({ conversationId, messageId, userId });
}

export async function deleteMessage({ conversationId, messageId, userId }: DeleteMessageParams) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: {
      senderId: true,
      conversationId: true,
      isDeleted: true,
    },
  });

  if (!message) throw new Error('Mensagem não encontrada.');
  if (message.conversationId !== conversationId) throw new Error('Mensagem não pertence à conversa.');
  if (message.senderId !== userId) throw new Error('Você não tem permissão para excluir esta mensagem.');
  if (message.isDeleted) throw new Error('Mensagem já foi excluída.');

  await prisma.message.update({
    where: { id: messageId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
  
  return getMessageById({ conversationId, messageId, userId });
}
