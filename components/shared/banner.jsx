"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function BannerBeta() {
    const [fechado, setFechado] = useState(false);

    if(fechado) return null;

    return (
        <div className="w-full bg-indigo-600 text-white px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 justify-center">
                <span className="text-sm">
                    🚧 <strong>Versão Beta</strong> — O ConcurseiroPro está em desenvolvimento ativo. Algumas funcionalidades podem estar incompletas. Obrigado pela paciência! 😊
                </span>
            </div>
            <button
                onClick={() => setFechado(true)}
                className="text-white/70 hover:text-white transition-colors flex-shirink-0"
            >
                <X size={16} />
            </button>
        </div>
    )
}