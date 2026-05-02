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

  const {
    tipo,
    dias,
    horaInicio,
    horaFim,
    intervalo,
    materias,
    perfil,
    concurso,
  } = await req.json();

  const prompt = `Você é um especialista em planejamento de estudos para concursos públicos brasileiros.

Gere um ciclo de estudos otimizado com base nas seguintes informações:

Tipo de grade: ${tipo === "semanal" ? "Semanal (Segunda a Domingo)" : "Corrida (Dia 1 ao Dia 7)"}
Dias disponíveis: ${dias.join(", ")}
Horário de estudo: ${horaInicio} às ${horaFim}
Intervalo entre sessões: ${intervalo} minutos
Perfil do aluno: ${perfil === "iniciante" ? "Iniciante" : "Avançado"}
${concurso ? `Concurso alvo: ${concurso}` : ""}

Matérias:
${materias.map((m: any) => `- ${m.nome} | Dificuldade: ${m.dificuldade} | Prioridade: ${m.prioridade} | Cor: ${m.cor}`).join("\n")}

Regras para distribuição:
1. Matérias com dificuldade ALTA devem ter mais sessões e horários nobres (início do dia)
2. Matérias com prioridade BAIXA devem ter menos sessões
3. Matérias com prioridade IGNORAR não devem aparecer
4. Nunca coloque a mesma matéria em dois dias consecutivos (exceto se for a única)
5. Distribua de forma variada e inteligente
6. Se perfil for INICIANTE e não houver matérias, sugira as principais matérias de concursos públicos
7. Respeite o horário de início e fim, considerando o intervalo entre sessões
8. Cada sessão deve ter duração mínima de 45 minutos e máxima de 2 horas

Retorne APENAS um JSON válido sem markdown:
{
  "sessoes": [
    {
      "dia": 0,
      "horaInicio": "08:00",
      "horaFim": "10:00",
      "materiaId": "id_da_materia",
      "materiaNome": "nome",
      "cor": "#6366f1"
    }
  ],
  "sugestoes": [
    "Dica 1 personalizada sobre o ciclo gerado",
    "Dica 2"
  ]
}

Onde "dia" é: ${tipo === "semanal" ? "0=Segunda, 1=Terça, 2=Quarta, 3=Quinta, 4=Sexta, 5=Sábado, 6=Domingo" : "0=Dia 1, 1=Dia 2, ... 6=Dia 7"}`;

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
    console.error("Erro ao gerar ciclo:", error);
    return NextResponse.json(
      { error: "Erro ao gerar ciclo de estudos." },
      { status: 500 },
    );
  }
}
