"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardData {
  horasHoje: number;
  totalMaterias: number;
  totalTopicos: number;
  topicosConcluidos: number;
  percentualTopicos: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      const res = await fetch("/api/dashboard");
      if (res.ok) setData(await res.json());
      setLoading(false);
    }
    carregar();
  }, []);

  function formatarHoras(segundos: number) {
    if (segundos === 0) return "0h";
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
  }

  const stats = [
    {
      icon: "⏱️",
      value: loading ? "..." : formatarHoras(data?.horasHoje ?? 0),
      label: "Horas estudadas hoje",
    },
    {
      icon: "📚",
      value: loading ? "..." : String(data?.totalMaterias ?? 0),
      label: "Matérias cadastradas",
    },
    {
      icon: "✅",
      value: loading ? "..." : `${data?.percentualTopicos ?? 0}%`,
      label: "Tópicos concluídos",
    },
    {
      icon: "📖",
      value: loading ? "..." : `${data?.topicosConcluidos ?? 0}/${data?.totalTopicos ?? 0}`,
      label: "Tópicos no total",
    },
  ];

  const quickAccess = [
    {
      icon: "⏱️",
      label: "Iniciar Timer",
      description: "Começar uma sessão Pomodoro",
      href: "/timer",
    },
    {
      icon: "📅",
      label: "Ver Cronograma",
      description: "Consultar seu planejamento",
      href: "/cronograma",
    },
    {
      icon: "📚",
      label: "Ver Matérias",
      description: "Gerenciar suas disciplinas",
      href: "/materias",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Visão Geral</h1>
        <p className="text-slate-400 text-sm mt-1">
          Bem-vindo ao ConcurseiroPro! Aqui está seu resumo de hoje.
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-2"
          >
            <span className="text-2xl">{stat.icon}</span>
            <span className="text-2xl font-bold text-white">{stat.value}</span>
            <span className="text-slate-400 text-sm">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Acesso rápido */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickAccess.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="bg-slate-900 border border-slate-800 hover:border-indigo-700 transition-colors rounded-xl p-5 flex items-center gap-4"
            >
              <span className="text-3xl">{item.icon}</span>
              <div>
                <p className="text-white font-medium">{item.label}</p>
                <p className="text-slate-400 text-xs">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}