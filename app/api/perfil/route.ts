import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET - buscar perfil
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: " Não autorizado. " }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, createdAt: true },
  });

  return NextResponse.json(user);
}

// PATCH - Atualizar perfil.
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { name, email, senhaAtual, novaSenha } = await req.json();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Usuário não encontrado." },
      { status: 404 },
    );
  }

  // Caso deseje trocar senha
  if (senhaAtual && novaSenha) {
    if (!user.password) {
      return NextResponse.json(
        { error: "Conta sem senha cadastrada." },
        { status: 400 },
      );
    }

    const senhaCorreta = await bcrypt.compare(senhaAtual, user.password);
    if (!senhaCorreta) {
      return NextResponse.json(
        { error: "Senha atual incorreta." },
        { status: 400 },
      );
    }

    if (novaSenha.length < 6) {
      return NextResponse.json(
        { error: "Nova senha dever ter no mínimo 6 caracteres." },
        { status: 400 },
      );
    }

    const senhaCriptografada = await bcrypt.hash(novaSenha, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { name, email, password: senhaCriptografada },
    });

    return NextResponse.json({
      message: "Opa, seus dados foram atualizado com sucesso! 😎",
    });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, email },
  });

  return NextResponse.json({ message: "Perfil atualizado com sucesso!" });
}
