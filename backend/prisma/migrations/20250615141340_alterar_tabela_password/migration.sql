/*
  Warnings:

  - Added the required column `updatedAt` to the `UserPassword` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserPassword" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "maxAttempts" SET DEFAULT 3;
