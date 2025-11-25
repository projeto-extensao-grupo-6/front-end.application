import React, { useState, useEffect, useMemo, useCallback } from "react";
import Api from "../../axios/Api";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../shared/components/header/header";
import Sidebar from "../../shared/components/sidebar/sidebar";
import {
  Package,
  Search,
  CalendarDays,
  Filter,
  Download,
  ChevronDown,
  ArrowRightLeft,
} from "lucide-react";
import NovoProdutoModal from "../../shared/components/modalEstoque/NovoProdutoModal";
import SucessoModal from "../../shared/components/modalEstoque/SucessoModal";
import ExportarModal from "../../shared/components/modalEstoque/ExportarModal";
import EstoqueItemRow from "../../shared/components/modalEstoque/EstoqueItemRow";
import CalendarDropdown from "../../shared/components/estoque/CalendarDropdown";
import FilterDropdown from "../../shared/components/estoque/FilterDropdown";
import EntradaSaidaEstoque from "../../shared/components/modalEstoque/EntradaSaidaEstoque";
import InativarProdutoModal from "../../shared/components/modalEstoque/InativarProdutoModal";

const ITENS_POR_PAGINA = 6;

export default function Estoque() {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [estoque, setEstoque] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isNovoItemModalOpen, setIsNovoItemModalOpen] = useState(false);
  const [isEntradaSaidaModalOpen, setIsEntradaSaidaModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  
  const [busca, setBusca] = useState("");
  const [selectedFilterDate, setSelectedFilterDate] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});
 
  const [pagina, setPagina] = useState(1);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEstoqueId, setSelectedEstoqueId] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const focusItemId = location.state?.focusItemId;

  
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const formatCurrency = useCallback((value) => {
    if (typeof value !== "number") value = 0;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }, []);

  const parseCurrency = useCallback((value) => {
    return parseFloat(String(value).replace(/[R$\s.]/g, "").replace(",", ".")) || 0;
  }, []);

  const toYYYYMMDD = useCallback((date) => {
    if (!date) return null;
    return date.toISOString().split("T")[0];
  }, []);

  const mapEstoqueFromApi = useCallback((data) => {
    return data.map((item) => ({
      id: item.id,
      quantidadeTotal: item.quantidadeTotal ?? 0,
      quantidadeDisponivel: item.quantidadeDisponivel ?? 0,
      reservado: item.reservado ?? 0,
      localizacao: item.localizacao || "Não informado",
      produto: {
        id: item.produto.id,
        nome: item.produto.nome,
        descricao: item.produto.descricao || "",
        unidademedida: item.produto.unidademedida || "unidade",
        preco: item.produto.preco ?? 0,
        ativo: item.produto.ativo ?? true,
       
        estoqueMinimo: item.produto.metrica?.nivelMinimo ?? 0,
        estoqueMaximo: item.produto.metrica?.nivelMaximo ?? 0,
        // Atributos do produto
        atributos: item.produto.atributos || [],
        // Campos calculados/compatibilidade
        quantidade: item.quantidadeDisponivel ?? 0,
        tipo: item.produto.atributos?.find(attr => attr.tipo === "categoria")?.valor || "Geral",
      }
    }));
  }, []);
  
  const fetchEstoque = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
  
      const response = await Api.get("/estoques");
      const data = response.data;
  
      if (!data || data.length === 0) {
        setEstoque([]);
        return;
      }
  
      const estoqueMapeado = mapEstoqueFromApi(data);
      setEstoque(estoqueMapeado);
  
    } catch (error) {
      console.error("Erro ao buscar estoque:", error);
      setError("Não foi possível carregar o estoque. Tente novamente.");
      setEstoque([]);
    } finally {
      setLoading(false);
    }
  }, [mapEstoqueFromApi]);

  
  useEffect(() => {
    fetchEstoque();
  }, [fetchEstoque]);

  
  const filteredEstoque = useMemo(() => {
    let items = estoque;

    if (busca.trim()) {
      const buscaLower = busca.toLowerCase();
      items = items.filter(
        (item) =>
          item.produto.nome.toLowerCase().includes(buscaLower) ||
          item.produto.descricao.toLowerCase().includes(buscaLower) ||
          item.localizacao.toLowerCase().includes(buscaLower)
      );
    }

    if (selectedFilterDate) {
      console.log("Filtro de data selecionado:", selectedFilterDate);
    }

    const situacaoFilters = activeFilters.situacao || [];
    if (situacaoFilters.length > 0) {
      items = items.filter((item) => {
        const quantidade = item.quantidadeDisponivel;
        const estoqueMinimo = item.produto.estoqueMinimo;
        
        const situacao =
          quantidade === 0
            ? "Fora de estoque"
            : quantidade < estoqueMinimo
            ? "Abaixo do normal"
            : "Disponível";
            
        return situacaoFilters.includes(situacao);
      });
    }

    const statusFilters = activeFilters.tipo || [];
    if (statusFilters.length > 0) {
      items = items.filter((item) => {
        const statusProduto = item.produto?.ativo ? "Ativo" : "Inativo";
        return statusFilters.includes(statusProduto);
      });
    }

    return items;
  }, [estoque, busca, selectedFilterDate, activeFilters]);

  
  const paginationData = useMemo(() => {
    const totalPaginas = Math.ceil(filteredEstoque.length / ITENS_POR_PAGINA);
    const paginaAtual = Math.min(pagina, totalPaginas) || 1;
    const startIndex = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const endIndex = startIndex + ITENS_POR_PAGINA;
    
    return {
      items: filteredEstoque.slice(startIndex, endIndex),
      totalPaginas,
      startIndex,
      endIndex: Math.min(endIndex, filteredEstoque.length),
      total: filteredEstoque.length
    };
  }, [filteredEstoque, pagina]);
  
  useEffect(() => {
    if (focusItemId && filteredEstoque.length > 0 && focusItemId !== expandedItemId) {
      setExpandedItemId(focusItemId);
      
      const itemIndex = filteredEstoque.findIndex((item) => item.id === focusItemId);
      
      if (itemIndex !== -1) {
        const targetPage = Math.ceil((itemIndex + 1) / ITENS_POR_PAGINA);
        
        if (pagina !== targetPage) {
          setPagina(targetPage);
        }
        
        setTimeout(() => {
          const element = document.getElementById(`item-${focusItemId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 300);
      }
    }
  }, [focusItemId, filteredEstoque, expandedItemId, pagina]);

const handleSaveItem = useCallback(async (itemData) => {
  try {
    if (itemData && itemData.id && itemData.produto) {
      await fetchEstoque();
      setIsNovoItemModalOpen(false);
      setIsSuccessModalOpen(true);
      
      setTimeout(() => {
        setIsSuccessModalOpen(false);
      }, 3000);
      return;
    }

    const itemPayload = {
      ...itemData,
      preco: parseCurrency(itemData.preco),
      quantidade: parseInt(itemData.quantidade, 10) || 0,
      estoqueMinimo: parseInt(itemData.estoqueMinimo, 10) || 0,
    };

    if (editingItem) {
      await Api.put(`/estoques/${editingItem.id}`, itemPayload);
    }

    await fetchEstoque();
    
    setIsNovoItemModalOpen(false);
    setIsSuccessModalOpen(true);
    
    setTimeout(() => {
      setIsSuccessModalOpen(false);
    }, 3000);
    
  } catch (error) {
    console.error("Erro ao salvar item:", error);
    alert("Erro ao salvar item. Tente novamente.");
  }
}, [editingItem, fetchEstoque, parseCurrency]);

  const handleViewDetails = useCallback((estoqueId) => {
    console.log("🔍 Navegando para estoque ID:", estoqueId);
    if (!estoqueId) {
      console.error("Erro: ID do estoque é undefined!");
      return;
    }
    navigate(`/estoque/${estoqueId}`);
  }, [navigate]);

  const handleSaveMovement = useCallback(async (itemIds, movementData) => {
    try {
      const updates = itemIds.map(async (estoqueId) => {
        const itemToUpdate = estoque.find((item) => item.id === estoqueId);
        if (!itemToUpdate) return;

        const newQuantity =
          movementData.tipo === "Entrada"
            ? itemToUpdate.quantidadeDisponivel + movementData.quantidade
            : itemToUpdate.quantidadeDisponivel - movementData.quantidade;

        const updatedItem = {
          ...itemToUpdate,
          quantidadeDisponivel: Math.max(0, newQuantity),
          quantidadeTotal: Math.max(0, newQuantity),
        };

        return Api.put(`/estoques/${estoqueId}`, updatedItem);
      });

      await Promise.all(updates);
      await fetchEstoque();
      
      setIsEntradaSaidaModalOpen(false);
      setSelectedItems([]);
      
    } catch (error) {
      console.error("Falha ao salvar movimentos:", error);
      alert("Erro ao registrar movimento. Tente novamente.");
    }
  }, [estoque, fetchEstoque]);

  const confirmarInativacao = useCallback(async () => {
    try {
      await Api.put(`/produtos/stand-by/${selectedEstoqueId}`, {
        status: false
      });
  
      await fetchEstoque();
  
      setModalOpen(false);
  
    } catch (error) {
      console.error("Erro ao inativar item:", error);
      alert("Erro ao inativar item. Tente novamente.");
    }
  }, [selectedEstoqueId, fetchEstoque]);
  

  const handleDeleteItem = useCallback((estoqueId) => {
    setSelectedEstoqueId(estoqueId);
    setModalOpen(true);
  }, []);
  
  const openNewItemModal = useCallback(() => {
    setEditingItem(null);
    setIsNovoItemModalOpen(true);
  }, []);

  const openEditItemModal = useCallback((item) => {
    setEditingItem(item);
    setIsNovoItemModalOpen(true);
  }, []);

  const openEntradaSaidaModal = useCallback(() => {
    setIsEntradaSaidaModalOpen(true);
  }, []);
  
  const closeEntradaSaidaModal = useCallback(() => {
    setIsEntradaSaidaModalOpen(false);
  }, []);
  
  const openExportModal = useCallback(() => {
    setIsExportModalOpen(true);
  }, []);
  
  const closeExportModal = useCallback(() => {
    setIsExportModalOpen(false);
  }, []);

  const closeSuccessModal = useCallback(() => {
    setIsSuccessModalOpen(false);
  }, []);
  
  const handleCheckboxChange = useCallback((id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAllChange = useCallback((e) => {
    if (e.target.checked) {
      setSelectedItems(paginationData.items.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  }, [paginationData.items]);
  
  const handleDateFilterChange = useCallback((newDate) => {
    if (newDate) {
      setSelectedFilterDate(newDate);
      setIsCalendarOpen(false);
    }
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setActiveFilters(newFilters);
  }, []);

  const handleCollapseItem = useCallback(() => {
    setExpandedItemId(null);
  }, []);
  
  const hasActiveFilters = useMemo(
    () => Object.values(activeFilters).some((arr) => arr && arr.length > 0),
    [activeFilters]
  );

  const isAllSelectedOnPage = useMemo(() => {
    return (
      paginationData.items.length > 0 &&
      selectedItems.length >= paginationData.items.length &&
      paginationData.items.every((item) => selectedItems.includes(item.id))
    );
  }, [paginationData.items, selectedItems]);
  
  const renderedItems = useMemo(() => {
    return paginationData.items.map((item) => {
      const quantidade = item.quantidadeDisponivel;
      const estoqueMinimo = item.produto.estoqueMinimo;
      
      const situacao =
        quantidade === 0
          ? "Fora de estoque"
          : quantidade < estoqueMinimo
          ? "Abaixo do normal"
          : "Disponível";
    
      return {
        ...item,
        situacao,
        produto: {
          ...item.produto,
          preco: formatCurrency(item.produto.preco),
        }
      };
    });
  }, [paginationData.items, formatCurrency]);
  
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <div className="pt-20 lg:pt-80px" />

        <main className="flex-1 item-center p-4 md:p-8">
          {/* Cabeçalho */}
          <div className="text-center mb-8 px-2 w-full max-w-[1600px]">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 mb-2 flex items-center justify-center gap-2">
              <Package className="w-8 h-8 text-[#007EA7]" />
              Controle de Estoque
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Gerencie produtos e estoque de forma eficiente.
            </p>
          </div>

          <div className="flex max-w-[1800px] mx-auto pt-10 flex-col gap-6">
            
            {/* Tabela de Estoque */}
            <div className="flex flex-col gap-6 bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
              {/* Barra de ações */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
                <div className="flex gap-2 w-full md:w-auto">
                  <button
                    onClick={openNewItemModal}
                    className="bg-[#007EA7] text-white font-semibold py-2 px-5 rounded-md hover:bg-[#006891] transition-colors flex items-center justify-center whitespace-nowrap gap-2 cursor-pointer"
                  >
                    Novo Item
                  </button>
                  <button
                    onClick={openEntradaSaidaModal}
                    disabled={selectedItems.length === 0}
                    className="bg-blue-600 text-white font-medium py-2.5 px-5 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center whitespace-nowrap gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    Registrar Movimento
                  </button>
                </div>

                <div className="flex items-center gap-3 w-full justify-end">
                  {/* Busca */}
                  <div className="relative w-full max-w-lg">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Busque Por Nome ou Descrição..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7] text-sm"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Filtros */}
                  <div className="flex gap-2 w-auto whitespace-nowrap">
                    {/* Calendário */}
                    <div className="relative">
                      <button
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        className="flex items-center gap-2 border border-gray-300 py-2.5 px-4 rounded-md text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <CalendarDays className="w-4 h-4" />
                        {selectedFilterDate
                          ? selectedFilterDate.toLocaleDateString("pt-BR")
                          : "Data"}
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            isCalendarOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <CalendarDropdown
                        isOpen={isCalendarOpen}
                        onClose={() => setIsCalendarOpen(false)}
                        onDateSelect={handleDateFilterChange}
                      />
                    </div>

                    {/* Filtros avançados */}
                    <div className="relative">
                      <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center gap-2 border border-gray-300 py-2.5 px-4 rounded-md text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors ${
                          hasActiveFilters
                            ? "border-[#003d6b] text-[#003d6b] bg-[#e6f0f5]"
                            : ""
                        }`}
                      >
                        <Filter className="w-4 h-4" />
                        Filtrar
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            isFilterOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <FilterDropdown
                        isOpen={isFilterOpen}
                        onClose={() => setIsFilterOpen(false)}
                        selectedFilters={activeFilters}
                        onFilterChange={handleFilterChange}
                      />
                    </div>

                    {/* Exportar */}
                    <button
                      onClick={openExportModal}
                      className="flex items-center gap-2 border border-gray-300 py-2.5 px-4 rounded-md text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Exportar
                    </button>
                  </div>
                </div>
              </div>

              {/* Mensagem de erro */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Tabela */}
              <div className="overflow-x-auto">
                {/* Cabeçalho da tabela */}
                <div className="flex items-center bg-gray-50 border-b border-gray-200 mb-2 min-h-48px rounded-t-md text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <div className="py-3 w-[5%] pl-4 pr-1">
                    <input
                      type="checkbox"
                      checked={isAllSelectedOnPage}
                      onChange={handleSelectAllChange}
                      className="w-4 h-4 text-[#003d6b] border-gray-300 rounded focus:ring-[#003d6b]"
                    />
                  </div>
                  <div className="py-3 w-[15%] pl-2 pr-1">Nome</div>
                  <div className="py-3 w-[25%] px-4">Descrição</div>
                  <div className="py-3 w-[10%] text-center">Preço</div>
                  <div className="py-3 w-[15%] text-center">Quantidade em estoque</div>
                  <div className="py-3 w-[15%] text-center">Status</div>
                  <div className="py-3 w-[15%] text-center">Situação</div>
                  <div className="py-3 w-[15%] text-right pr-8">Ações</div>
                </div>

                {/* Linhas da tabela */}
                <div>
                  {loading ? (
                    <div className="text-center p-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#007EA7]"></div>
                      <p className="mt-2 text-gray-600">Carregando...</p>
                    </div>
                  ) : renderedItems.length === 0 ? (
                    <div className="text-center p-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Nenhum item encontrado.</p>
                      {busca && (
                        <button
                          onClick={() => setBusca("")}
                          className="mt-2 text-[#007EA7] hover:underline"
                        >
                          Limpar busca
                        </button>
                      )}
                    </div>
                  ) : (
                    renderedItems.map((item) => (
                      <EstoqueItemRow
                        key={item.id}
                        item={item}
                        isSelected={selectedItems.includes(item.id)}
                        onToggle={() => handleCheckboxChange(item.id)}
                        onEdit={() => openEditItemModal(item)}
                        onDelete={() => handleDeleteItem(item.id)}
                        onViewDetails={() => handleViewDetails(item.id)}
                        isInitiallyExpanded={item.id === expandedItemId}
                        onCollapse={handleCollapseItem}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Paginação */}
              {!loading && paginationData.total > 0 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
                  <p className="text-sm text-gray-600">
                    Mostrando{" "}
                    <span className="font-medium">
                      {paginationData.total > 0 ? paginationData.startIndex + 1 : 0}-{paginationData.endIndex}
                    </span>{" "}
                    de <span className="font-medium">{paginationData.total}</span>{" "}
                    resultados
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPagina((p) => Math.max(p - 1, 1))}
                      disabled={pagina === 1}
                      className="flex items-center gap-1 border border-gray-300 py-2 px-4 rounded-md text-sm text-gray-700 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setPagina((p) => Math.min(p + 1, paginationData.totalPaginas))}
                      disabled={pagina === paginationData.totalPaginas || paginationData.totalPaginas === 0}
                      className="flex items-center gap-1 border border-gray-300 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modais */}
      <NovoProdutoModal
        isOpen={isNovoItemModalOpen}
        onClose={() => setIsNovoItemModalOpen(false)}
        onSave={handleSaveItem}
        item={editingItem}
      />

      <EntradaSaidaEstoque
        isOpen={isEntradaSaidaModalOpen}
        onClose={closeEntradaSaidaModal}
        onSave={handleSaveMovement}
        itemIds={selectedItems}
        estoque={estoque}
      />
      
      <InativarProdutoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmarInativacao}
      />

      <SucessoModal isOpen={isSuccessModalOpen} onClose={closeSuccessModal} />

      <ExportarModal isOpen={isExportModalOpen} onClose={closeExportModal} />
    </div>
  );
}