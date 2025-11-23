import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../shared/components/header/header";
import Sidebar from "../../shared/components/sidebar/sidebar";
import {
  Package,
  ArrowUp,
  Search,
  CalendarDays,
  Filter,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowRightLeft,
} from "lucide-react";
import NovoProdutoModal from "../../shared/components/modalEstoque/NovoProdutoModal";
import SucessoModal from "../../shared/components/modalEstoque/SucessoModal";
import ExportarModal from "../../shared/components/modalEstoque/ExportarModal";
import EstoqueItemRow from "../../shared/components/estoque/EstoqueItemRow";
import CalendarDropdown from "../../shared/components/estoque/CalendarDropdown";
import FilterDropdown from "../../shared/components/estoque/FilterDropdown";
import EntradaSaidaEstoque from "../../shared/components/modalEstoque/EntradaSaidaEstoque";

const API_URL = "http://localhost:3001/estoque";
const FUNCIONARIOS_API_URL = "http://localhost:3001/funcionarios";
const ITENS_POR_PAGINA = 6;

export default function Estoque() {
  // Estados básicos
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [estoque, setEstoque] = useState([]);
  const [loading, setLoading] = useState(true);
  const [funcionarios, setFuncionarios] = useState([]);
  
  // Estados dos modais
  const [isNovoItemModalOpen, setIsNovoItemModalOpen] = useState(false);
  const [isEntradaSaidaModalOpen, setIsEntradaSaidaModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  // Estados de edição e seleção
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Estados de filtros e busca
  const [busca, setBusca] = useState("");
  const [selectedFilterDate, setSelectedFilterDate] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});
  
  // Estados de UI
  const [pagina, setPagina] = useState(1);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState(null);
  
  // Location e foco
  const location = useLocation();
  const focusItemId = location.state?.focusItemId;

  // Funções utilitárias
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const formatCurrency = (value) => {
    if (typeof value !== "number") {
      value = 0;
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const parseCurrency = (value) => {
    return parseFloat(String(value).replace(/[R$\s.]/g, "").replace(",", ".")) || 0;
  };

  const toYYYYMMDD = (date) => {
    if (!date) return null;
    return date.toISOString().split("T")[0];
  };

  // Funções de API
  const fetchEstoque = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setEstoque(data);
    } catch (error) {
      console.error("Erro ao buscar estoque:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFuncionarios = async () => {
    try {
      const response = await fetch(FUNCIONARIOS_API_URL);
      const data = await response.json();
      setFuncionarios(data);
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
    }
  };

  // Effect para carregar dados iniciais
  useEffect(() => {
    fetchEstoque();
    fetchFuncionarios();
  }, []);

  // Estoque filtrado
  const filteredEstoque = useMemo(() => {
    let items = [...estoque];

    // Filtro de busca
    if (busca) {
      items = items.filter(
        (item) =>
          item.nome.toLowerCase().includes(busca.toLowerCase()) ||
          (item.descricao && item.descricao.toLowerCase().includes(busca.toLowerCase()))
      );
    }

    // Filtro de data
    if (selectedFilterDate) {
      const filterDateStr = toYYYYMMDD(selectedFilterDate);
      items = items.filter((item) => {
        if (!item.detalhes || !item.detalhes.movimentos) return false;
        return item.detalhes.movimentos.some((mov) => mov.data === filterDateStr);
      });
    }

    // Filtro de situação
    const situacaoFilters = activeFilters.situacao || [];
    if (situacaoFilters.length > 0) {
      items = items.filter((item) => {
        const situacao =
          item.quantidade === 0
            ? "Fora de estoque"
            : item.quantidade < item.estoqueMinimo
            ? "Abaixo do normal"
            : "Disponível";
        return situacaoFilters.includes(situacao);
      });
    }

    // Filtro de tipo
    const tipoFilters = activeFilters.tipo || [];
    if (tipoFilters.length > 0) {
      items = items.filter((item) => tipoFilters.includes(item.tipo));
    }

    return items;
  }, [estoque, busca, selectedFilterDate, activeFilters]);

  // Effect para focar em item específico
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

  // Handlers de CRUD
  const handleSaveItem = async (itemData) => {
    const itemPayload = {
      ...itemData,
      preco: parseCurrency(itemData.preco),
      quantidade: parseInt(itemData.quantidade, 10) || 0,
      estoqueMinimo: parseInt(itemData.estoqueMinimo, 10) || 0,
      detalhes: itemData.detalhes
        ? {
            ...itemData.detalhes,
            valorCompra: parseCurrency(itemData.detalhes.valorCompra),
            valorVenda: parseCurrency(itemData.detalhes.valorVenda),
            movimentos: itemData.detalhes.movimentos || [],
          }
        : null,
    };

    const url = editingItem ? `${API_URL}/${editingItem.id}` : API_URL;
    const method = editingItem ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemPayload),
      });

      if (!response.ok) throw new Error("Falha ao salvar o item.");

      await fetchEstoque();
      handleSaveSuccess();
    } catch (error) {
      console.error("Erro ao salvar item:", error);
    }
  };

  const handleSaveMovement = async (itemIds, movementData) => {
    const updates = itemIds.map(async (itemId) => {
      const itemToUpdate = estoque.find((item) => item.id === itemId);
      if (!itemToUpdate) return;

      const newQuantity =
        movementData.tipo === "Entrada"
          ? itemToUpdate.quantidade + movementData.quantidade
          : itemToUpdate.quantidade - movementData.quantidade;

      const newMovement = {
        id: `mov-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        ...movementData,
      };

      const updatedItem = {
        ...itemToUpdate,
        quantidade: Math.max(0, newQuantity),
        detalhes: {
          ...(itemToUpdate.detalhes || {}),
          movimentos: [...(itemToUpdate.detalhes?.movimentos || []), newMovement],
        },
      };

      try {
        await fetch(`${API_URL}/${itemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedItem),
        });
      } catch (error) {
        console.error(`Erro ao atualizar item ${itemId}:`, error);
        throw error;
      }
    });

    try {
      await Promise.all(updates);
      await fetchEstoque();
      setIsEntradaSaidaModalOpen(false);
      setSelectedItems([]);
    } catch (error) {
      console.error("Falha ao salvar um ou mais movimentos:", error);
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm("Tem certeza que deseja deletar este item?")) {
      try {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        setEstoque((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Erro ao deletar item:", error);
      }
    }
  };

  // Handlers de modal
  const openNewItemModal = () => {
    setEditingItem(null);
    setIsNovoItemModalOpen(true);
  };

  const openEditItemModal = (item) => {
    setEditingItem(item);
    setIsNovoItemModalOpen(true);
  };

  const openEntradaSaidaModal = () => setIsEntradaSaidaModalOpen(true);
  const closeEntradaSaidaModal = () => setIsEntradaSaidaModalOpen(false);
  const openExportModal = () => setIsExportModalOpen(true);
  const closeExportModal = () => setIsExportModalOpen(false);

  const handleSaveSuccess = () => {
    setIsNovoItemModalOpen(false);
    setIsSuccessModalOpen(true);
    setTimeout(() => {
      setIsSuccessModalOpen(false);
    }, 3000);
  };

  const closeSuccessModal = () => setIsSuccessModalOpen(false);

  // KPIs calculados
  const kpiData = useMemo(() => {
    const totalItens = estoque.reduce((acc, item) => acc + item.quantidade, 0);
    const baixoEstoque = estoque.filter(
      (item) => item.quantidade < item.estoqueMinimo && item.quantidade > 0
    ).length;
    const foraDeEstoque = estoque.filter((item) => item.quantidade === 0).length;
    const produtoEmAlta = estoque.length > 0 ? estoque[0].nome : "N/A";

    return [
      {
        title: "Total de unidades em estoque",
        value: totalItens,
        caption: "+00% este mês",
        captionColor: "green",
      },
      {
        title: "Itens com baixo estoque",
        value: baixoEstoque,
        caption: `${baixoEstoque} atualmente`,
      },
      {
        title: "Produto em alta",
        value: produtoEmAlta,
        caption: "Baseado em vendas",
      },
      {
        title: "Itens fora de estoque",
        value: foraDeEstoque,
        caption: `${foraDeEstoque} atualmente`,
      },
    ];
  }, [estoque]);

  // Estoque paginado
  const paginatedEstoque = useMemo(() => {
    const totalPaginas = Math.ceil(filteredEstoque.length / ITENS_POR_PAGINA);
    const paginaAtual = Math.min(pagina, totalPaginas) || 1;
    const startIndex = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const endIndex = startIndex + ITENS_POR_PAGINA;
    return filteredEstoque.slice(startIndex, endIndex);
  }, [filteredEstoque, pagina]);

  // Handlers de seleção
  const handleCheckboxChange = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllChange = (e) => {
    if (e.target.checked) {
      setSelectedItems(paginatedEstoque.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // Handlers de filtros
  const handleDateFilterChange = (newDate) => {
    console.log("Data recebida do calendário:", newDate);
    if (newDate) {
      setSelectedFilterDate(newDate);
      setIsCalendarOpen(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
  };

  const handleCollapseItem = () => {
    setExpandedItemId(null);
  };

  // Cálculos auxiliares
  const hasActiveFilters = Object.values(activeFilters).some(
    (arr) => arr && arr.length > 0
  );

  const totalPaginas = Math.ceil(filteredEstoque.length / ITENS_POR_PAGINA);
  const startIndex = (pagina - 1) * ITENS_POR_PAGINA;
  const endIndex = Math.min(startIndex + ITENS_POR_PAGINA, filteredEstoque.length);

  const isAllSelectedOnPage =
    paginatedEstoque.length > 0 &&
    selectedItems.length >= paginatedEstoque.length &&
    paginatedEstoque.every((item) => selectedItems.includes(item.id));

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-h-screen">
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <div className="pt-20 lg:pt-80px" />

        <main className="flex-1 item-center p-4 md:p-8">
          {/* Cabeçalho */}
          <div className="text-center mb-8 px-2 w-full max-w-[1600px]">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 mb-2">
              Controle de Estoque
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Gerencie produtos e estoque de forma eficiente.
            </p>
          </div>

          <div className="flex max-w-[1800px] mx-auto pt-10 flex-col gap-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {kpiData.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                    <Package className="w-6 h-6 text-[#003d6b]" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    {stat.caption && (
                      <p className="mt-2 text-sm text-gray-600 flex items-center">
                        {stat.captionColor === "green" && (
                          <ArrowUp className="w-4 h-4 mr-1 text-green-500" />
                        )}
                        {stat.caption}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

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
                  <div className="py-3 w-[15%] text-center">Situação</div>
                  <div className="py-3 w-[15%] text-right pr-4">Ações</div>
                </div>

                {/* Linhas da tabela */}
                <div>
                  {loading ? (
                    <p className="text-center p-4">Carregando...</p>
                  ) : paginatedEstoque.length === 0 ? (
                    <p className="text-center p-4 text-gray-500">
                      Nenhum item encontrado.
                    </p>
                  ) : (
                    paginatedEstoque.map((item) => {
                      const situacao =
                        item.quantidade === 0
                          ? "Fora de estoque"
                          : item.quantidade < item.estoqueMinimo
                          ? "Abaixo do normal"
                          : "Disponível";

                      const itemFormatado = {
                        ...item,
                        situacao,
                        preco: formatCurrency(item.preco),
                        detalhes: item.detalhes
                          ? {
                              ...item.detalhes,
                              valorCompra: formatCurrency(item.detalhes.valorCompra),
                              valorVenda: formatCurrency(item.detalhes.valorVenda),
                            }
                          : null,
                      };

                      return (
                        <EstoqueItemRow
                          key={item.id}
                          item={itemFormatado}
                          isSelected={selectedItems.includes(item.id)}
                          onToggle={() => handleCheckboxChange(item.id)}
                          onEdit={() => openEditItemModal(item)}
                          onDelete={() => handleDeleteItem(item.id)}
                          isInitiallyExpanded={item.id === expandedItemId}
                          onCollapse={handleCollapseItem}
                        />
                      );
                    })
                  )}
                </div>
              </div>

              {/* Paginação */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
                <p className="text-sm text-gray-600">
                  Mostrando{" "}
                  <span className="font-medium">
                    {filteredEstoque.length > 0 ? startIndex + 1 : 0}-{endIndex}
                  </span>{" "}
                  de <span className="font-medium">{filteredEstoque.length}</span>{" "}
                  resultados
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagina((p) => Math.max(p - 1, 1))}
                    disabled={pagina === 1}
                    className="flex items-center gap-1 border border-gray-300 py-2 px-4 rounded-md text-sm text-gray-700 font-medium hover:bg-[#bebebe] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPagina((p) => Math.min(p + 1, totalPaginas))}
                    disabled={pagina === totalPaginas || totalPaginas === 0}
                    className="flex items-center gap-1 border border-gray-300 py-2 px-4 rounded-md text-sm font-medium hover:bg-[#bebebe] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Próximo
                  </button>
                </div>
              </div>
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
        funcionarios={funcionarios}
      />

      <SucessoModal isOpen={isSuccessModalOpen} onClose={closeSuccessModal} />

      <ExportarModal isOpen={isExportModalOpen} onClose={closeExportModal} />
    </div>
  );
}