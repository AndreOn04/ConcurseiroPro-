"use client";
import Link from "next/link";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { title } from "process";

import { useState } from "react";

function FaqItem({
  pergunta,
  resposta,
}: {
  pergunta: string;
  resposta: string;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center justify-between px-6 cursor-pointer py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
      >
        <span className="font-medium text-sm">{pergunta}</span>
        <span className="text-indigo-500 text-lg ml-4">
          {aberto ? "−" : "+"}
        </span>
      </button>
      {aberto && (
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-slate-400 text-sm leading-relaxed">{resposta}</p>
        </div>
      )}
    </div>
  );
}
export default function Home() {
  return (
    <main className="min-h-scree bg-slate-950 text-white">
      {/* NavBar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-200 dark:border-slate-800">
        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
          ConcurseiroPro
        </span>
        <div className="hidden md:flex items-center gap-6">
          <a
            href="#funcionalidades"
            className="text-slate-700 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 text-sm transition-colors"
          >
            Funcionalidades
          </a>
          <a
            href="#como-funciona"
            className="text-slate-700 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 text-sm transition-colors"
          >
            Como funciona
          </a>
          <a
            href="#sobre"
            className="text-slate-700 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 text-sm transition-colors"
          >
            Sobre
          </a>
          <a
            href="#faq"
            className="text-slate-700 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 text-sm transition-colors"
          >
            Perguntas Frequentes
          </a>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/login"
            className="bg-indigo-600 hover:bg-indigo-500 transition-colors px-5 py-2 rounded-lg text-sm font-medium !text-white"
          >
            Criar Conta
          </Link>
        </div>
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
            className="bg-indigo-600 hover:bg-indigo-500 transition-colors px-8 py-3 rounded-lg font-semibold !text-white"
          > 
            Começar agora
          </Link>
          <Link
            href="#funcionalidades"
            className="border border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors px-8 py-3 rounded-lg font-semibold text-slate-700 dark:text-slate-300"
          >
            Ver funcionalidades
          </Link>
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" className="px-8 py-20 max-w-6xl mx-auto">
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

      {/* Como funciona */}
      <section id="como-funciona" className="px-8 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4"> Como funciona </h2>
        <p className="text-slate-400 text-center mb-12">
          {" "}
          Em 3 passos simples você já está organizando seus estudos.{" "}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold !text-white">
                {i + 1}
              </div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-slate-400 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ - Perguntas Frequentes */}
      <section id="faq" className="px-8 py-20 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          {" "}
          Perguntas Frequentes{" "}
        </h2>
        <div className="flex flex-col gap-4">
          {faqs.map((faq, i) => (
            <FaqItem key={i} pergunta={faq.pergunta} resposta={faq.resposta} />
          ))}
        </div>
      </section>

      {/* Sobre */}
      <section
        id="sobre"
        className="px-8 py-20 max-w-4xl mx-auto text-center border-t border-slate-800 dark:border-slate-800 border-slate-200"
      >
        <h2 className="text-3xl font-bold mb-6">Sobre o ConcurseiroPro</h2>
        <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto">
          O ConcurseiroPro nasceu da frustração de concurseiros que precisavam
          de uma ferramenta completa, gratuita e sem anúncios para organizar
          seus estudos. Desenvolvido por quem entende a realidade de quem estuda
          para concursos públicos, o ConcurseiroPro reúne tudo que você precisa
          em um só lugar — sem cobrar nada por isso.
        </p>
        <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto mt-4">
          Nossa missão é democratizar o acesso a ferramentas de qualidade para
          todos os concurseiros do Brasil, independente da sua condição
          financeira.
        </p>
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

const steps = [
  {
    title: "Crie sua conta grátis",
    description:
      "Cadastre-se em menos de 1 minuto com seu e-mail ou conta Google. Sem enrolação",
  },
  {
    title: "Configure suas matérias",
    description:
      "Adicione suas disciplinas, tópicos e monte seu cronograma semanal personalizado.",
  },
  {
    title: "Estude com inteligência",
    description:
      "Use o timer Pomodoro, faça simulados com IA e acompanhe sua evolução em tempo real.",
  },
];

const faqs = [
  {
    pergunta: "O ConcurseiroPro é realmente gratuito?",
    resposta:
      "Sim! 100% gratuito, sem planos pagos, sem anúncios e sem limites. Nossa missão é democratizar o acesso a ferramentas de qualidade para concurseiros.",
  },
  {
    pergunta: "Como funciona o simulado com IA?",
    resposta:
      "Nossa IA gera questões personalizadas baseadas na matéria e tópico que você escolher, no estilo das principais bancas como CESPE, FCC e VUNESP. Você ainda pode pedir comentários detalhados de cada questão.",
  },
  {
    pergunta: "Meus dados ficam salvos?",
    resposta:
      "Sim! Ao criar uma conta, todos os seus dados ficam salvos em nosso servidor seguro. Você pode acessar de qualquer dispositivo a qualquer momento.",
  },
  {
    pergunta: "Posso usar sem criar uma conta?",
    resposta:
      "Sim, você pode explorar o dashboard como visitante. Porém, para salvar seu progresso, cronograma e histórico de estudos, é necessário criar uma conta gratuita.",
  },
  {
    pergunta: "O timer Pomodoro salva meu histórico?",
    resposta:
      "Sim! Cada sessão completa é salva automaticamente com a matéria vinculada, duração e data. Você pode acompanhar seu histórico de estudos pelo dashboard.",
  },
  {
    pergunta: "Como funciona a verificação de e-mail?",
    resposta:
      "Ao criar sua conta, você receberá um código de 6 dígitos no seu e-mail. Basta inserir o código para ativar sua conta. O código expira em 10 minutos.",
  },
];

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
