"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit, Play, RotateCcw, Sparkles, ArrowBigLeftDashIcon, ArrowBigRightDash } from "lucide-react";

interface Materia {
  id: string;
  nome: string;
  cor: string;
}

interface CicloMateria {
  id?: string;
  nome: string;
  dificuldade: "facil" | "medio" | "dificil";
  prioridade: "alta" | "media" | "baixa" | "ignorar";
  cor: string;
  materiaId?: string;
}

interface CicloSessao {
  id?: string;
  dia: number;
  horaInicio: string;
  horaFim: string;
  materiaId: string;
  materiaNome: string;
  cor: string;
}

interface Ciclo {
  id: string;
  nome: string;
  tipo: string;
  ativo: boolean;
  createdAt: string;
  materias: CicloMateria[];
  sessoes: CicloSessao[];
}

type Etapa = "lista" | "configurar" | "materias" | "preferencias" | "resultado";

const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const DIAS_CORRIDO = ["Dia 1", "Dia 2", "Dia 3", "Dia 4", "Dia 5", "Dia 6", "Dia 7"];

const CORES = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#06b6d4",
];

export default function CiclosPage() {
  const [etapa, setEtapa] = useState<Etapa>("lista");
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [materiasExistentes, setMateriasExistentes] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const [cicloAtual, setCicloAtual] = useState<Ciclo | null>(null);
  const [sessaoEditando, setSessaoEditando] = useState<CicloSessao | null>(null);

  const [config, setConfig] = useState({
    nome: "",
    tipo: "semanal",
    dias: [0, 1, 2, 3, 4],
    horaInicio: "08:00",
    horaFim: "22:00",
    intervalo: 15,
    perfil: "avancado",
    concurso: "",
  });

  const [materias, setMaterias] = useState<CicloMateria[]>([]);
  const [novaMateria, setNovaMateria] = useState<CicloMateria>({
    nome: "",
    dificuldade: "medio",
    prioridade: "media",
    cor: "#6366f1",
  });

  const [sessoes, setSessoes] = useState<CicloSessao[]>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const [resCiclos, resMaterias] = await Promise.all([
      fetch("/api/ciclos"),
      fetch("/api/materias"),
    ]);
    if (resCiclos.ok) setCiclos(await resCiclos.json());
    if (resMaterias.ok) setMateriasExistentes(await resMaterias.json());
    setLoading(false);
  }

  function toggleDia(dia: number) {
    setConfig((prev) => ({
      ...prev,
      dias: prev.dias.includes(dia)
        ? prev.dias.filter((d) => d !== dia)
        : [...prev.dias, dia].sort(),
    }));
  }

  function importarMaterias() {
    const importadas = materiasExistentes.map((m) => ({
      nome: m.nome,
      dificuldade: "medio" as const,
      prioridade: "media" as const,
      cor: m.cor,
      materiaId: m.id,
    }));
    setMaterias(importadas);
  }

  function adicionarMateria() {
    if (!novaMateria.nome) return;
    setMaterias([...materias, { ...novaMateria }]);
    setNovaMateria({ nome: "", dificuldade: "medio", prioridade: "media", cor: "#6366f1" });
  }

  function removerMateria(index: number) {
    setMaterias(materias.filter((_, i) => i !== index));
  }

  function atualizarMateria(index: number, campo: keyof CicloMateria, valor: string) {
    const novas = [...materias];
    novas[index] = { ...novas[index], [campo]: valor };
    setMaterias(novas);
  }

  async function gerarCiclo() {
    setGerando(true);
    const res = await fetch("/api/ciclos/gerar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...config, materias }),
    });

    const data = await res.json();
    setGerando(false);

    if (res.ok) {
      setSessoes(data.sessoes);
      setSugestoes(data.sugestoes ?? []);
      setEtapa("resultado");
    }
  }

  async function salvarCiclo() {
    setSalvando(true);
    const res = await fetch("/api/ciclos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: config.nome,
        tipo: config.tipo,
        materias,
        sessoes,
      }),
    });

    setSalvando(false);

    if (res.ok) {
      await carregarDados();
      setEtapa("lista");
      resetar();
    }
  }

  async function deletarCiclo(id: string) {
    if (!confirm("Deseja realmente excluir este ciclo?")) return;
    await fetch(`/api/ciclos/${id}`, { method: "DELETE" });
    carregarDados();
  }

  async function ativarCiclo(id: string) {
    await fetch(`/api/ciclos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: true }),
    });
    carregarDados();
  }

  function resetar() {
    setConfig({
      nome: "",
      tipo: "semanal",
      dias: [0, 1, 2, 3, 4],
      horaInicio: "08:00",
      horaFim: "22:00",
      intervalo: 15,
      perfil: "avancado",
      concurso: "",
    });
    setMaterias([]);
    setSessoes([]);
    setSugestoes([]);
  }

  function editarSessao(sessao: CicloSessao) {
    setSessaoEditando({ ...sessao });
  }

  function salvarEdicaoSessao() {
    if (!sessaoEditando) return;
    setSessoes(sessoes.map((s, i) =>
      s === sessaoEditando ? sessaoEditando : s
    ));
    setSessaoEditando(null);
  }

  function removerSessao(index: number) {
    setSessoes(sessoes.filter((_, i) => i !== index));
  }

  const diasLabels = config.tipo === "semanal" ? DIAS_SEMANA : DIAS_CORRIDO;

  // ─── LISTA DE CICLOS ───
  if (etapa === "lista") {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white dark:text-white">Ciclos de Estudo</h1>
            <p className="text-slate-400 text-sm mt-1">
              Planejamento inteligente distribuído pela IA.
            </p>
          </div>
          <button
            onClick={() => setEtapa("configurar")}
            className="bg-indigo-600 hover:bg-indigo-500 transition-colors px-5 py-2.5 rounded-lg text-sm font-semibold !text-white flex items-center gap-2"
          >
            <Plus size={16} />
            Novo Ciclo
          </button>
        </div>

        {loading ? (
          <p className="text-slate-400">Carregando...</p>
        ) : ciclos.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <p className="text-4xl mb-3">🌀</p>
            <p className="text-white font-medium">Nenhum ciclo criado ainda</p>
            <p className="text-slate-400 text-sm mt-1">
              Crie seu primeiro ciclo de estudos com IA.
            </p>
            <button
              onClick={() => setEtapa("configurar")}
              className="mt-6 bg-indigo-600 hover:bg-indigo-500 transition-colors px-6 py-2.5 rounded-lg text-sm font-semibold !text-white"
            >
              Criar ciclo
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {ciclos.map((ciclo) => {
              const diasLabelsLocal = ciclo.tipo === "semanal" ? DIAS_SEMANA : DIAS_CORRIDO;
              const diasUsados = [...new Set(ciclo.sessoes.map((s) => s.dia))].sort();

              return (
                <div
                  key={ciclo.id}
                  className={`bg-slate-900 border rounded-xl p-6 flex flex-col gap-4 ${
                    ciclo.ativo ? "border-indigo-600" : "border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {ciclo.ativo && (
                        <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-md font-medium">
                          ativo
                        </span>
                      )}
                      <h2 className="text-white font-semibold">{ciclo.nome}</h2>
                      <span className="text-slate-500 text-xs">
                        {ciclo.tipo === "semanal" ? "Grade Semanal" : "Grade Corrida"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!ciclo.ativo && (
                        <button
                          onClick={() => ativarCiclo(ciclo.id)}
                          className="text-slate-500 hover:text-indigo-400 transition-colors"
                          title="Ativar ciclo"
                        >
                          <Play size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => deletarCiclo(ciclo.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                        title="Excluir ciclo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Resumo do ciclo */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-800 rounded-lg p-3 text-center">
                      <p className="text-white font-bold text-lg">{ciclo.sessoes.length}</p>
                      <p className="text-slate-400 text-xs">Sessões</p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3 text-center">
                      <p className="text-white font-bold text-lg">{ciclo.materias.length}</p>
                      <p className="text-slate-400 text-xs">Matérias</p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3 text-center">
                      <p className="text-white font-bold text-lg">{diasUsados.length}</p>
                      <p className="text-slate-400 text-xs">Dias/semana</p>
                    </div>
                  </div>

                  {/* Grade visual */}
                  <div className="flex flex-col gap-2">
                    {diasUsados.map((dia) => (
                      <div key={dia} className="flex items-center gap-3">
                        <span className="text-slate-400 text-xs w-16 flex-shrink-0">
                          {diasLabelsLocal[dia]}
                        </span>
                        <div className="flex flex-wrap gap-1 flex-1">
                          {ciclo.sessoes
                            .filter((s) => s.dia === dia)
                            .map((sessao, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-md text-white text-xs"
                                style={{ backgroundColor: sessao.cor }}
                              >
                                <span>{sessao.materiaNome}</span>
                                <span className="opacity-75">
                                  {sessao.horaInicio}–{sessao.horaFim}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ─── PASSO 1: CONFIGURAÇÃO ───
  if (etapa === "configurar") {
    return (
      <div className="flex flex-col gap-8 w-full">
        {/* max-w-2xl */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setEtapa("lista")}
            className="text-slate-400 hover:text-white cursor-pointer flex items-center gap-2 transition-colors text-sm"
          >
            <ArrowBigLeftDashIcon size={16} /> Voltar
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Novo Ciclo</h1> 
            <p className="text-slate-400 text-sm">Passo 1 de 3 — Configuração básica</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-5">
          {/* Nome */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 text-xs">Nome do ciclo</label>
            <input
              type="text"
              placeholder="Ex: Ciclo INSS 2026"
              value={config.nome}
              onChange={(e) => setConfig({ ...config, nome: e.target.value })}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Concurso */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 text-xs">Concurso alvo (opcional)</label>
            <input
              type="text"
              placeholder="Ex: INSS, Receita Federal, PRF..."
              value={config.concurso}
              onChange={(e) => setConfig({ ...config, concurso: e.target.value })}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Tipo de grade */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-400 text-xs">Tipo de grade</label>
            <div className="flex gap-3">
              {[
                { value: "semanal", label: "📅 Semanal", desc: "Segunda a Domingo" },
                { value: "corrido", label: "🔄 Corrida", desc: "Dia 1 ao Dia 7" },
              ].map((op) => (
                <button
                  key={op.value}
                  onClick={() => setConfig({ ...config, tipo: op.value })}
                  className={`flex-1 py-3 px-4 rounded-lg border text-sm transition-colors text-left ${
                    config.tipo === op.value
                      ? "border-indigo-500 bg-indigo-600/20 text-white"
                      : "border-slate-700 bg-slate-800 text-slate-400"
                  }`}
                >
                  <p className="font-medium">{op.label}</p>
                  <p className="text-xs opacity-70 mt-0.5">{op.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Dias disponíveis */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-400 text-xs">Dias disponíveis</label>
            <div className="flex flex-wrap gap-2">
              {(config.tipo === "semanal" ? DIAS_SEMANA : DIAS_CORRIDO).map((dia, i) => (
                <button
                  key={i}
                  onClick={() => toggleDia(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    config.dias.includes(i)
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {dia}
                </button>
              ))}
            </div>
          </div>

          {/* Horários */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-slate-400 text-xs">Início</label>
              <input
                type="time"
                value={config.horaInicio}
                onChange={(e) => setConfig({ ...config, horaInicio: e.target.value })}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-slate-400 text-xs">Fim</label>
              <input
                type="time"
                value={config.horaFim}
                onChange={(e) => setConfig({ ...config, horaFim: e.target.value })}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-slate-400 text-xs">Intervalo (min)</label>
              <input
                type="number"
                value={config.intervalo}
                onChange={(e) => setConfig({ ...config, intervalo: Number(e.target.value) })}
                min={0}
                max={60}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Perfil */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-400 text-xs">Seu perfil</label>
            <div className="flex gap-3">
              {[
                { value: "iniciante", label: "🌱 Iniciante", desc: "IA sugere matérias base" },
                { value: "avancado", label: "🚀 Avançado", desc: "Uso suas matérias" },
              ].map((op) => (
                <button
                  key={op.value}
                  onClick={() => setConfig({ ...config, perfil: op.value })}
                  className={`flex-1 py-3 px-4 rounded-lg border text-sm transition-colors text-left ${
                    config.perfil === op.value
                      ? "border-indigo-500 bg-indigo-600/20 text-white"
                      : "border-slate-700 bg-slate-800 text-slate-400"
                  }`}
                >
                  <p className="font-medium">{op.label}</p>
                  <p className="text-xs opacity-70 mt-0.5">{op.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setEtapa("materias")}
            disabled={!config.nome || config.dias.length === 0}
            className="bg-indigo-600 flex items-center justify-center gap-1 cursor-pointer hover:bg-indigo-500 disabled:opacity-50 transition-colors py-3 rounded-lg text-sm font-semibold !text-white"
          >
            <ArrowBigRightDash size={16}/> Próximo
          </button>
        </div>
      </div>
    );
  }

  // ─── PASSO 2: MATÉRIAS ───
  if (etapa === "materias") {
    return (
      <div className="flex flex-col gap-8 max-w-3xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setEtapa("configurar")}
            className="text-slate-400 flex items-center gap-2 cursor-pointer hover:text-white transition-colors text-sm"
          >
            <ArrowBigLeftDashIcon size={16} /> Voltar
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Matérias do Ciclo</h1>
            <p className="text-slate-400 text-sm">Passo 2 de 3 — Configure suas matérias</p>
          </div>
        </div>

        {/* Importar matérias existentes */}
        {materiasExistentes.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">Importar matérias cadastradas</p>
              <p className="text-slate-400 text-xs mt-0.5">
                {materiasExistentes.length} matérias disponíveis
              </p>
            </div>
            <button
              onClick={importarMaterias}
              className="bg-slate-700 hover:bg-slate-600 transition-colors px-4 py-2 rounded-lg text-sm text-white"
            >
              Importar
            </button>
          </div>
        )}

        {/* Lista de matérias */}
        {materias.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-white font-semibold">
              Matérias configuradas ({materias.length})
            </h2>
            {materias.map((m, i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: m.cor }}
                    />
                    <span className="text-white font-medium text-sm">{m.nome}</span>
                  </div>
                  <button
                    onClick={() => removerMateria(i)}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-500 text-xs">Dificuldade</label>
                    <select
                      value={m.dificuldade}
                      onChange={(e) => atualizarMateria(i, "dificuldade", e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="facil">😊 Fácil</option>
                      <option value="medio">😐 Médio</option>
                      <option value="dificil">😰 Difícil</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-500 text-xs">Prioridade</label>
                    <select
                      value={m.prioridade}
                      onChange={(e) => atualizarMateria(i, "prioridade", e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="alta">🔴 Alta</option>
                      <option value="media">🟡 Média</option>
                      <option value="baixa">🟢 Baixa</option>
                      <option value="ignorar">⭕ Ignorar por enquanto</option>
                    </select>
                  </div>
                </div>

                {/* Cor */}
                <div className="flex items-center gap-2">
                  <label className="text-slate-500 text-xs">Cor:</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {CORES.map((cor) => (
                      <button
                        key={cor}
                        onClick={() => atualizarMateria(i, "cor", cor)}
                        className={`w-5 h-5 rounded-full transition-transform ${
                          m.cor === cor ? "scale-125 ring-2 ring-white" : ""
                        }`}
                        style={{ backgroundColor: cor }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Adicionar nova matéria */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
          <h2 className="text-white font-semibold text-sm">Adicionar matéria</h2>
          <input
            type="text"
            placeholder="Nome da matéria"
            value={novaMateria.nome}
            onChange={(e) => setNovaMateria({ ...novaMateria, nome: e.target.value })}
            onKeyDown={(e) => { if (e.key === "Enter") adicionarMateria(); }}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <div className="flex gap-3">
            <select
              value={novaMateria.dificuldade}
              onChange={(e) => setNovaMateria({ ...novaMateria, dificuldade: e.target.value as any })}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="facil">😊 Fácil</option>
              <option value="medio">😐 Médio</option>
              <option value="dificil">😰 Difícil</option>
            </select>
            <select
              value={novaMateria.prioridade}
              onChange={(e) => setNovaMateria({ ...novaMateria, prioridade: e.target.value as any })}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="alta">🔴 Alta</option>
              <option value="media">🟡 Média</option>
              <option value="baixa">🟢 Baixa</option>
              <option value="ignorar">⭕ Ignorar</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-slate-500 text-xs">Cor:</label>
            <div className="flex gap-1.5 flex-wrap">
              {CORES.map((cor) => (
                <button
                  key={cor}
                  onClick={() => setNovaMateria({ ...novaMateria, cor })}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    novaMateria.cor === cor ? "scale-125 ring-2 ring-white" : ""
                  }`}
                  style={{ backgroundColor: cor }}
                />
              ))}
            </div>
          </div>
          <button
            onClick={adicionarMateria}
            disabled={!novaMateria.nome}
            className="bg-slate-700 flex items-center gap-2 cursor-pointer justify-center hover:bg-slate-600 disabled:opacity-50 transition-colors py-2.5 rounded-lg text-sm text-white"
          >
            <Plus size={16} /> Adicionar
          </button>
        </div>

        <button
          onClick={gerarCiclo}
          disabled={gerando || (config.perfil === "avancado" && materias.length === 0)}
          className="bg-indigo-600 hover:bg-indigo-500 cursor-pointer disabled:opacity-50 transition-colors py-3 rounded-lg text-sm font-semibold !text-white flex items-center justify-center gap-2"
        >
          {gerando ? (
            <>Gerando ciclo...</>
          ) : (
            <>
              <Sparkles size={16} />
              Gerar Ciclo
            </>
          )}
        </button>
      </div>
    );
  }

  // ─── PASSO 3: RESULTADO ───
  if (etapa === "resultado") {
    const diasUsados = [...new Set(sessoes.map((s) => s.dia))].sort();

    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setEtapa("materias")}
              className="text-slate-400 cursor-pointer flex items-center gap-2 hover:text-white transition-colors text-sm"
            >
              <ArrowBigLeftDashIcon size={16} /> Voltar
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{config.nome}</h1>
              <p className="text-slate-400 text-sm">Passo 3 de 3 — Revise e salve seu ciclo</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={gerarCiclo}
              disabled={gerando}
              className="border border-slate-700 hover:bg-slate-800 transition-colors px-4 py-2.5 rounded-lg text-sm text-slate-300 flex items-center gap-2"
            >
              <RotateCcw size={14} />
              Regenerar
            </button>
            <button
              onClick={salvarCiclo}
              disabled={salvando}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors px-6 py-2.5 rounded-lg text-sm font-semibold !text-white"
            >
              {salvando ? "Salvando..." : "Salvar Ciclo"}
            </button>
          </div>
        </div>

        {/* Sugestões da IA */}
        {sugestoes.length > 0 && (
          <div className="bg-indigo-950 border border-indigo-800 rounded-xl p-5">
            <p className="text-indigo-400 font-semibold text-sm mb-3 flex items-center gap-2">
              <Sparkles size={14} />
              Sugestões
            </p>
            <ul className="flex flex-col gap-2">
              {sugestoes.map((s, i) => (
                <li key={i} className="text-indigo-200 text-sm flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Grade do ciclo */}
        <div className="flex flex-col gap-4">
          {diasUsados.map((dia) => (
            <div
              key={dia}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-3"
            >
              <h2 className="text-white font-semibold">{diasLabels[dia]}</h2>
              <div className="flex flex-col gap-2">
                {sessoes
                  .filter((s) => s.dia === dia)
                  .map((sessao, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: sessao.cor }}
                        />
                        <span className="text-white text-sm font-medium">
                          {sessao.materiaNome}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-indigo-400 text-sm tabular-nums">
                          {sessao.horaInicio} — {sessao.horaFim}
                        </span>
                        <button
                          onClick={() => removerSessao(sessoes.indexOf(sessao))}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {sessaoEditando && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md flex flex-col gap-5">
              <h2 className="text-white font-bold text-lg">Editar Sessão</h2>
              <div className="flex gap-3">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-slate-400 text-xs">Início</label>
                  <input
                    type="time"
                    value={sessaoEditando.horaInicio}
                    onChange={(e) => setSessaoEditando({ ...sessaoEditando, horaInicio: e.target.value })}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-slate-400 text-xs">Fim</label>
                  <input
                    type="time"
                    value={sessaoEditando.horaFim}
                    onChange={(e) => setSessaoEditando({ ...sessaoEditando, horaFim: e.target.value })}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSessaoEditando(null)}
                  className="flex-1 border border-slate-700 hover:bg-slate-800 transition-colors py-2.5 rounded-lg text-sm text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarEdicaoSessao}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 transition-colors py-2.5 rounded-lg text-sm font-semibold !text-white"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}