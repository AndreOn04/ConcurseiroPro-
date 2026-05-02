-- CreateTable
CREATE TABLE "CicloEstudo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CicloEstudo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CicloMateria" (
    "id" TEXT NOT NULL,
    "cicloId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "dificuldade" TEXT NOT NULL,
    "prioridade" TEXT NOT NULL,
    "cor" TEXT NOT NULL DEFAULT '#6366f1',
    "materiaId" TEXT,

    CONSTRAINT "CicloMateria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CicloSessao" (
    "id" TEXT NOT NULL,
    "cicloId" TEXT NOT NULL,
    "dia" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,
    "materiaNome" TEXT NOT NULL,
    "cor" TEXT NOT NULL DEFAULT '#6366f1',

    CONSTRAINT "CicloSessao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CicloEstudo" ADD CONSTRAINT "CicloEstudo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CicloMateria" ADD CONSTRAINT "CicloMateria_cicloId_fkey" FOREIGN KEY ("cicloId") REFERENCES "CicloEstudo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CicloSessao" ADD CONSTRAINT "CicloSessao_cicloId_fkey" FOREIGN KEY ("cicloId") REFERENCES "CicloEstudo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
