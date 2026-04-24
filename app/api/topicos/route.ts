import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { error } from "console";

// POST - criar tópicos

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if(!session?.user?.id) {
        return NextResponse.json({ error: " Não autorizado. " }, { status: 401 });
    }

    const { nome, materiaId } = await req.json();

    if(!nome || !materiaId ) {
        return NextResponse.json({ error: "Campos obrigatórios." }, { status: 400 });
    }

    const topico = await prisma.topico.create({
        data: { nome, materiaId },
    });
    return NextResponse.json(topico, { status: 201 });
}