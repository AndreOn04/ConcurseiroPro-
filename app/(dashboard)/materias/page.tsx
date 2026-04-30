"use client";

import { useEffect, useState } from "react";

interface Topico {
  id: string;
  nome: string;
  concluido: boolean;
}

interface Materia {
  id: string;
  nome: string;
  cor: string;
  topicos: Topico[];
}

import {
  PenIcon,
  Trash2Icon
} from "lucide-react"

export default function MateriasPage() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [novaMateria, setNovaMateria] = useState({ nome: "", cor: "#6366f1" });
  const [topicoInput, setTopicoInput] = useState<{ [key: string]: string }>({});
  const [editandoMateria, setEditandoMateria] = useState<{
    id: string;
    nome: string;
    cor: string;
  } | null>(null);
  const [editandoTopico, setEditandoTopico] = useState<{
    id: string;
    nome: string;
  } | null>(null);

  async function carregarMaterias() {
    const res = await fetch("/api/materias");
    if (res.ok) {
      const data = await res.json();
      setMaterias(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarMaterias();
  }, []);

  async function criarMateria(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/materias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novaMateria),
    });
    if (res.ok) {
      setNovaMateria({ nome: "", cor: "#6366f1" });
      setModalAberto(false);
      carregarMaterias();
    }
  }

  async function salvarEdicaoMateria(e: React.FormEvent) {
    e.preventDefault();
    if (!editandoMateria) return;
    await fetch(`/api/materias/${editandoMateria.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: editandoMateria.nome,
        cor: editandoMateria.cor,
      }),
    });
    setEditandoMateria(null);
    carregarMaterias();
  }

  async function deletarMateria(id: string, nome: string) {
    if (
      !confirm(
        `Deseja realmente excluir a matéria "${nome}"? Todos os tópicos serão perdidos.`,
      )
    )
      return;
    await fetch(`/api/materias/${id}`, { method: "DELETE" });
    carregarMaterias();
  }

  async function criarTopico(materiaId: string) {
    const nome = topicoInput[materiaId];
    if (!nome) return;
    await fetch("/api/topicos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, materiaId }),
    });
    setTopicoInput({ ...topicoInput, [materiaId]: "" });
    carregarMaterias();
  }

  async function salvarEdicaoTopico(e: React.FormEvent) {
    e.preventDefault();
    if (!editandoTopico) return;
    await fetch(`/api/topicos/${editandoTopico.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: editandoTopico.nome }),
    });
    setEditandoTopico(null);
    carregarMaterias();
  }

  async function toggleTopico(id: string, concluido: boolean) {
    await fetch(`/api/topicos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concluido: !concluido }),
    });
    carregarMaterias();
  }

  async function deletarTopico(id: string, nome: string) {
    if (!confirm(`Deseja realmente excluir o tópico "${nome}"?`)) return;
    await fetch(`/api/topicos/${id}`, { method: "DELETE" });
    carregarMaterias();
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Matérias</h1>
          <p className="text-slate-400 text-sm mt-1">
            Organize suas disciplinas e tópicos de estudo.
          </p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          className="bg-indigo-600 hover:bg-indigo-500 transition-colors px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
        >
          + Nova Matéria
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-slate-400">Carregando...</p>
      ) : materias.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">📚</p>
          <p className="text-white font-medium">Nenhuma matéria cadastrada</p>
          <p className="text-slate-400 text-sm mt-1">
            Clique em `Nova Matéria` para começar.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {materias.map((materia) => {
            const concluidos = materia.topicos.filter(
              (t) => t.concluido,
            ).length;
            const total = materia.topicos.length;
            const progresso =
              total > 0 ? Math.round((concluidos / total) * 100) : 0;

            return (
              <div
                key={materia.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-4"
              >
                {/* Header da matéria */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: materia.cor }}
                    />
                    <h2 className="text-white font-semibold">{materia.nome}</h2>
                    <span className="text-slate-500 text-xs">
                      {concluidos}/{total} tópicos • {progresso}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setEditandoMateria({
                          id: materia.id,
                          nome: materia.nome,
                          cor: materia.cor,
                        })
                      }
                      className="text-slate-500 hover:text-indigo-400 cursor-pointer transition-colors text-sm"
                      title="Editar matéria"
                    >
                      <PenIcon size={20} />
                    </button>
                    <button
                      onClick={() => deletarMateria(materia.id, materia.nome)}
                      className="text-slate-500 hover:text-red-400 cursor-pointer transition-colors text-sm"
                      title="Excluir matéria"
                    >
                      <Trash2Icon size={20} />
                    </button>
                  </div>
                </div>

                {/* Barra de progresso */}
                {total > 0 && (
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${progresso}%`,
                        backgroundColor: materia.cor,
                      }}
                    />
                  </div>
                )}

                {/* Tópicos */}
                <div className="flex flex-col gap-2">
                  {materia.topicos.map((topico) => (
                    <div
                      key={topico.id}
                      className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={topico.concluido}
                          onChange={() =>
                            toggleTopico(topico.id, topico.concluido)
                          }
                          className="accent-indigo-500 w-4 h-4 cursor-pointer"
                        />
                        <span
                          className={`text-sm ${
                            topico.concluido
                              ? "line-through text-slate-500"
                              : "text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {topico.nome}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setEditandoTopico({
                              id: topico.id,
                              nome: topico.nome,
                            })
                          }
                          className="text-slate-600 hover:text-indigo-400 transition-colors text-xs"
                          title="Editar tópico"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deletarTopico(topico.id, topico.nome)}
                          className="text-slate-600 hover:text-red-400 transition-colors text-xs"
                          title="Excluir tópico"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input novo tópico */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Adicionar tópico..."
                    value={topicoInput[materia.id] ?? ""}
                    onChange={(e) =>
                      setTopicoInput({
                        ...topicoInput,
                        [materia.id]: e.target.value,
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") criarTopico(materia.id);
                    }}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => criarTopico(materia.id)}
                    className="bg-slate-700 hover:bg-slate-600 transition-colors px-4 py-2 rounded-lg text-sm text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal nova matéria */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md flex flex-col gap-5">
            <h2 className="text-white font-bold text-lg">Nova Matéria</h2>
            <form onSubmit={criarMateria} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Nome da matéria"
                value={novaMateria.nome}
                onChange={(e) =>
                  setNovaMateria({ ...novaMateria, nome: e.target.value })
                }
                required
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex items-center gap-3">
                <label className="text-slate-400 text-sm">Cor:</label>
                <input
                  type="color"
                  value={novaMateria.cor}
                  onChange={(e) =>
                    setNovaMateria({ ...novaMateria, cor: e.target.value })
                  }
                  className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="flex-1 border border-slate-700 hover:bg-slate-800 transition-colors py-2.5 rounded-lg text-sm text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 transition-colors py-2.5 rounded-lg text-sm font-semibold text-white"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal editar matéria */}
      {editandoMateria && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md flex flex-col gap-5">
            <h2 className="text-white font-bold text-lg">Editar Matéria</h2>
            <form
              onSubmit={salvarEdicaoMateria}
              className="flex flex-col gap-4"
            >
              <input
                type="text"
                value={editandoMateria.nome}
                onChange={(e) =>
                  setEditandoMateria({
                    ...editandoMateria,
                    nome: e.target.value,
                  })
                }
                required
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <div className="flex items-center gap-3">
                <label className="text-slate-400 text-sm">Cor:</label>
                <input
                  type="color"
                  value={editandoMateria.cor}
                  onChange={(e) =>
                    setEditandoMateria({
                      ...editandoMateria,
                      cor: e.target.value,
                    })
                  }
                  className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setEditandoMateria(null)}
                  className="flex-1 border border-slate-700 hover:bg-slate-800 transition-colors py-2.5 rounded-lg text-sm text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 transition-colors py-2.5 rounded-lg text-sm font-semibold text-white"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal editar tópico */}
      {editandoTopico && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md flex flex-col gap-5">
            <h2 className="text-white font-bold text-lg">Editar Tópico</h2>
            <form onSubmit={salvarEdicaoTopico} className="flex flex-col gap-4">
              <input
                type="text"
                value={editandoTopico.nome}
                onChange={(e) =>
                  setEditandoTopico({ ...editandoTopico, nome: e.target.value })
                }
                required
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setEditandoTopico(null)}
                  className="flex-1 border border-slate-700 hover:bg-slate-800 transition-colors py-2.5 rounded-lg text-sm text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 transition-colors py-2.5 rounded-lg text-sm font-semibold text-white"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
