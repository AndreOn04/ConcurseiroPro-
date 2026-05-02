import { Sidebar } from "@/components/shared/sidebar";
import Header  from "@/components/shared/header";
import { Metadata } from "next";

export const metaData: Metadata = {
  title: "ConcurseiroPro",
  description: "Sua plataforma gratuita de estudos para concursos públicos.",
  icons: {
    icon: "/public/favicon.png",
    apple: "/public/favicon.png"
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}