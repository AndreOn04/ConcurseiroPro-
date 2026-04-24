export default function DeshboardPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Visão Geral</h1>
        <p className="text-slate-400 text-sm mt-1">
          Bem-vindo ao ConcurseiroPro! Aqui está seu resumo de hoje.
        </p>
      </div>

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

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Acesso rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickAccess.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="bg-slate-900 border border-slate-800 hover:border-indigo-700 transition-colors rounded-xl p-5 flex items-center gap-4"
            >
              <span className="text-3xl">{item.icon}</span>
              <div>
                <p className="text-white font-medium">{item.label}</p>
                <p className="text-white font-medium">{item.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

const stats = [
  { icon: "⏱️", value: "0h", label: "Horas estudadas hoje" },
  { icon: "📚", value: "0h", label: "Matérias cadastradas" },
  { icon: "📝", value: "0h", label: "Simulados realizados" },
  { icon: "✅", value: "0h", label: "Tópicos concluídos" },
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
    icon: "📝",
    label: "Fazer Simulado",
    description: "Testar seus conhecimentos",
    href: "/simulacoes",
  },
];
