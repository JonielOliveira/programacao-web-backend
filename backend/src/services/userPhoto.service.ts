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
