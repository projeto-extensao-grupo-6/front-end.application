import React, { useState, useEffect, useMemo } from "react";
import Header from "../../shared/components/header/header";
import Sidebar from "../../shared/components/sidebar/sidebar";
import { Search, Check, X, CheckCheck, XCircle, ChevronLeft, ChevronRight } from "lucide-react";

const API_URL = "http://localhost:3000/solicitacoes";
const ITENS_POR_PAGINA = 10;

export default function Acesso() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [activeTab, setActiveTab] = useState('Pendentes'); // Estado para a aba ativa

  const fetchSolicitacoes = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setSolicitacoes(data);
    } catch (error) {
      console.error("Erro ao buscar solicitações:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitacoes();
  }, []);

  const updateSolicitacaoStatus = async (ids, novoStatus) => {
    const promises = ids.map(id =>
      fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situacao: novoStatus }),
      }).then(res => {
        if (!res.ok) throw new Error(`Falha ao atualizar ${id}`);
        return res.json();
      })
    );

    try {
      await Promise.all(promises);
      await fetchSolicitacoes();
      setSelectedItems([]);
    } catch (error) {
      console.error(`Erro ao ${novoStatus === 'Aprovado' ? 'aprovar' : 'recusar'} solicitações:`, error);
    }
  };

  const handleApprove = (id) => {
    updateSolicitacaoStatus([id], 'Aprovado');
  };

  const handleReject = (id) => {
    updateSolicitacaoStatus([id], 'Recusado');
  };

  const handleBulkApprove = () => {
    if (selectedItems.length > 0 && activeTab === 'Pendentes') {
      updateSolicitacaoStatus(selectedItems, 'Aprovado');
    }
  };

  const handleBulkReject = () => {
     if (selectedItems.length > 0 && activeTab === 'Pendentes') {
      updateSolicitacaoStatus(selectedItems, 'Recusado');
    }
  };

   const handleCheckboxChange = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAllChange = (e) => {
    if (e.target.checked) {
      setSelectedItems(paginatedSolicitacoes.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const changeTab = (tab) => {
      setActiveTab(tab);
      setPagina(1); // Reseta a página ao mudar de aba
      setSelectedItems([]); // Limpa a seleção ao mudar de aba
      setBusca(""); // Limpa a busca ao mudar de aba
  }

  // --- Filtering & Pagination ---
  const filteredSolicitacoes = useMemo(() => {
    // 1. Filtra pelo Status da Aba Ativa
    const statusMap = {
        'Pendentes': 'Pendente',
        'Aprovados': 'Aprovado',
        'Recusados': 'Recusado'
    };
    const statusAtual = statusMap[activeTab];
    let items = solicitacoes.filter(s => s.situacao === statusAtual);

    // 2. Filtra pela Busca
    if (busca) {
        items = items.filter(
            (s) =>
                s.nome.toLowerCase().includes(busca.toLowerCase()) ||
                s.cpf.replace(/[.-]/g, "").includes(busca.replace(/[.-]/g, "")) ||
                s.telefone.replace(/[\s()-]/g, "").includes(busca.replace(/[\s()-]/g, ""))
        );
    }
    return items;
  }, [solicitacoes, busca, activeTab]);

  const totalPaginas = Math.ceil(filteredSolicitacoes.length / ITENS_POR_PAGINA);
  const paginatedSolicitacoes = useMemo(() => {
     const paginaAtual = Math.min(pagina, totalPaginas) || 1;
     // Não precisa resetar a página aqui, já fazemos no changeTab
     // if (pagina !== paginaAtual && filteredSolicitacoes.length > 0) {
     //   setPagina(paginaAtual);
     // } else if (filteredSolicitacoes.length === 0 && pagina !== 1) {
     //   setPagina(1);
     // }

    const startIndex = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const endIndex = startIndex + ITENS_POR_PAGINA;
    return filteredSolicitacoes.slice(startIndex, endIndex);
  }, [filteredSolicitacoes, pagina, totalPaginas]);

  const startIndex = (pagina - 1) * ITENS_POR_PAGINA;
  const endIndex = Math.min(startIndex + ITENS_POR_PAGINA, filteredSolicitacoes.length);
  const isAllSelectedOnPage = paginatedSolicitacoes.length > 0 && selectedItems.length >= paginatedSolicitacoes.length && paginatedSolicitacoes.every(item => selectedItems.includes(item.id));

  // Função para pegar a cor da tag de situação
  const getSituacaoStyle = (situacao) => {
      switch(situacao) {
          case 'Pendente': return 'bg-yellow-100 text-yellow-800';
          case 'Aprovado': return 'bg-green-100 text-green-800';
          case 'Recusado': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100 text-gray-800';
      }
  }


  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <div className="h-[80px]" />

        <main className="flex-1 p-8">
          <div className="max-w-[1800px] mx-auto">

            <div className="mb-10 text-center">
              <h1 className="text-3xl font-bold text-gray-800">Controle de acesso</h1>
              <p className="text-gray-500 text-lg">
                Visualize todas as solicitações de acessos de sua empresa
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                 <div className="relative w-full md:w-1/2 lg:w-1/3">
                    <input
                        type="text"
                        placeholder="Busque Por Nome, CPF ou Telefone..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7] text-sm"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                 </div>
                 {/* Botões de Ação em Massa - Visíveis apenas na aba Pendentes */}
                 {activeTab === 'Pendentes' && (
                     <div className="flex gap-2 w-full md:w-auto justify-end">
                        <button
                            onClick={handleBulkApprove}
                            disabled={selectedItems.length === 0}
                            className="border border-green-600 text-green-600 font-medium py-2 px-4 rounded-md hover:bg-green-50 transition-colors text-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           <CheckCheck className="w-4 h-4"/> Aprovar ({selectedItems.length})
                        </button>
                        <button
                            onClick={handleBulkReject}
                            disabled={selectedItems.length === 0}
                            className="border border-red-600 text-red-600 font-medium py-2 px-4 rounded-md hover:bg-red-50 transition-colors text-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <XCircle className="w-4 h-4"/> Recusar ({selectedItems.length})
                        </button>
                     </div>
                 )}
              </div>

              {/* ABAS */}
              <div className="mb-4 border-b border-gray-200">
                  <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                      {['Pendentes', 'Aprovados', 'Recusados'].map((tab) => (
                      <button
                          key={tab}
                          onClick={() => changeTab(tab)}
                          className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ease-in-out focus:outline-none
                            ${activeTab === tab
                                ? 'border-[#007EA7] text-[#007EA7]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          aria-current={activeTab === tab ? 'page' : undefined}
                      >
                          {tab}
                      </button>
                      ))}
                  </nav>
              </div>

              {/* Tabela */}
              <div className="overflow-x-auto">
                <div className="flex items-center bg-gray-50 border-b border-gray-200 min-h-[48px] rounded-t-md text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <div className="py-3 w-[5%] flex justify-center px-4">
                    {/* Checkbox "Selecionar Todos" visível apenas em Pendentes */}
                    {activeTab === 'Pendentes' && (
                        <input type="checkbox"
                               checked={isAllSelectedOnPage}
                               onChange={handleSelectAllChange}
                               className="w-4 h-4 text-[#003d6b] border-gray-300 rounded focus:ring-[#003d6b]" />
                    )}
                  </div>
                  <div className="py-3 w-[20%] px-4">Nome</div>
                  <div className="py-3 w-[15%] px-4">CPF</div>
                  <div className="py-3 w-[15%] px-4">Telefone</div>
                  <div className="py-3 w-[15%] px-4">Cargo</div>
                  <div className="py-3 w-[15%] px-4 text-center">Situação</div>
                  <div className="py-3 w-[15%] px-4 text-center">Ações</div>
                </div>

                <div>
                  {loading ? (
                    <p className="text-center p-4 text-gray-500">Carregando...</p>
                  ) : paginatedSolicitacoes.length === 0 ? (
                    <p className="text-center p-4 text-gray-500">Nenhuma solicitação encontrada para esta aba.</p>
                  ): (
                    paginatedSolicitacoes.map((s) => (
                      <div key={s.id} className="flex items-center border-b last:border-b-0 hover:bg-gray-50 min-h-[56px] text-sm">
                         <div className="w-[5%] flex justify-center px-4">
                            {/* Checkbox Individual visível apenas em Pendentes */}
                            {activeTab === 'Pendentes' && (
                                <input
                                    type="checkbox"
                                    checked={selectedItems.includes(s.id)}
                                    onChange={() => handleCheckboxChange(s.id)}
                                    className="w-4 h-4 text-[#003d6b] border-gray-300 rounded focus:ring-[#003d6b]"
                                />
                            )}
                         </div>
                         <div className="w-[20%] px-4 text-gray-900 font-medium">{s.nome}</div>
                         <div className="w-[15%] px-4 text-gray-600">{s.cpf}</div>
                         <div className="w-[15%] px-4 text-gray-600">{s.telefone}</div>
                         <div className="w-[15%] px-4 text-gray-600">{s.cargo}</div>
                         <div className="w-[15%] px-4 text-center">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSituacaoStyle(s.situacao)}`}>
                                {s.situacao}
                            </span>
                         </div>
                         <div className="w-[15%] px-4 text-center flex justify-center gap-2">
                            {/* Botões de Ação visíveis apenas em Pendentes */}
                            {activeTab === 'Pendentes' ? (
                                <>
                                    <button
                                        onClick={() => handleApprove(s.id)}
                                        title="Aprovar"
                                        className="p-1.5 rounded-full text-green-600 hover:bg-green-100 transition-colors"
                                    >
                                        <Check className="w-5 h-5"/>
                                    </button>
                                     <button
                                        onClick={() => handleReject(s.id)}
                                        title="Recusar"
                                        className="p-1.5 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                                     >
                                        <X className="w-5 h-5"/>
                                    </button>
                                </>
                            ) : (
                                <span className="text-gray-400">-</span> // Mostra um traço se não for pendente
                            )}
                         </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
                <p className="text-sm text-gray-600">
                  Mostrando <span className="font-medium">{filteredSolicitacoes.length > 0 ? startIndex + 1 : 0}-{endIndex}</span> de <span className="font-medium">{filteredSolicitacoes.length}</span> resultados
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagina((p) => Math.max(p - 1, 1))}
                    disabled={pagina === 1}
                    className="flex items-center gap-1 border border-gray-300 py-2 px-4 rounded-md text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" /> Anterior
                  </button>
                  <button
                    onClick={() => setPagina((p) => Math.min(p + 1, totalPaginas))}
                    disabled={pagina === totalPaginas || totalPaginas === 0}
                    className="flex items-center gap-1 border border-gray-300 py-2 px-4 rounded-md text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Próximo <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}