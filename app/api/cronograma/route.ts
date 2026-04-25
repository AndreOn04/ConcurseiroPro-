import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const itens = await prisma.cronogramaItem.findMany({
    where: { userId: session.user.id },
    include: { materia: true },
    orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }],
  });

  return NextResponse.json(itens);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { titulo, diaSemana, horaInicio, horaFim, materiaId } = await req.json();

  if (!titulo || diaSemana === undefined || !horaInicio || !horaFim) {
    return NextResponse.json({ error: "Campos obrigatórios." }, { status: 400 });
  }

  const item = await prisma.cronogramaItem.create({
    data: {
      titulo,
      diaSemana,
      horaInicio,
      horaFim,
      userId: session.user.id,
      materiaId: materiaId || null,
    },
  });

  return NextResponse.json(item, { status: 201 });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  await prisma.cronogramaItem.deleteMany({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ message: "Cronograma limpo." });
}