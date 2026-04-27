import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Preencha todos os campos." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    const usuarioExiste = await prisma.user.findUnique({
      where: { email },
    });

    if (usuarioExiste) {
      return NextResponse.json(
        { error: "E-mail já cadastrado." },
        { status: 400 }
      );
    }

    // Apenas valida, não cria o usuário ainda
    return NextResponse.json(
      { message: "Dados válidos. Prossiga com a verificação." },
      { status: 200 }
    );
  } catch (error) {
    console.error("ERRO NO REGISTER:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}