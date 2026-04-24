import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { error } from "console";

// PATH - editar matéria

export async function PATCH(
    req: Request,
    { params } : { params: Promise<{id: string}> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: " Não autorizado. " }, { status: 401 } );
    }

    const { id } = await params;
    const { nome, cor } = await req.json();

    const materia = await prisma.materia.updateMany({
        where: { id, userId: session.user.id },
        data: { nome, cor },
    });

    return NextResponse.json(materia);
}

// DELETE - deletar matéria

export async function DELETE(
    _req: Request,
    { params } : { params: Promise<{id: string}> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: " Não autorizado. " }, { status: 401 });
    }

    const {id} = await params;

    await prisma.materia.deleteMany({
        where: { id, userId: session.user.id },
    });

    return NextResponse.json({ message: " Matéria deletado com sucesso. " });
}