"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Aba = "entrar" | "cadastrar";
type Etapa = "form" | "verificar";

export default function LoginPage() {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>("entrar");
  const [etapa, setEtapa] = useState<Etapa>("form");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [emailPendente, setEmailPendente] = useState("");

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [codigo, setCodigo] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErro("");
  }

  async function handleEntrar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error === "EMAIL_NAO_CONFIRMADO") {
      setEmailPendente(form.email);
      //Reenviar código
      await fetch("/api/auth/enviar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      setSucesso(`Confirme seu e-mail. Código enviado para ${form.email}`);
      setEtapa("verificar");
    } else if (res?.error) {
      setErro("E-mail ou senha incorretos.");
    } else {
      router.push("/dashboard");
    }
  }

  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");

    // Validar dados sem criar usuário
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setErro(data.error);
      setLoading(false);
      return;
    }

    // Enviar código de verificação
    const resEnvio = await fetch("/api/auth/enviar-codigo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email }),
    });

    setLoading(false);

    if (!resEnvio.ok) {
      setErro("Erro ao enviar código. Verifique seu e-mail e tente novamente.");
      return;
    }

    setEmailPendente(form.email);
    setSucesso(`Código enviado para ${form.email}`);
    setEtapa("verificar");
  }

  async function handleVerificar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const res = await fetch("/api/auth/verificar-codigo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailPendente,
        codigo,
        name: form.name,
        password: form.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErro(data.error);
      setLoading(false);
      return;
    }

    // Login automático após verificação
    const login = await signIn("credentials", {
      email: emailPendente,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (login?.error) {
      setErro("Conta verificada! Faça login.");
      setAba("entrar");
      setEtapa("form");
    } else {
      router.push("/dashboard");
    }
  }

  async function reenviarCodigo() {
    setErro("");
    setSucesso("");
    const res = await fetch("/api/auth/enviar-codigo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailPendente }),
    });
    if (res.ok) {
      setSucesso("Novo código enviado!");
    } else {
      setErro("Erro ao reenviar código.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 flex flex-col items-center gap-6 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl font-extrabold text-indigo-400">
            ConcurseiroPro
          </span>
          <p className="text-slate-400 text-sm">
            Sua plataforma gratuita de estudos
          </p>
        </div>

        {/* Etapa de verificação */}
        {etapa === "verificar" ? (
          <div className="flex flex-col gap-5 w-full">
            <div className="text-center">
              <p className="text-white font-semibold">Verifique seu e-mail</p>
              <p className="text-slate-400 text-sm mt-1">
                Enviamos um código de 6 dígitos para:
              </p>
              <p className="text-indigo-400 text-sm font-medium mt-1">
                {emailPendente}
              </p>
            </div>

            {sucesso && (
              <p className="text-green-400 text-xs text-center">{sucesso}</p>
            )}
            {erro && <p className="text-red-400 text-xs text-center">{erro}</p>}

            <form onSubmit={handleVerificar} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Digite o código de 6 dígitos"
                value={codigo}
                onChange={(e) => {
                  setCodigo(e.target.value);
                  setErro("");
                }}
                maxLength={6}
                required
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-center tracking-widest text-lg"
              />
              <button
                type="submit"
                disabled={loading || codigo.length !== 6}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors py-3 rounded-lg text-sm font-semibold text-white"
              >
                {loading ? "Verificando..." : "Confirmar código"}
              </button>
            </form>

            <div className="flex flex-col items-center gap-2">
              <p className="text-slate-500 text-xs">Não recebeu o código?</p>
              <button
                onClick={reenviarCodigo}
                className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors"
              >
                Reenviar código
              </button>
              <button
                onClick={() => {
                  setEtapa("form");
                  setErro("");
                  setSucesso("");
                }}
                className="text-slate-500 hover:text-slate-400 text-xs transition-colors"
              >
                ← Voltar
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Abas */}
            <div className="flex w-full bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => {
                  setAba("entrar");
                  setErro("");
                }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  aba === "entrar"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => {
                  setAba("cadastrar");
                  setErro("");
                }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  aba === "cadastrar"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Cadastrar
              </button>
            </div>

            {/* Formulário */}
            <form
              onSubmit={aba === "entrar" ? handleEntrar : handleCadastrar}
              className="flex flex-col gap-3 w-full"
            >
              {aba === "cadastrar" && (
                <input
                  type="text"
                  name="name"
                  placeholder="Seu nome"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              )}
              <input
                type="email"
                name="email"
                placeholder="Seu e-mail"
                value={form.email}
                onChange={handleChange}
                required
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="password"
                name="password"
                placeholder="Sua senha"
                value={form.password}
                onChange={handleChange}
                required
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />

              {erro && (
                <p className="text-red-400 text-xs text-center">{erro}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors py-3 rounded-lg text-sm font-semibold text-white mt-1"
              >
                {loading
                  ? "Aguarde..."
                  : aba === "entrar"
                    ? "Entrar"
                    : "Criar conta"}
              </button>
            </form>

            {/* Divisor */}
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 border-t border-slate-700" />
              <span className="text-slate-600 text-xs">ou continue com</span>
              <div className="flex-1 border-t border-slate-700" />
            </div>

            {/* Botão Google */}
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full bg-white hover:bg-slate-100 text-slate-900 font-semibold flex items-center justify-center gap-3 py-3 rounded-lg text-sm transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Entrar com Google
            </button>

            {/* Visitante */}
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full border border-slate-700 hover:bg-slate-800 transition-colors py-3 rounded-lg text-sm font-medium text-slate-300"
            >
              Continuar como visitante
            </button>

            <p className="text-slate-600 text-xs text-center">
              Suas informações são privadas e seguras.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
