-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "isUpdated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3);
