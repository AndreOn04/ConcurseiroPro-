"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-14 h-7 rounded-full bg-slate-700 animate-pulse" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Alternar tema"
      className={`relative inline-flex items-center w-14 h-7 cursor-pointer rounded-full transition-colors duration-300 focus:outline-none ${
        isDark ? "bg-indigo-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute left-1 flex items-center justify-center w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 text-xs ${
          isDark ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {isDark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}