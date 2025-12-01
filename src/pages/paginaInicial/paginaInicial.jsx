import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from 'react-router-dom';
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

const API_ESTOQUE_URL = "http://localhost:3001/estoque";
const API_CLIENTES_URL = "http://localhost:3001/clientes";

const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
};

const isFuture = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
};

const parseDate = (dateString) => {
    if (!dateString) return null;
    try {
        if (dateString.includes('/')) {
            const parts = dateString.split('/');
            return new Date(parts[2], parts[1] - 1, parts[0]);
        } else if (dateString.includes('-')) {
            const parts = dateString.split('-');
            return new Date(parts[0], parts[1] - 1, parts[2]);
        }
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date;
        }
    } catch(e) {
      console.error("Erro ao parsear data:", dateString, e);
    }
    return null;
};

export default function PaginaInicial() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(80);
  const headerRef = useRef(null);
  const navigate = useNavigate();

  const [estoqueData, setEstoqueData] = useState([]);
  const [clientesData, setClientesData] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [estoqueRes, clientesRes] = await Promise.all([
          fetch(API_ESTOQUE_URL),
          fetch(API_CLIENTES_URL),
        ]);
        const estoqueJson = await estoqueRes.json();
        const clientesJson = await clientesRes.json();
        setEstoqueData(estoqueJson);
        setClientesData(clientesJson);
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const calculatedKpiData = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const itensBaixoEstoque = estoqueData.filter(
      (item) => item.quantidade < item.estoqueMinimo && item.quantidade > 0
    );
    const countItensBaixo = itensBaixoEstoque.length;

    const todosAgendamentos = clientesData.flatMap(cliente =>
        (cliente.historicoServicos || []).map(servico => ({
            ...servico,
            clienteNome: cliente.nome,
            dataServicoObj: parseDate(servico.dataServico)
        }))
    ).filter(servico => servico.dataServicoObj);

    const agendamentosHoje = todosAgendamentos.filter(
        servico => isToday(servico.dataServicoObj)
    ).length;

    const agendamentosFuturos = todosAgendamentos.filter(
        servico => isFuture(servico.dataServicoObj)
    ).length;

    const totalServicosHistorico = todosAgendamentos.length;
    const taxaOcupacao = totalServicosHistorico > 0
      ? ((agendamentosFuturos / totalServicosHistorico) * 100).toFixed(0)
      : 0;

    return [
      { title: "Total de Itens em Baixo Estoque", value: countItensBaixo, icon: Info, caption: `${countItensBaixo} item(ns) requer atenção` },
      { title: "Agendamentos de Hoje", value: agendamentosHoje, icon: CalendarDays, caption: `${agendamentosHoje} serviço(s) hoje` },
      { title: "Taxa de Ocupação de Serviços", value: `${taxaOcupacao}%`, icon: TrendingUp, caption: `${agendamentosFuturos} agendamentos futuros` },
      { title: "Total de Agendamentos Futuros", value: agendamentosFuturos, icon: Clock, caption: `Próximos serviços` },
    ];
  }, [estoqueData, clientesData]);

  const alertasEstoque = useMemo(() => {
    return estoqueData
      .filter((item) => item.quantidade < item.estoqueMinimo)
      .sort((a, b) => a.quantidade - b.quantidade)
      .slice(0, 3)
      .map(item => ({
          id: item.id,
          nome: item.nome,
          estoque: item.quantidade,
          status: item.quantidade === 0 ? "Crítico" : "Atenção"
      }));
  }, [estoqueData]);

  const proximosAgendamentos = useMemo(() => {
    return clientesData
      .flatMap(cliente =>
        (cliente.historicoServicos || []).map(servico => ({
            idServico: servico.id || `temp-${servico.dataServico}-${Math.random()}`,
            idCliente: cliente.id,
            clienteNome: cliente.nome,
            tipo: servico.servico,
            dataServicoObj: parseDate(servico.dataServico),
            dataOriginal: servico.dataServico
        }))
      )
      .filter(servico => servico.dataServicoObj && isFuture(servico.dataServicoObj))
      .sort((a, b) => a.dataServicoObj - b.dataServicoObj)
      .slice(0, 3)
      .map(ag => {
          let diaTexto = ag.dataOriginal;
          if (ag.dataServicoObj) {
              const hoje = new Date(); hoje.setHours(0,0,0,0);
              const amanha = new Date(hoje); amanha.setDate(hoje.getDate() + 1);
              if (ag.dataServicoObj.getTime() === hoje.getTime()) {
                  diaTexto = "Hoje";
              } else if (ag.dataServicoObj.getTime() === amanha.getTime()) {
                  diaTexto = "Amanhã";
              }
              else {
                  diaTexto = ag.dataServicoObj.toLocaleDateString('pt-BR');
              }
          }
          return {
              ...ag,
              dia: diaTexto
          }
      });
  }, [clientesData]);

  const handleEstoqueItemClick = (itemId) => {
    console.log(`Navegando para /estoque com foco no item ID: ${itemId}`);
    navigate('/estoque', { state: { focusItemId: itemId } });
  };

  const handleAgendamentoItemClick = (idCliente, idServico) => {
    console.log(`Navegando para /clientes com foco no cliente ${idCliente}, serviço ${idServico}`);
    navigate('/clientes', { state: { focusClienteId: idCliente, focusServicoId: idServico } });
  };


  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-[Inter]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col">
          <Header
              ref={headerRef}
              toggleSidebar={toggleSidebar}
              sidebarOpen={sidebarOpen}
          />

          <main
            className="flex-1 flex flex-col items-center justify-start px-6 sm:px-8 md:px-10 py-10 gap-10 transition-all duration-300"
            style={{ paddingTop: `${headerHeight + 40}px` }}
          >
            {/* Título */}
            <div className="text-center mb-4 px-2 w-full max-w-[1600px]">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 mb-2">
                Painel de Controle
              </h1>
              <p className="text-gray-500 text-sm sm:text-base">
                Visualize todas as informações importantes em um só lugar
              </p>
            </div>

            {/* KPIs */}
            <div className="w-full max-w-[1600px]">
              {loading ? <p>Carregando KPIs...</p> : <Kpis stats={calculatedKpiData} />}
            </div>

            {/* Seções lado a lado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-[1600px] mx-auto px-2">
              {/* Alertas de Estoque */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="bg-[#003d6b] text-white py-4 px-6 text-center font-semibold text-lg tracking-wide">
                  Alertas de Estoque ( Total: {alertasEstoque.length} )
                </div>
                <div className="divide-y divide-gray-100 min-h-[200px]">
                  {loading ? <p className="p-6 text-center">Carregando...</p> :
                   alertasEstoque.length === 0 ? <p className="p-6 text-center text-gray-500">Nenhum item com estoque baixo.</p> :
                   alertasEstoque.map((produto) => (
                    <div
                      key={produto.id}
                      className="flex flex-col md:flex-row items-center justify-between px-6 py-4"
                    >
                      <div className="text-center md:text-left">
                        <p className="font-semibold text-gray-800 text-base">
                          {produto.nome}
                        </p>
                        <p className="text-sm text-gray-600">
                          Estoque: {produto.estoque} unidades
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-3 md:mt-0">
                        <span
                          className={`text-sm px-4 py-2 rounded-full font-bold ${
                            produto.status === "Crítico"
                              ? "bg-red-200 text-black-800"
                              : "bg-yellow-200 text-black-800"
                          }`}
                        >
                          {produto.status}
                        </span>
                        <button
                            title="Ver detalhes no estoque"
                            onClick={() => handleEstoqueItemClick(produto.id)}
                            className="border border-gray-300 p-1.5 rounded-md hover:bg-gray-100 transition text-gray-600 hover:text-[#003d6b]"
                        >
                          <SlidersHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Próximos Agendamentos */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="bg-[#003d6b] text-white py-4 px-6 text-center font-semibold text-lg tracking-wide">
                  Próximos Agendamentos ( Total: {proximosAgendamentos.length} )
                </div>
                <div className="divide-y divide-gray-100 min-h-[200px]">
                  {loading ? <p className="p-6 text-center">Carregando...</p> :
                   proximosAgendamentos.length === 0 ? <p className="p-6 text-center text-gray-500">Nenhum agendamento futuro encontrado.</p> :
                   proximosAgendamentos.map((ag) => (
                    <div
                      key={ag.idCliente + '-' + ag.idServico}
                      className="flex flex-col md:flex-row items-center justify-between px-6 py-4"
                    >
                      <div className="text-center md:text-left">
                        <p className="font-semibold text-gray-800 text-base">
                          {ag.clienteNome}
                        </p>
                        <p className="text-sm text-gray-600">
                          {ag.tipo}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-3 md:mt-0">
                        <span className="bg-gray-100 text-gray-700 text-base font-semibold px-5 py-2 rounded-full">
                          {ag.dia}
                        </span>
                        <button
                          title="Ver detalhes do agendamento"
                          onClick={() => handleAgendamentoItemClick(ag.idCliente, ag.idServico)}
                          className="border border-gray-300 p-1.5 rounded-md hover:bg-gray-100 transition text-gray-600 hover:text-[#003d6b]"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
      </div>
    </div>
  );
}