import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const { titulo, diaSemana, horaInicio, horaFim, materiaId } = await req.json();

  const item = await prisma.cronogramaItem.updateMany({
    where: { id, userId: session.user.id },
    data: { titulo, diaSemana, horaInicio, horaFim, materiaId: materiaId || null },
  });

  return NextResponse.json(item);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;

  await prisma.cronogramaItem.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ message: "Item deletado." });
}