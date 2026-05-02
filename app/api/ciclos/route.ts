import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const ciclos = await prisma.cicloEstudo.findMany({
    where: { userId: session.user.id },
    include: { materias: true, sessoes: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(ciclos);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { nome, tipo, materias, sessoes } = await req.json();

  if (!nome || !tipo) {
    return NextResponse.json({ error: "Campos obrigatórios." }, { status: 400 });
  }

  try {
    // Desativar ciclos anteriores
    await prisma.cicloEstudo.updateMany({
      where: { userId: session.user.id },
      data: { ativo: false },
    });

    // Criar ciclo
    const ciclo = await prisma.cicloEstudo.create({
      data: {
        nome,
        tipo,
        userId: session.user.id,
        ativo: true,
      },
    });

    // Criar matérias do ciclo
    if (materias && materias.length > 0) {
      await prisma.cicloMateria.createMany({
        data: materias.map((m: any) => ({
          cicloId: ciclo.id,
          nome: m.nome,
          dificuldade: m.dificuldade,
          prioridade: m.prioridade,
          cor: m.cor,
          materiaId: m.materiaId ?? null,
        })),
      });
    }

    // Criar sessões do ciclo
    if (sessoes && sessoes.length > 0) {
      await prisma.cicloSessao.createMany({
        data: sessoes.map((s: any) => ({
          cicloId: ciclo.id,
          dia: s.dia,
          horaInicio: s.horaInicio,
          horaFim: s.horaFim,
          materiaId: s.materiaId ?? "",
          materiaNome: s.materiaNome,
          cor: s.cor ?? "#6366f1",
        })),
      });
    }

    const cicloCompleto = await prisma.cicloEstudo.findUnique({
      where: { id: ciclo.id },
      include: { materias: true, sessoes: true },
    });

    return NextResponse.json(cicloCompleto, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar ciclo:", error);
    return NextResponse.json({ error: "Erro ao criar ciclo." }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  await prisma.cicloEstudo.deleteMany({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ message: "Ciclos deletados." });
}