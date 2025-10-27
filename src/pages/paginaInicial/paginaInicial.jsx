import React, { useState, useEffect, useRef } from "react";
import Header from "../../shared/components/header/header";
import Sidebar from "../../shared/components/sidebar/sidebar";
import {
  Info,
  CalendarDays,
  TrendingUp,
  Clock,
  SlidersHorizontal,
  ExternalLink,
} from "lucide-react";
import Kpis from "../../shared/components/kpis/kpis";

export default function PaginaInicial() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const kpiData = [
    { title: "Total de Itens em Estoque abaixo do ideal", value: "0.00", icon: Info, caption: "0 novos alertas hoje" },
    { title: "Agendamentos de Hoje", value: "0", icon: CalendarDays, caption: "0 serviços nas próximas 3 horas" },
    { title: "Taxa de ocupação de serviços da semana", value: "00%", icon: TrendingUp, caption: "0% da capacidade utilizada" },
    { title: "Agendamentos semanais ativos", value: "00", icon: Clock, caption: "+0 novos" },
  ];

  const produtos = [
    { nome: "Produto A", estoque: 5, status: "Crítico" },
    { nome: "Produto B", estoque: 10, status: "Atenção" },
    { nome: "Produto C", estoque: 12, status: "Atenção" },
  ];

  const agendamentos = [
    { cliente: "Nome cliente", tipo: "Tipo Instalação", horario: "15:00", dia: "Hoje" },
    { cliente: "Nome cliente", tipo: "Tipo Instalação", horario: "15:00", dia: "Hoje" },
    { cliente: "Nome cliente", tipo: "Tipo Instalação", horario: "15:00", dia: "Hoje" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] font-[Inter]">
      {/* Header com ref para medir altura */}
      <div ref={headerRef}>
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <div className="h-[40px] sm:h-[45px] md:h-[50px]" />
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Conteúdo principal com padding dinâmico */}
      <main
        className="flex flex-col items-center justify-start px-6 sm:px-8 md:px-10 pb-12 gap-10 transition-all duration-300"
        style={{ paddingTop: `${headerHeight + 20}px` }}
      >
        {/* Título */}
        <div className="text-center mb-4 px-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 mb-2">
            Painel de Controle
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Visualize todas as informações importantes em um só lugar
          </p>
        </div>

        {/* KPIs */}
        <div className="w-full max-w-[1600px]">
          <Kpis stats={kpiData} />
        </div>

        {/* Seções lado a lado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-[1600px] mx-auto px-2">
          {/* Alertas de Estoque */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="bg-[#003d6b] text-white py-4 px-6 text-center font-semibold text-lg tracking-wide">
              Alertas de Estoque
            </div>
            <div className="divide-y divide-gray-100">
              {produtos.map((produto, idx) => (
                <div
                  key={idx}
                  className="flex flex-col md:flex-row items-center justify-between px-6 py-6"
                >
                  <div className="text-center md:text-left">
                    <p className="font-semibold text-gray-800 text-base">
                      {produto.nome}
                    </p>
                    <p className="text-sm text-gray-600">
                      Estoque baixo: {produto.estoque} unidades
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <span
                      className={`text-xs font-medium px-4 py-2 rounded-md ${
                        produto.status === "Crítico"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {produto.status}
                    </span>
                    <button className="border border-gray-300 p-2 rounded-md hover:bg-gray-50 transition">
                      <SlidersHorizontal className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Próximos Agendamentos */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="bg-[#003d6b] text-white py-4 px-6 text-center font-semibold text-lg tracking-wide">
              Próximos Agendamentos
            </div>
            <div className="divide-y divide-gray-100">
              {agendamentos.map((ag, idx) => (
                <div
                  key={idx}
                  className="flex flex-col md:flex-row items-center justify-between px-6 py-6"
                >
                  <div className="text-center md:text-left">
                    <p className="font-semibold text-gray-800 text-base">
                      {ag.cliente}
                    </p>
                    <p className="text-sm text-gray-600">
                      {ag.tipo} - {ag.horario}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <span className="bg-gray-100 text-gray-700 text-xs font-medium px-4 py-2 rounded-md">
                      {ag.dia}
                    </span>
                    <button className="border border-gray-300 p-2 rounded-md hover:bg-gray-50 transition">
                      <ExternalLink className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}