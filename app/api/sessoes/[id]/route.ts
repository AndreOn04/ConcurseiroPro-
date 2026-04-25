import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { error } from "console";

export async function DELETE (
    _req: Request,
    { params } : { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if(!session?.user?.id) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;

    await prisma.sessaoEstudo.delete({
        where: { id },
    });
    return NextResponse.json({ message: "Sessão deletada" });
}

export async function DELETE_ALL(rq: Request) {
    const session = await getServerSession(authOptions);
    if(!session?.user?.id) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    await prisma.sessaoEstudo.deleteMany({
        where: { userId: session.user.id },
    });

    return NextResponse.json({ messsage: "Histórico limpo." });
}