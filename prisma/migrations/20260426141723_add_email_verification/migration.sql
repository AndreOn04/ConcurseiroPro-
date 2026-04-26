-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailConfirmado" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "CodigoVerificacao" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodigoVerificacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CodigoVerificacao_email_idx" ON "CodigoVerificacao"("email");
