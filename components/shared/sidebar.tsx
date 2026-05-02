"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Timer,
  FileText,
  BarChart2,
  ArrowBigLeft,
  RefreshCcw,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/cronograma", label: "Cronograma", icon: CalendarDays },
  { href: "/materias", label: "Matérias", icon: BookOpen },
  { href: "/timer", label: "Pomodoro", icon: Timer },
  { href: "/simulacoes", label: "Questões", icon: FileText },
  { href: "/ciclos", label: "Ciclos", icon: RefreshCcw },
  { href: "/relatorios", label: "Relatórios", icon: BarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const [showConfirm, setShowConfirm] = useState(false);
  return (
    <aside className="w-64 h-screen sticky top-0 bg-slate-900 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
      <div className="px-6 py-6">
        {" "}
        {/* border-b border-slate-800 */}
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-indigo-400">
            ConcurseiroPro
          </span>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={` flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-indigo-600 text-white" : "text-white hover:bg-slate-200 hover:text-black"} `}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-800 flex flex-col gap-3">
        {showConfirm ? (
          <div className="flex items-center gap-3 animate-in fade-in duration-300">
            <span className="text-slate-400 text-sm">
              {" "}
              Tem certeza que realmente deseja sair?{" "}
            </span>
            <Link
              href="/login"
              className="text-slate-600 flex items-center gap-2 hover:text-slate-400 text-xs transition-colors"
            >
              Sim
            </Link>
            <button
              onClick={() => setShowConfirm(false)}
              className="text-slate-600 hover:text-slate-400 cursor-pointer text-sm transition-colors"
            >
              Não
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            className="text-slate-600 flex items-center gap-2 hover:text-slate-400 text-xs transition-colors"
          >
            <ArrowBigLeft size={20} /> Voltar ao início
          </button>
        )}
      </div>
    </aside>
  );
}
