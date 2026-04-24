import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { error } from "console";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if(!name || !email || !password) {
            return NextResponse.json(
                { error: "Preencha todos os campos" },
                { status: 400 }
            );
        }

        const userExist = await prisma.user.findUnique({
            where: {email},
        });

        if(userExist) {
            return NextResponse.json(
                { error: "E-mail já cadastrado" },
                { status: 400 }
            );
        }

        const senhaCrypt = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: senhaCrypt,
            },
        });

        return NextResponse.json(
            { message: "Usuário criado com sucesso!", userId: user.id },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Erro interno do servidor." },
            { status: 500 }
        );
    }
}