"use client";

import { useEffect, useState } from "react";

interface Materia {
  id: string;
  nome: string;
  cor: string;
}

interface CronogramaItem {
  id: string;
  titulo: string;
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  materia: { nome: string; cor: string } | null;
}

const DIAS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

const FORM_VAZIO = {
  titulo: "",
  diaSemana: 1,
  horaInicio: "08:00",
  horaFim: "09:00",
  materiaId: "",
};

export default function CronogramaPage() {
  const [itens, setItens] = useState<CronogramaItem[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<CronogramaItem | null>(null);
  const [form, setForm] = useState(FORM_VAZIO);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const [resItens, resMaterias] = await Promise.all([
      fetch("/api/cronograma"),
      fetch("/api/materias"),
    ]);
    if (resItens.ok) setItens(await resItens.json());
    if (resMaterias.ok) setMaterias(await resMaterias.json());
    setLoading(false);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();

    if (editando) {
      await fetch(`/api/cronograma/${editando.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setEditando(null);
    } else {
      await fetch("/api/cronograma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setForm(FORM_VAZIO);
    setModalAberto(false);
    carregarDados();
  }

  async function deletar(id: string, titulo: string) {
    if (!confirm(`Deseja realmente excluir "${titulo}"?`)) return;
    await fetch(`/api/cronograma/${id}`, { method: "DELETE" });
    carregarDados();
  }

  function abrirEdicao(item: CronogramaItem) {
    setEditando(item);
    setForm({
      titulo: item.titulo,
      diaSemana: item.diaSemana,
      horaInicio: item.horaInicio,
      horaFim: item.horaFim,
      materiaId: "",
    });
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditando(null);
    setForm(FORM_VAZIO);
  }

  const itensPorDia = DIAS.map((dia, index) => ({
    dia,
    index,
    itens: itens.filter((item) => item.diaSemana === index),
  }));

  const diasComItens = itensPorDia.filter((d) => d.itens.length > 0);
  const diasVazios = itensPorDia.filter((d) => d.itens.length === 0);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cronograma</h1>
          <p className="text-slate-400 text-sm mt-1">
            Planeje seus estudos por dia da semana.
          </p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          className="bg-indigo-600 hover:bg-indigo-500 transition-colors px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
        >
          + Novo Item
        </button>
      </div>

      {loading ? (
        <p className="text-slate-400">Carregando...</p>
      ) : itens.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-white font-medium">Cronograma vazio</p>
          <p className="text-slate-400 text-sm mt-1">
            Clique em "Novo Item" para montar seu planejamento.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Dias com itens */}
          {diasComItens.map(({ dia, index, itens: diaItens }) => (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-3"
            >
              <h2 className="text-white font-semibold flex items-center gap-2">
                <span className="bg-indigo-600 text-white text-xs px-2.5 py-1 rounded-md">
                  {dia}
                </span>
                <span className="text-slate-500 text-xs">
                  {diaItens.length} {diaItens.length === 1 ? "item" : "itens"}
                </span>
              </h2>

              <div className="flex flex-col gap-2">
                {diaItens.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      {item.materia && (
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.materia.cor }}
                        />
                      )}
                      <div>
                        <p className="text-white text-sm font-medium">
                          {item.titulo}
                        </p>
                        {item.materia && (
                          <p className="text-slate-500 text-xs">
                            {item.materia.nome}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-indigo-400 text-sm font-medium tabular-nums">
                        {item.horaInicio} — {item.horaFim}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => abrirEdicao(item)}
                          className="text-slate-500 hover:text-indigo-400 transition-colors text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deletar(item.id, item.titulo)}
                          className="text-slate-500 hover:text-red-400 transition-colors text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Dias vazios */}
          {diasVazios.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-slate-600 text-xs mb-2">Dias sem itens:</p>
              <div className="flex flex-wrap gap-2">
                {diasVazios.map(({ dia, index }) => (
                  <span
                    key={index}
                    className="bg-slate-800 text-slate-500 text-xs px-3 py-1.5 rounded-md"
                  >
                    {dia}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md flex flex-col gap-5">
            <h2 className="text-white font-bold text-lg">
              {editando ? "Editar Item" : "Novo Item"}
            </h2>
            <form onSubmit={salvar} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Título (ex: Estudar Direito Constitucional)"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                required
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />

              <select
                value={form.diaSemana}
                onChange={(e) =>
                  setForm({ ...form, diaSemana: Number(e.target.value) })
                }
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                {DIAS.map((dia, i) => (
                  <option key={i} value={i}>
                    {dia}
                  </option>
                ))}
              </select>

              <div className="flex gap-3">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-slate-400 text-xs">Início</label>
                  <input
                    type="time"
                    value={form.horaInicio}
                    onChange={(e) =>
                      setForm({ ...form, horaInicio: e.target.value })
                    }
                    required
                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-slate-400 text-xs">Fim</label>
                  <input
                    type="time"
                    value={form.horaFim}
                    onChange={(e) =>
                      setForm({ ...form, horaFim: e.target.value })
                    }
                    required
                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <select
                value={form.materiaId}
                onChange={(e) =>
                  setForm({ ...form, materiaId: e.target.value })
                }
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="">📚 Vincular matéria (opcional)</option>
                {materias.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="flex-1 border border-slate-700 hover:bg-slate-800 transition-colors py-2.5 rounded-lg text-sm text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 transition-colors py-2.5 rounded-lg text-sm font-semibold text-white"
                >
                  {editando ? "Salvar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
