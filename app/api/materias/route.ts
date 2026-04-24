import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { error } from "console";

// GET - listar matérias do usuário.

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: " Não autorizado. "}, { status: 401 } );
    }

    const materias = await prisma.materia.findMany({
        where: { userId: session.user.id },
        include: { topicos: true },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(materias);
}

// POST - Criar nova matéria

export async function POST( req: Request ) {
    const session = await getServerSession(authOptions);

    if(!session?.user?.id) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { nome, cor } = await req.json();

    if(!nome) {
        return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
    }

    const materia = await prisma.materia.create({
        data: {
            nome,
            cor: cor ?? "#6366f1",
            userId: session.user.id,
        },
    });
    return NextResponse.json(materia, { status: 201 });
}