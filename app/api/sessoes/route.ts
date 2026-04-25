import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { error } from "console";

// GET - listar sessões do usuário. 
export async function GET() {
    const session = await getServerSession(authOptions);

    if(!session?.user?.id) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const sessoes = await prisma.sessaoEstudo.findMany({
        where: { userId: session.user.id },
        include: { materia: true },
        orderBy: { createdAt: "desc" },
        take: 10,
    });

    return NextResponse.json(sessoes);
}

// POST - salva sessão. 
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if(!session?.user?.id) {
        return NextResponse.json({ error: "Não autorizado," }, { status: 401 });
    }

    const { duracao, materiaId } = await req.json();

    if(!duracao || duracao < 60) {
        return NextResponse.json(
            { error: "Sessão muito curta para salva." },
            { status: 400 }
        );
    }

    const sessao = await prisma.sessaoEstudo.create({
        data: {
            duracao,
            userId: session.user.id,
            materiaId: materiaId ?? null,
        },
    });
    return NextResponse.json(sessao, { status: 201 });
}

// DELETE - limpar todo histórico
export async function DELETE() {
    const session = await getServerSession(authOptions);

    if(!session?.user?.id) {
        return NextResponse.json({ error: "Não autorizado" }, {status: 401});
    }

    await prisma.sessaoEstudo.deleteMany({
        where: { userId: session.user.id },
    });

    return NextResponse.json({ message: "Histórico limpo." });
}