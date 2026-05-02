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

  const { enunciado, alternativas, gabarito, respostaUsuario } =
    await req.json();

const prompt = `Você é um professor especialista em concursos públicos brasileiros, com didática clara, objetiva e altamente explicativa.

Sua tarefa é analisar a questão abaixo e produzir um comentário COMPLETO em HTML, seguindo RIGOROSAMENTE todas as regras de formatação.

Enunciado:
${enunciado}

Alternativas:
${alternativas.map((a: string) => a).join("\n")}

Gabarito correto:
${alternativas[gabarito]}

Resposta do aluno:
${alternativas[respostaUsuario]}

========================
FORMATAÇÃO OBRIGATÓRIA
========================

- Retorne APENAS HTML puro (sem markdown, sem explicações fora do HTML).
- Use <br><br> OBRIGATORIAMENTE ao final de CADA seção.
- Use <strong> para títulos das seções.
- Use <u> para destacar conceitos-chave.
- Pode usar <strong> dentro do texto para reforçar pontos importantes.
- NÃO use cores ou classes em nenhuma parte do texto EXCETO nas alternativas.
- A cor deve incidir SOMENTE sobre o TEXTO da alternativa, nunca sobre a explicação.
- As explicações devem permanecer com cor padrão (sem span).

========================
ESTRUTURA OBRIGATÓRIA
========================

<strong>Análise da questão:</strong><br>
[Explique o tema da questão, o que está sendo cobrado, a disciplina e o ponto-chave. Use linguagem didática e destaque termos importantes com <strong> e <u>.]<br><br>

<strong>Alternativa correta:</strong><br>
<span class="correto">${alternativas[gabarito]}</span><br>
Explicação: [Explique detalhadamente por que essa alternativa está correta. Destaque conceitos importantes com <strong> e <u>.]<br><br>

<strong>Por que as outras estão erradas:</strong><br>
[Para cada alternativa incorreta, siga EXATAMENTE este formato:]
<br>
- Alternativa X: <span class="incorreto">[TEXTO EXATO DA ALTERNATIVA]</span><br>
Explicação: [Explique o erro de forma clara e didática, sem usar span aqui. Destaque termos importantes com <strong> e <u>.]<br><br>

(Repita o bloco acima para TODAS as alternativas incorretas)<br><br>

<strong>Dica de estudo:</strong><br>
<u>[Apresente um macete, dica prática ou forma de memorizar o conteúdo]</u><br><br>

<strong>Base legal:</strong><br>
[Informe artigo, lei, princípio ou fundamento normativo, se aplicável. Caso não haja, escreva: "Não se aplica".]<br><br>

========================
REGRAS CRÍTICAS
========================

- O TEXTO das alternativas DEVE aparecer EXATAMENTE como fornecido.
- NÃO escreva "A)", "B)", "C)" dentro do <span>.
- A letra (A, B, C...) deve aparecer APENAS antes de "Alternativa X".
- O conteúdo dentro do <span> deve conter SOMENTE o texto da alternativa, sem prefixos.
- SOMENTE as alternativas devem estar dentro de:
  - <span class="correto"> (para a correta)
  - <span class="incorreto"> (para as erradas)
- NUNCA coloque a explicação dentro do span.
- NUNCA use span fora das alternativas.
- Use quebras de linha para deixar o conteúdo bem espaçado e legível.
- O HTML deve estar limpo, organizado e fácil de renderizar.

Retorne apenas o HTML final.`; 

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
    return NextResponse.json(
      { error: "Erro ao gerar comentário." },
      { status: 500 },
    );
  }
}
