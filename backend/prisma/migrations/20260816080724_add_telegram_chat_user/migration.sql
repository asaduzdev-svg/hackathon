-- AlterTable
ALTER TABLE "TelegramChat" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "TelegramChat_userId_idx" ON "TelegramChat"("userId");

-- AddForeignKey
ALTER TABLE "TelegramChat" ADD CONSTRAINT "TelegramChat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
