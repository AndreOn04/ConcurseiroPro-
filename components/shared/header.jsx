"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserIcon, Settings, LogOutIcon } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();

  const [menuAberto, setMenuAberto] = useState(false);

  const nome = session?.user?.name ?? "Visitante";

  const inicial = nome.charAt(0).toUpperCase();

  return (
    <header className="w-full h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between px-8 flex-shrink-0">
      {/* Saudação */}
      <div>
        <p className="text-slate-800 dark:text-white font-semibold">
          Olá, bem-vindo, {nome.split("  ")[0]} 👏
        </p>
        <p className="text-slate-400 text-sm">
          {new Date().toLocaleDateString("pt-Br", {
            weekday: "long",
            day: "2-digit",
            month: "long",
          })}
        </p>
      </div>

      {/* Avatar com Dropdown */}
      <div className="flex items-center gap-4 relative">
        <ThemeToggle />
        <button
          onClick={() => setMenuAberto(!menuAberto)}
          className="flex items-center cursor-pointer gap-3 hover:opacity-80 transition-opacity"
        >
        
          {session?.user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
                src={session.user.image}
                alt={nome}
                className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {inicial}
            </div>
          )}
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-slate-800 dark:text-white">
              {" "}
              {nome}{" "}
            </p>
            <p className="text-sm text-slate-400"> {session?.user?.email} </p>
          </div>
        </button>


        {/* DropDown */}
        {menuAberto && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuAberto(false)}
            />
            <div className="absolute right-0 top-12 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg w-48 py-2 flex flex-col">
              <button
                onClick={() => {
                  router.push("/perfil");
                  setMenuAberto(false);
                }}
                className="flex items-center gap-3 cursor-pointer px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Settings size={16} />
                Meu Perfil
              </button>
              <div className="border-t border-slate-200 dark:border-slate-800 my-1" />
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOutIcon size={16} />
                Sair
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
