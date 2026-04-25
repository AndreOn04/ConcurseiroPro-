"use client";

import { useEffect, useRef, useState } from "react";

interface Materia {
  id: string;
  nome: string;
  cor: string;
}

interface Sessao {
  id: string;
  duracao: number;
  createdAt: string;
  materia: { nome: string; cor: string } | null;
}

const MODOS = {
  foco: 25 * 60,
  pausa_curta: 5 * 60,
  pausa_longa: 15 * 60,
};

export default function TimerPage() {
  const [modo, setModo] = useState<keyof typeof MODOS>("foco");
  const [tempo, setTempo] = useState(MODOS.foco);
  const [rodando, setRodando] = useState(false);
  const [ciclos, setCiclos] = useState(0);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [materiaSelecionada, setMateriaSelecionada] = useState("");
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [salvando, setSalvando] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const jaFinalizouRef = useRef(false);
  const tempoDecorridoRef = useRef(0);
  const materiaSelecionadaRef = useRef("");

  useEffect(() => {
    carregarMaterias();
    carregarSessoes();
  }, []);

  useEffect(() => {
    materiaSelecionadaRef.current = materiaSelecionada;
  }, [materiaSelecionada]);

  useEffect(() => {
    if (rodando) {
      jaFinalizouRef.current = false;
      intervalRef.current = setInterval(() => {
        setTempo((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setRodando(false);
            if (!jaFinalizouRef.current) {
              jaFinalizouRef.current = true;
              handleFimSessao();
            }
            return 0;
          }
          tempoDecorridoRef.current += 1;
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }
    return () => clearInterval(intervalRef.current!);
  }, [rodando]);

  async function carregarMaterias() {
    const res = await fetch("/api/materias");
    if (res.ok) setMaterias(await res.json());
  }

  async function carregarSessoes() {
    const res = await fetch("/api/sessoes");
    if (res.ok) setSessoes(await res.json());
  }

  async function handleFimSessao() {
    const duracao = tempoDecorridoRef.current;
    if (duracao < 60) return;
    setSalvando(true);
    await fetch("/api/sessoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        duracao,
        materiaId: materiaSelecionadaRef.current || null,
      }),
    });
    tempoDecorridoRef.current = 0;
    setCiclos((c) => c + 1);
    setSalvando(false);
    carregarSessoes();
  }

  async function limparHistorico() {
    if (!confirm("Deseja realmente limpar todo o histórico de sessões?")) return;
    await fetch("/api/sessoes", { method: "DELETE" });
    carregarSessoes();
  }

  function trocarModo(novoModo: keyof typeof MODOS) {
    setModo(novoModo);
    setTempo(MODOS[novoModo]);
    setRodando(false);
    tempoDecorridoRef.current = 0;
    jaFinalizouRef.current = false;
    clearInterval(intervalRef.current!);
  }

  function resetar() {
    setTempo(MODOS[modo]);
    setRodando(false);
    tempoDecorridoRef.current = 0;
    jaFinalizouRef.current = false;
    clearInterval(intervalRef.current!);
  }

  function formatarTempo(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const seg = (s % 60).toString().padStart(2, "0");
    return `${m}:${seg}`;
  }

  function formatarDuracao(s: number) {
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    return `${m} min`;
  }

  function formatarData(dateStr: string) {
    const data = new Date(dateStr);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const progresso = ((MODOS[modo] - tempo) / MODOS[modo]) * 100;
  const circunferencia = 2 * Math.PI * 120;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Timer Pomodoro</h1>
        <p className="text-slate-400 text-sm mt-1">
          Estude com foco usando sessões cronometradas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer principal */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center gap-6">
          {/* Seleção de modo */}
          <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
            {(["foco", "pausa_curta", "pausa_longa"] as const).map((m) => (
              <button
                key={m}
                onClick={() => trocarModo(m)}
                className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                  modo === m
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {m === "foco" ? "🍅 Foco" : m === "pausa_curta" ? "☕ Pausa" : "🌙 Pausa Longa"}
              </button>
            ))}
          </div>

          {/* Círculo do timer */}
          <div className="relative flex items-center justify-center">
            <svg width="280" height="280" className="-rotate-90">
              <circle cx="140" cy="140" r="120" fill="none" stroke="#1e293b" strokeWidth="8" />
              <circle
                cx="140" cy="140" r="120"
                fill="none"
                stroke={modo === "foco" ? "#6366f1" : "#22c55e"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circunferencia}
                strokeDashoffset={circunferencia - (progresso / 100) * circunferencia}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-6xl font-bold text-white tabular-nums">
                {formatarTempo(tempo)}
              </span>
              <span className="text-slate-400 text-sm mt-1">
                {salvando ? "Salvando sessão..." : modo === "foco" ? "Foco" : modo === "pausa_curta" ? "Pausa Curta" : "Pausa Longa"}
              </span>
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-4">
            <button
              onClick={resetar}
              className="border border-slate-700 hover:bg-slate-800 transition-colors px-5 py-2.5 rounded-lg text-sm text-slate-300"
            >
              Resetar
            </button>
            <button
              onClick={() => setRodando(!rodando)}
              className={`px-10 py-3 rounded-lg text-sm font-bold transition-colors ${
                rodando
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              {rodando ? "⏸ Pausar" : "▶ Iniciar"}
            </button>
          </div>

          {/* Ciclos e matéria */}
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex items-center gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < ciclos % 4 ? "bg-indigo-500" : "bg-slate-700"
                  }`}
                />
              ))}
              <span className="text-slate-500 text-xs ml-2">{ciclos} ciclos completos</span>
            </div>

            <select
              value={materiaSelecionada}
              onChange={(e) => setMateriaSelecionada(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="">📚 Selecionar matéria (opcional)</option>
              {materias.map((m) => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Histórico */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Histórico Recente</h2>
            {sessoes.length > 0 && (
              <button
                onClick={limparHistorico}
                className="text-slate-500 hover:text-red-400 transition-colors text-xs"
              >
                🗑️ Limpar
              </button>
            )}
          </div>

          {sessoes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <p className="text-3xl mb-2">⏱️</p>
              <p className="text-slate-400 text-sm">Nenhuma sessão registrada ainda.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {sessoes.map((sessao) => (
                <div
                  key={sessao.id}
                  className="bg-slate-800 rounded-lg px-4 py-3 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {sessao.materia && (
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: sessao.materia.cor }}
                        />
                      )}
                      <span className="text-slate-300 text-sm">
                        {sessao.materia?.nome ?? "Sem matéria"}
                      </span>
                    </div>
                    <span className="text-indigo-400 text-sm font-medium">
                      {formatarDuracao(sessao.duracao)}
                    </span>
                  </div>
                  <span className="text-slate-600 text-xs">
                    {formatarData(sessao.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}