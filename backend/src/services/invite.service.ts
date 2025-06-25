import prisma from '../prisma/client';

export async function sendInvite(senderId: string, receiverUsername: string) {
  if (!senderId) {
    throw new Error('Remetente não informado.');
  }

  if (!receiverUsername) {
    throw new Error('Username do destinatário não informado.');
  }

  const [sender, receiver] = await Promise.all([
    prisma.user.findUnique({ where: { id: senderId } }),
    prisma.user.findUnique({ where: { username: receiverUsername } }),
  ]);

  if (!sender) {
    throw new Error('Usuário remetente não encontrado.');
  }

  if (!receiver) {
    throw new Error('Usuário destinatário não encontrado.');
  }

  if (senderId === receiver.id) {
    throw new Error('Você não pode enviar um convite para si mesmo.');
  }

  // Verificar se já existe uma conexão entre os usuários
  const existingConnection = await prisma.connection.findFirst({
    where: {
      OR: [
        { userAId: sender.id, userBId: receiver.id },
        { userAId: receiver.id, userBId: sender.id },
      ],
    },
  });

  if (existingConnection) {
    throw new Error('Você já está conectado com esse usuário.');
  }

  // Verificar se já existe convite entre os dois (em qualquer direção)
  const existingInvite = await prisma.invite.findFirst({
    where: {
      OR: [
        { senderId: sender.id, receiverId: receiver.id },
        { senderId: receiver.id, receiverId: sender.id },
      ],
    },
  });

  if (existingInvite) {
    throw new Error('Já existe um convite entre esses usuários.');
  }

  // Criar o convite
  await prisma.invite.create({
    data: {
      senderId: sender.id,
      receiverId: receiver.id,
    },
  });
  return { message: 'Convite enviado com sucesso.' };
}

export async function listReceivedInvites(userId: string) {
  if (!userId) {
    throw new Error('ID do usuário não informado.');
  }
  return prisma.invite.findMany({
    where: { receiverId: userId },
    include: { sender: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function listPaginatedReceivedInvites(
  userId: string,
  page: number,
  limit: number,
  sort: 'asc' | 'desc' = 'desc'
) {
  const skip = (page - 1) * limit;

  const where = { receiverId: userId };

  const [total, invites] = await Promise.all([
    prisma.invite.count({ where }),
    prisma.invite.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: sort },
      select: {
        id: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        }
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const currentPage = total === 0 ? 0 : page;

  return {
    data: invites,
    total,
    page: currentPage,
    limit,
    totalPages,
  };
}

export async function listSentInvites(userId: string) {
  if (!userId) {
    throw new Error('ID do usuário não informado.');
  }

  return prisma.invite.findMany({
    where: { senderId: userId },
    include: { receiver: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function listPaginatedSentInvites(
  userId: string,
  page: number,
  limit: number,
  sort: 'asc' | 'desc' = 'desc'
) {
  const skip = (page - 1) * limit;

  const where = { senderId: userId };

  const [total, invites] = await Promise.all([
    prisma.invite.count({ where }),
    prisma.invite.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: sort },
      select: {
        id: true,
        createdAt: true,
        receiver: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        }
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const currentPage = total === 0 ? 0 : page;

  return {
    data: invites,
    total,
    page: currentPage,
    limit,
    totalPages,
  };
}

export async function acceptInvite(inviteId: string, receiverId: string) {
  // 1. Busca o convite
  const invite = await prisma.invite.findUnique({ where: { id: inviteId } });

  if (!invite || invite.receiverId !== receiverId) {
    throw new Error('Convite inválido ou não pertence a você.');
  }

  // 2. Verifica se o remetente ainda existe
  const senderExists = await prisma.user.findUnique({ where: { id: invite.senderId } });
  if (!senderExists) {
    throw new Error('O remetente do convite não existe mais.');
  }

  // 3. Verifica se já existe conexão entre eles
  const existingConnection = await prisma.connection.findFirst({
    where: {
      OR: [
        { userAId: invite.senderId, userBId: invite.receiverId },
        { userAId: invite.receiverId, userBId: invite.senderId },
      ],
    },
  });

  if (existingConnection) {
    throw new Error('Vocês já estão conectados.');
  }

  // 4. Cria a conexão, a conversa e remove o convite
  await prisma.$transaction(async (tx) => {
    const connection = await tx.connection.create({
      data: {
        userAId: invite.senderId,
        userBId: invite.receiverId,
      },
    });

    await tx.conversation.create({
      data: {
        connectionId: connection.id,
      },
    });

    await tx.invite.delete({
      where: { id: invite.id },
    });
  });

  return { message: 'Conexão criada com sucesso.' };
}

export async function rejectInvite(inviteId: string, receiverId: string) {
  // 1. Busca o convite
  const invite = await prisma.invite.findUnique({ where: { id: inviteId } });

  if (!invite || invite.receiverId !== receiverId) {
    throw new Error('Convite inválido ou não pertence a você.');
  }
  
  // 2. Rejeita (deleta) o convite
  await prisma.invite.delete({ where: { id: inviteId } });

  return { message: 'Convite rejeitado com sucesso.' };
}

export async function cancelInvite(inviteId: string, senderId: string) {
  // 1. Busca o convite
  const invite = await prisma.invite.findUnique({ where: { id: inviteId } });

  if (!invite || invite.senderId !== senderId) {
    throw new Error('Convite inválido ou não pertence a você.');
  }

  // 2. Cancela (deleta) o convite
  await prisma.invite.delete({ where: { id: inviteId } });

  return { message: 'Convite cancelado com sucesso.' };
}
