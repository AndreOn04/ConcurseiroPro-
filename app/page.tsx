import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-scree bg-slate-950 text-white">
      {/* NavBar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800">
        <span className="text-xl font-bold text-indigo-400">
          {" "}
          ConcurseiroPro{" "}
        </span>
        <Link
          href="/login"
          className="bg-indigo-600 hover:bg-indigo-500 transition-colors px-5 py-2 rounded-lg text-sm font-medium"
        >
          Entrar
        </Link>
      </nav>
      {/* NavBar */}

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-32 gap-6">
        <span className="bg-indigo-950 text-indigo-400 text-xs font-semibold px-4 py-1.5 rounded-full border border-indigo-800">
          100% Gratuito • Sem anúncios. Confia 🫣
        </span>
        <h1 className="text-5xl font-extrabold leading-tight max-w-3xl">
          Organize seus estudos para{"  "}
          <span className="text-indigo-400">concursos públicos</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl">
          Cronogramas, matérias, Pomodoro e simulados - tudo em um só lugar, sem
          pagar nada.
        </p>
        <div className="flex gap-4 mt-4">
          <Link
            href="/login"
            className="bg-indigo-600 hover:bg-indigo-500 transition-colors px-8 py-3 rounded-lg font-semibold"
          >
            Começar agora
          </Link>
          <Link
            href="#functions"
            className="border border-slate-700 hover:border-slate-500 transition-colors px-8 py-3 rounded-lg font-semibold text-slate-300"
          >
            Ver funcionalidades
          </Link>
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="functions" className="px-8 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Tudo que você precisa para conquistar a sonhada aprovação 🚀
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-3"
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="text-lg font-semibold"> {f.title} </h3>
              <p className="text-slate-400 text-sm"> {f.description} </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="text-center px-4 py-24 border-t border-slate-800">
        <h2 className="text-3xl font-bold mb-4"> Pronto para começar? </h2>
        <p className="text-slate-400 mb-8">
          Crie sua conta gratuitamente e comece a estudar com mais organização.
        </p>
        <Link
          href="/login"
          className="bg-indigo-600 hover:bg-indigo-500 transition-colors px-10 py-3 rounded-lg font-semibold"
        >
          Criar conta grátis
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-slate-600 text-sm border-t border-slate-800">
        © 2026 ConcuseiroPro • Feito para concurseiros, por concurseiros.
        Caveira? 🏴‍☠️
      </footer>
    </main>
  );
}

const features = [
  {
    icon: "🗓️",
    title: "Cronograma de Estudos",
    description:
      "Monte seu planejamento semanal e saiba exatamente o que estudar cada dia.",
  },
  {
    icon: "📚",
    title: "Matérias e Tópicos",
    description:
      "Organize suas disciplinas, acompanhe o progresso e marque tópicos concluídos.",
  },
  {
    icon: "⏱️",
    title: "Timer Pomodoro",
    description:
      "Estude com foco usando sessões cronometradas e acompanhe suas horas.",
  },
  {
    icon: "📝",
    title: "Simulados",
    description:
      "Faça questões, veja o gabarito e acompanhe sua evolução por matéria.",
  },
  {
    icon: "📊",
    title: "Distribuição por disciplina",
    description:
      "Visualize graficamente quanto tempo você dedica a cada matéria.",
  },
  {
    icon: "🆓",
    title: "100% Gratuito",
    description:
      "Sem planos pagos, sem anúncios, sem limites. Para sempre gratuito. APROVEITE 🚀",
  },
];
