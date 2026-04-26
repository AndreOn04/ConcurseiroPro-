import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarCodigoVerificacao } from "@/lib/email";

function gerarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "E-mail obrigatório." }, { status: 400 });
    }

    // Deletar códigos anteriores do mesmo e-mail
    await prisma.codigoVerificacao.deleteMany({ where: { email } });

    const codigo = gerarCodigo();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    await prisma.codigoVerificacao.create({
      data: { email, codigo, expiresAt },
    });

    await enviarCodigoVerificacao(email, codigo);

    return NextResponse.json({ message: "Código enviado!" });
  } catch (error) {
    console.error("Erro ao enviar código:", error);
    return NextResponse.json({ error: "Erro ao enviar código." }, { status: 500 });
  }
}