"use client";

import { useState } from "react";

interface Questao {
  enunciado: string;
  alternativas: string[];
  gabarito: number;
  explicacao: string;
}

type Etapa = "configurar" | "respondendo" | "resultado";

export default function SimulacoesPage() {
  const [etapa, setEtapa] = useState<Etapa>("configurar");
  const [form, setForm] = useState({
    materia: "",
    topico: "",
    quantidade: "5",
  });
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [respostas, setRespostas] = useState<(number | null)[]>([]);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [comentarios, setComentarios] = useState<{ [key: number]: string }>({});
  const [gerandoComentario, setGerandoComentario] = useState<number | null>(
    null,
  );
  const [erro, setErro] = useState("");

  async function gerarSimulado(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro("");

    const res = await fetch("/api/simulados/gerar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setCarregando(false);

    if (!res.ok) {
      setErro(data.error);
      return;
    }

    setQuestoes(data.questoes);
    setRespostas(new Array(data.questoes.length).fill(null));
    setQuestaoAtual(0);
    setComentarios({});
    setEtapa("respondendo");
  }

  function responder(indice: number) {
    const novas = [...respostas];
    novas[questaoAtual] = indice;
    setRespostas(novas);
  }

  function avancar() {
    if (questaoAtual < questoes.length - 1) {
      setQuestaoAtual(questaoAtual + 1);
    } else {
      setEtapa("resultado");
    }
  }

  function voltar() {
    if (questaoAtual > 0) setQuestaoAtual(questaoAtual - 1);
  }

  async function gerarComentario(index: number) {
    if (comentarios[index]) return;
    setGerandoComentario(index);

    const res = await fetch("/api/simulados/comentar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enunciado: questoes[index].enunciado,
        alternativas: questoes[index].alternativas,
        gabarito: questoes[index].gabarito,
        respostaUsuario: respostas[index],
      }),
    });

    const data = await res.json();
    setGerandoComentario(null);

    if (res.ok) {
      setComentarios({ ...comentarios, [index]: data.comentario });
    }
  }

  function reiniciar() {
    setEtapa("configurar");
    setQuestoes([]);
    setRespostas([]);
    setComentarios({});
    setQuestaoAtual(0);
    setForm({ materia: "", topico: "", quantidade: "5" });
  }

  const acertos = respostas.filter(
    (r, i) => r === questoes[i]?.gabarito,
  ).length;
  const percentual =
    questoes.length > 0 ? Math.round((acertos / questoes.length) * 100) : 0;

  // ─── TELA DE CONFIGURAÇÃO ───
  if (etapa === "configurar") {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Simulados com IA</h1>
          <p className="text-slate-400 text-sm mt-1">
            A IA gera questões personalizadas baseadas na sua matéria e tópico.
          </p>
        </div>

        <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-8">
          <h2 className="text-white font-semibold mb-6">Personalizar Questões</h2>
          <form onSubmit={gerarSimulado} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 text-xs">Matéria *</label>
              <input
                type="text"
                placeholder="Ex: Direito Constitucional, Português, Matemática"
                value={form.materia}
                onChange={(e) => setForm({ ...form, materia: e.target.value })}
                required
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-400 text-xs">
                Tópico específico (opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Princípios Fundamentais, Concordância Verbal"
                value={form.topico}
                onChange={(e) => setForm({ ...form, topico: e.target.value })}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-400 text-xs">
                Quantidade de questões
              </label>
              <select
                value={form.quantidade}
                onChange={(e) =>
                  setForm({ ...form, quantidade: e.target.value })
                }
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="5">5 questões</option>
                <option value="10">10 questões</option>
                <option value="15">15 questões</option>
                <option value="20">20 questões</option>
              </select>
            </div>

            {erro && <p className="text-red-400 text-xs">{erro}</p>}

            <button
              type="submit"
              disabled={carregando}
              className="bg-indigo-600 hover:bg-indigo-500 cursor-pointer disabled:opacity-50 transition-colors py-3 rounded-lg text-sm font-semibold text-white mt-2"
            >
              {carregando
                ? "🤖 Gerando questões com IA..."
                : "🚀 Gerar Simulado"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── TELA DE QUESTÕES ───
  if (etapa === "respondendo") {
    const questao = questoes[questaoAtual];
    const respostaAtual = respostas[questaoAtual];

    return (
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Simulado — {form.materia}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {form.topico || "Questões gerais"}
            </p>
          </div>
          <button
            onClick={reiniciar}
            className="border border-slate-700 hover:bg-slate-800 transition-colors px-4 py-2 rounded-lg text-sm text-slate-300"
          >
            Cancelar
          </button>
        </div>

        {/* Progresso */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>
              Questão {questaoAtual + 1} de {questoes.length}
            </span>
            <span>
              {respostas.filter((r) => r !== null).length} respondidas
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-indigo-600 transition-all"
              style={{
                width: `${((questaoAtual + 1) / questoes.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Questão */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col gap-6">
          <p className="text-white leading-relaxed">{questao.enunciado}</p>

          <div className="flex flex-col gap-3">
            {questao.alternativas.map((alt, i) => (
              <button
                key={i}
                onClick={() => responder(i)}
                className={`text-left px-5 py-4 rounded-lg border text-sm transition-colors ${
                  respostaAtual === i
                    ? "border-indigo-500 bg-indigo-600/20 text-white"
                    : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500"
                }`}
              >
                {alt}
              </button>
            ))}
          </div>

          {/* Navegação */}
          <div className="flex justify-between mt-2">
            <button
              onClick={voltar}
              disabled={questaoAtual === 0}
              className="border border-slate-700 hover:bg-slate-800 disabled:opacity-30 transition-colors px-5 py-2.5 rounded-lg text-sm text-slate-300"
            >
              ← Anterior
            </button>
            <button
              onClick={avancar}
              disabled={respostaAtual === null}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 transition-colors px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
            >
              {questaoAtual === questoes.length - 1
                ? "Finalizar ✓"
                : "Próxima →"}
            </button>
          </div>
        </div>

        {/* Navegação rápida */}
        <div className="flex flex-wrap gap-2">
          {questoes.map((_, i) => (
            <button
              key={i}
              onClick={() => setQuestaoAtual(i)}
              className={`w-9 h-9 rounded-lg text-xs font-medium transition-colors ${
                i === questaoAtual
                  ? "bg-indigo-600 text-white"
                  : respostas[i] !== null
                    ? "bg-slate-700 text-white"
                    : "bg-slate-800 text-slate-500"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── TELA DE RESULTADO ───
  return (
    <div className="flex flex-col gap-8">
      {/* Header resultado */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center gap-4 text-center">
        <span className="text-5xl">
          {percentual >= 70 ? "🏆" : percentual >= 50 ? "📈" : "💪"}
        </span>
        <h1 className="text-2xl font-bold text-white">Simulado Concluído!</h1>
        <p className="text-slate-400">
          {form.materia} {form.topico ? `— ${form.topico}` : ""}
        </p>

        <div className="flex items-center gap-8 mt-2">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-indigo-400">
              {percentual}%
            </span>
            <span className="text-slate-400 text-sm">Aproveitamento</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-green-400">{acertos}</span>
            <span className="text-slate-400 text-sm">Acertos</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-red-400">
              {questoes.length - acertos}
            </span>
            <span className="text-slate-400 text-sm">Erros</span>
          </div>
        </div>

        <div className="w-full max-w-xs bg-slate-800 rounded-full h-3 mt-2">
          <div
            className={`h-3 rounded-full transition-all ${
              percentual >= 70
                ? "bg-green-500"
                : percentual >= 50
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }`}
            style={{ width: `${percentual}%` }}
          />
        </div>

        <button
          onClick={reiniciar}
          className="bg-indigo-600 hover:bg-indigo-500 transition-colors px-8 py-3 rounded-lg text-sm font-semibold text-white mt-2"
        >
          Novo Simulado
        </button>
      </div>

      {/* Gabarito comentado */}
      <div className="flex flex-col gap-4">
        <h2 className="text-white font-semibold text-lg">Gabarito Comentado</h2>
        {questoes.map((questao, i) => {
          const acertou = respostas[i] === questao.gabarito;
          return (
            <div
              key={i}
              className={`bg-slate-900 border rounded-xl p-6 flex flex-col gap-4 ${
                acertou ? "border-green-800" : "border-red-800"
              }`}
            >
              {/* Header questão */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      acertou
                        ? "bg-green-900 text-green-400"
                        : "bg-red-900 text-red-400"
                    }`}
                  >
                    {acertou ? "✓ ACERTOU" : "✗ ERROU"}
                  </span>
                  <span className="text-slate-500 text-xs">
                    Questão {i + 1}
                  </span>
                </div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">
                {questao.enunciado}
              </p>

              {/* Alternativas com gabarito */}
              <div className="flex flex-col gap-2">
                {questao.alternativas.map((alt, j) => (
                  <div
                    key={j}
                    className={`px-4 py-2.5 rounded-lg text-sm ${
                      j === questao.gabarito
                        ? "bg-green-900/40 border border-green-700 text-green-300"
                        : j === respostas[i] && !acertou
                          ? "bg-red-900/40 border border-red-700 text-red-300"
                          : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {alt}
                    {j === questao.gabarito && (
                      <span className="ml-2 text-xs">✓ Correta</span>
                    )}
                    {j === respostas[i] &&
                      !acertou &&
                      j !== questao.gabarito && (
                        <span className="ml-2 text-xs">← Sua resposta</span>
                      )}
                  </div>
                ))}
              </div>

              {/* Comentário da IA */}
              {comentarios[i] ? (
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <p className="text-indigo-400 text-xs font-semibold mb-3">
                    🤖 Comentário da IA
                  </p>
                  <style>{`
                        .comentario-ia .correto {
                          color: #4ade80;
                          font-weight: 500;
                        }
                        .comentario-ia .incorreto {
                          color: #f87171;
                          font-weight: 500;
                        }
                        .comentario-ia strong {
                          color: #e2e8f0;
                          font-weight: 700;
                        }
                        .comentario-ia u {
                          text-decoration: underline;
                          text-underline-offset: 3px;
                          color: #a5b4fc;
                        }
                      `}</style>
                  <div
                    className="comentario-ia text-slate-300 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: comentarios[i] }}
                  />
                </div>
              ) : (
                <button
                  onClick={() => gerarComentario(i)}
                  disabled={gerandoComentario === i}
                  className="self-start bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 transition-colors px-4 py-2 rounded-lg text-xs text-slate-300 flex items-center gap-2"
                >
                  {gerandoComentario === i
                    ? "🤖 Gerando comentário..."
                    : "🤖 Gerar Comentário da IA"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
