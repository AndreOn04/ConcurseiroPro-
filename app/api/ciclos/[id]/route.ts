import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;

  const ciclo = await prisma.cicloEstudo.findFirst({
    where: { id, userId: session.user.id },
    include: { materias: true, sessoes: true },
  });

  if (!ciclo) {
    return NextResponse.json(
      { error: "Ciclo não encontrado." },
      { status: 404 },
    );
  }

  return NextResponse.json(ciclo);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const { nome, ativo, sessoes } = await req.json();

  if (ativo) {
    await prisma.cicloEstudo.updateMany({
      where: { userId: session.user.id },
      data: { ativo: false },
    });
  }

  const ciclo = await prisma.cicloEstudo.updateMany({
    where: { id, userId: session.user.id },
    data: { nome, ativo },
  });

  if (sessoes) {
    await prisma.cicloSessao.deleteMany({ where: { cicloId: id } });
    await prisma.cicloSessao.createMany({
      data: sessoes.map((s: any) => ({ ...s, cicloId: id })),
    });
  }

  return NextResponse.json(ciclo);
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{id: string}> },
) {
    const session = await getServerSession(authOptions);

    if(!session?.user?.id) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;

    await prisma.cicloEstudo.deleteMany({
        where: { id, userId: session.user.id },
    });

    return NextResponse.json({ message: "Ciclo deletado." });
}