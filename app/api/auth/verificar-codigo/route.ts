import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarCodigoVerificacao } from "@/lib/email";

function gerarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if(!email) {
      return NextResponse.json({ error: " E-mail obrigatório. " }, { status: 400 });
    }

    console.log("EMAIL_USER:", process.env.EMAIL_USER ? "definido" : "NÃO DEFINIDO");
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "definido" : "NÃO DEFINIDO");

    await prisma.codigoVerificacao.deleteMany({ where: {email} });

    const codigo = gerarCodigo();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000 );

    await prisma.codigoVerificacao.create({
      data: { email, codigo, expiresAt },
    });

    await enviarCodigoVerificacao(email, codigo);

    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() }
    });

    return NextResponse.json({ message: "Código enviado!" });
  } catch (error: any) {
    console.error("ERRO COMPLETO:", {
      message: error.message,
      code: error.response,
      response: error.response,
    });
    return NextResponse.json({ error: "Erro ao enviar código." }, { status: 400 });
  }
}