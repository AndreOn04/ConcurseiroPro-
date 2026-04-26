import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { error } from "console";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const [sessoesHoje, totalMaterias, totalTopicos, topicosConcluidos] =
    await Promise.all([
      prisma.sessaoEstudo.findMany({
        where: {
          userId: session.user.id,
          createdAt: { gte: hoje },
        },
      }),
      prisma.materia.count({
        where: { userId: session.user.id },
      }),
      prisma.topico.count({
        where: { materia: { userId: session.user.id } },
      }),
      prisma.topico.count({
        where: {
          materia: { userId: session.user.id },
          concluido: true,
        },
      }),
    ]);

  const horasHoje = sessoesHoje.reduce((acc, s) => acc + s.duracao, 0);
  const percentualTopicos =
    totalTopicos > 0 ? Math.round((topicosConcluidos / totalTopicos) * 100) : 0;

  return NextResponse.json({
    horasHoje,
    totalMaterias,
    totalTopicos,
    topicosConcluidos,
    percentualTopicos,
  });
}
