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

  const { materia, topico, quantidade } = await req.json();

  if (!materia) {
    return NextResponse.json({ error: "Matéria obrigatória." }, { status: 400 });
  }

  const prompt = `Você é um professor especialista em concursos públicos brasileiros.
Gere ${quantidade ?? 5} questões de múltipla escolha sobre:
Matéria: ${materia}
${topico ? `Tópico específico: ${topico}` : ""}

Retorne APENAS um JSON válido, sem texto adicional, sem markdown, sem blocos de código.
O JSON deve seguir exatamente este formato:
{
  "questoes": [
    {
      "enunciado": "texto da questão",
      "alternativas": ["A) texto", "B) texto", "C) texto", "D) texto", "E) texto"],
      "gabarito": 0,
      "explicacao": "explicação detalhada"
    }
  ]
}

Onde "gabarito" é o índice (0-4) da alternativa correta.
As questões devem ser no estilo CESPE, FCC ou VUNESP.`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content ?? "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Erro ao gerar questões:", error);
    return NextResponse.json({ error: "Erro ao gerar questões." }, { status: 500 });
  }
}