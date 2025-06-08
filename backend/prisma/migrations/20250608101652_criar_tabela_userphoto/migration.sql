-- CreateTable
CREATE TABLE "UserPhoto" (
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "content" BYTEA NOT NULL,

    CONSTRAINT "UserPhoto_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "UserPhoto" ADD CONSTRAINT "UserPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
