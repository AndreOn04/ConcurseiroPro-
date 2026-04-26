"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  { href: "/dashboard", label: "Visão Geral", icon: "🏠" },
  { href: "/cronograma", label: "Cronograma", icon: "🗓️" },
  { href: "/materias", label: "Matérias", icon: "📚" },
  { href: "/timer", label: "Pomodoro", icon: "⏱️" },
  // { href: "/simulacoes", label: "Questões & Simulados", icon: "📝" },
  { href: "/relatorias", label: "Relatórios", icon: "📊" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="px-6 py-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-indigo-400">
            ConcurseiroPro
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={` flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"} `}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-800 flex flex-col gap-3">
        <ThemeToggle />
        <Link
          href="/"
          className="text-slate-600 hover:text-slate-400 text-xs transition-colors"
        >
          ← Voltar ao início
        </Link>
      </div>
    </aside>
  );
}
