"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Perfil {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
}

export default function PerfilPage() {
  const { data: session, update } = useSession();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");

  const [formPerfil, setFormPerfil] = useState({ name: "", email: "" });
  const [formSenha, setFormSenha] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  });

  useEffect(() => {
    carregarPerfil();
  }, []);

  async function carregarPerfil() {
    const res = await fetch("/api/perfil");
    if (res.ok) {
      const data = await res.json();
      setPerfil(data);
      setFormPerfil({
        name: data.name ?? "",
        email: data.email ?? "",
      });
    } else {
      setErro("Erro ao carregar perfil.");
    }
    setLoading(false);
  }

  async function salvarPerfil(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    setSucesso("");

    const res = await fetch("/api/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formPerfil),
    });

    const data = await res.json();
    setSalvando(false);

    if (!res.ok) {
      setErro(data.error);
    } else {
      setSucesso("Perfil atualizado com sucesso!");
      await update({ name: formPerfil.name });
      carregarPerfil();
    }
  }

  async function salvarSenha(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (formSenha.novaSenha !== formSenha.confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setSalvando(true);

    const res = await fetch("/api/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formPerfil.name,
        email: formPerfil.email,
        senhaAtual: formSenha.senhaAtual,
        novaSenha: formSenha.novaSenha,
      }),
    });

    const data = await res.json();
    setSalvando(false);

    if (!res.ok) {
      setErro(data.error);
    } else {
      setSucesso("Senha atualizada com sucesso!");
      setFormSenha({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
    }
  }

  function formatarData(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  if (loading) {
    return <p className="text-slate-400">Carregando...</p>;
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white dark:text-white">
          Meu Perfil
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Gerencie suas informações pessoais e senha.
        </p>
      </div>

      {/* Avatar e info */}
      <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
        {perfil?.name?.charAt(0).toUpperCase() ?? "👤"}
      </div>
      <div>
        <p className="text-white font-semibold text-lg">
          {perfil?.name ?? "Sem nome"}
        </p>
        <p className="text-slate-400 text-sm">{perfil?.email}</p>
        <p className="text-slate-600 text-xs mt-1">
          Membro desde {perfil?.createdAt ? formatarData(perfil.createdAt) : ""}
        </p>
      </div>

      {/* Mensagens */}
      {sucesso && (
        <div className="bg-green-900/30 border border-green-700 rounded-lg px-4 py-3">
          <p className="text-black text-sm">✅ {sucesso}</p>
        </div>
      )}
      {erro && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3">
          <p className="text-red-400 text-sm">❌ {erro}</p>
        </div>
      )}

      {/* Formulário de perfil */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-5">
        <h2 className="text-white font-semibold">Informações Pessoais</h2>
        <form onSubmit={salvarPerfil} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 text-xs">Nome</label>
            <input
              type="text"
              value={formPerfil.name}
              onChange={(e) =>
                setFormPerfil({ ...formPerfil, name: e.target.value })
              }
              required
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 text-xs">E-mail</label>
            <input
              type="email"
              value={formPerfil.email}
              onChange={(e) =>
                setFormPerfil({ ...formPerfil, email: e.target.value })
              }
              required
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={salvando}
            className="bg-indigo-600 hover:bg-indigo-500 cursor-pointer disabled:opacity-50 transition-colors py-3 rounded-lg text-sm font-semibold !text-white"
          >
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </div>

      {/* Formulário de senha */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-5">
        <h2 className="text-white font-semibold"> Alterar Senha </h2>
        <form onSubmit={salvarSenha} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 text-xs">Senha atual</label>
            <input
              type="password"
              value={formSenha.senhaAtual}
              onChange={(e) =>
                setFormSenha({ ...formSenha, senhaAtual: e.target.value })
              }
              required
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 text-xs">Nova senha</label>
            <input
              type="password"
              value={formSenha.novaSenha}
              onChange={(e) =>
                setFormSenha({ ...formSenha, novaSenha: e.target.value })
              }
              required
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 text-xs">
              Confirmar nova senha
            </label>
            <input
              type="password"
              value={formSenha.confirmarSenha}
              onChange={(e) =>
                setFormSenha({ ...formSenha, confirmarSenha: e.target.value })
              }
              required
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={salvando}
            className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 transition-colors py-3 rounded-lg text-sm font-semibold text-white"
          >
            {salvando ? "Salvando..." : "Alterar senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
