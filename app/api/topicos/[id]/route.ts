import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { error } from "console";

// PATH - marcar tópico como concluído ou editar. 
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions); 

    if(!session?.user.id) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const { nome, concluido } = await req.json();

    const topico = await prisma.topico.update({
        where: { id },
        data: { 
            ...(nome && { nome }), 
            ...(concluido !== undefined && { concluido } ) },
    });

    return NextResponse.json(topico);
}

// DELETE - Deletar tópico
export async function DELETE(
    _req: Request,
    { params } : { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if(!session?.user.id) {
        return NextResponse.json({ error: "Não autorizadi." }, { status: 401 });
    }

    const { id } = await params;

    await prisma.topico.delete({
        where: { id },
    });
    return NextResponse.json({ message: "Tópico deletado" });
}