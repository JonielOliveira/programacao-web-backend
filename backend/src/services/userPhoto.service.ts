import prisma from '../prisma/client';

export async function uploadUserPhoto(userId: string, file: Express.Multer.File) {
  return prisma.userPhoto.upsert({
    where: { userId },
    update: {
      name: file.originalname,
      mimeType: file.mimetype,
      content: file.buffer,
    },
    create: {
      userId,
      name: file.originalname,
      mimeType: file.mimetype,
      content: file.buffer,
    },
  });
}

export async function getUserPhotoById(userId: string) {
  const photo = await prisma.userPhoto.findUnique({
    where: { userId },
  });

  if (!photo) {
    throw new Error('Foto não encontrada.');
  }

  return photo;
}
