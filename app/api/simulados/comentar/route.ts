import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { enunciado, alternativas, gabarito, respostaUsuario } = await req.json();

  const prompt = `Você é um professor especialista em concursos públicos brasileiros.
Analise esta questão e forneça um comentário didático completo:

Enunciado: ${enunciado}

Alternativas:
${alternativas.map((a: string) => a).join("\n")}

Gabarito correto: ${alternativas[gabarito]}
Resposta do aluno: ${alternativas[respostaUsuario]}
O aluno ${respostaUsuario === gabarito ? "ACERTOU" : "ERROU"} a questão.

Forneça:
1. Por que a alternativa correta está certa
2. Por que as outras alternativas estão erradas
3. Dica de estudo relacionada ao tema
4. Base legal ou doutrinária se aplicável

Seja didático, claro e objetivo. Responda em português.`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const comentario = completion.choices[0].message.content ?? "";
    return NextResponse.json({ comentario });
  } catch (error) {
    console.error("Erro ao gerar comentário:", error);
    return NextResponse.json({ error: "Erro ao gerar comentário." }, { status: 500 });
  }
}