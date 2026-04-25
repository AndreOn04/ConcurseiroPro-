"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [aba, setAba] = useState<"entrar" | "cadastrar">("cadastrar");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  function handleChenge(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErro("");
  }

  async function handleEntar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setErro("E-mail ou senha incorretos.");
    } else {
      router.push("/dashboard");
    }
  }

  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");

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

    const login = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (login?.error) {
      setErro("Cadastro realizado! Faça login.");
      setAba("entrar");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 flex flex-col items-center gap-6 w-full max-w-md">
        {/* Lgo */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-3xl font-extrabold text-indigo-400">
            {" "}
            ConcurseiroPro{" "}
          </span>
          <p className="text-slate-400 text-sm text-center">
            Acesse sua conta e continue estudando
          </p>
        </div>

        <div className="flex w-full bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => {
              setAba("entrar");
              setErro("");
            }}
            className={` flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              aba === "entrar"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white"
            } `}
          >
            Entrar
          </button>
          <button
            onClick={() => {
              setAba("cadastrar");
              setErro("");
            }}
            className={` flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              aba === "cadastrar"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white"
            } `}
          >
            Cadastrar
          </button>
        </div>

        <form
          onSubmit={aba === "entrar" ? handleEntar : handleCadastrar}
          className="flex flex-col gap-3 w-full"
        >
          {aba === "cadastrar" && (
            <input
              type="text"
              name="name"
              placeholder="Informe seu nome"
              value={form.name}
              onChange={handleChenge}
              required
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Informe seu E-mail"
            value={form.email}
            onChange={handleChenge}
            required
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Sua senha"
            value={form.password}
            onChange={handleChenge}
            required
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />

          {erro && <p className="text-red-400 text-xs text-center">{erro}</p>}

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 disable:opacity-500 transition-colors py-3 rounded-lg text-sm font-medium text-white mt-1"
          >
            {loading
              ? "Aguard..."
              : aba === "entrar"
                ? "Entrar"
                : "Criar Conta"}
          </button>
        </form>

        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 border-t border-slate-700" />
          <span className="text-slate-600 text-sm">ou continue com</span>
          <div className="flex-1 border-t border-slate-700" />
        </div>
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
          Entar com Google
        </button>

        <button
          onClick={() => router.push("/dashboard")}
          className="w-full border border-slate-700 hover:bg-slate-800 transition-colors py-3 rounded-lg text-sm font-medium text-slate-300"
        >
          Continuar como visitante
        </button>

        <p className="text-slate-600 text-xs text-center">
          Suas informações são privadas e seguras.
        </p>
      </div>
    </main>
  );
}
