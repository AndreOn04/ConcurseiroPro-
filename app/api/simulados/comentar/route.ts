import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: "Erro na API do Gemini." }, { status: 500 });
    }

    const comentario = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ comentario });
  } catch (error) {
    console.error("Erro ao gerar comentário:", error);
    return NextResponse.json({ error: "Erro ao gerar comentário." }, { status: 500 });
  }
}