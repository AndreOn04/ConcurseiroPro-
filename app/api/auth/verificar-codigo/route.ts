import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { error } from "console";

export async function POST(req: Request) {
    try {
        const { email, codigo } = await req.json();

        if(!email || !codigo) {
            return NextResponse.json({ error: " Campos obrigatórios. " }, { status: 400 });
        }

        const registro = await prisma.codigoVerificacao.findFirst({
            where: { email, codigo }
        });

        if(!registro) {
            return NextResponse.json({ error: " Código inválido. " }, { status: 400 });
        }

        if(registro.expiresAt < new Date()) {
            await prisma.codigoVerificacao.delete({ where: { id: registro.id } });
            return NextResponse.json({ error: " Código expirado. " }, { status: 400 });
        }

        await prisma.user.update({
            where: { email },
            data: { emailConfirmado: true },
        });

        await prisma.codigoVerificacao.delete({ where: { id: registro.id } });

        return NextResponse.json({ message: "E-mail verificado com sucesso!" });
    } catch (error) {
        console.error("Erro ao verificar código:", error);
        return NextResponse.json({ error: "Erro ao verificar código." }, { status: 400 });
    }
}