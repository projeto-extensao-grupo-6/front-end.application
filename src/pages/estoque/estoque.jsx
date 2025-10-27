import React, { useState, useEffect, useMemo } from "react";
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
  Plus, // Ícone para Novo Item
  ArrowRightLeft, // Ícone para Movimento
} from "lucide-react";

import NovoProdutoModal from "../../shared/components/modalEstoque/NovoProdutoModal";
import SucessoModal from "../../shared/components/modalEstoque/SucessoModal";
import ExportarModal from "../../shared/components/modalEstoque/ExportarModal";
import EstoqueItemRow from "../../shared/components/estoque/EstoqueItemRow";
import CalendarDropdown from "../../shared/components/estoque/CalendarDropdown";
import FilterDropdown from "../../shared/components/estoque/FilterDropdown";
import EntradaSaidaEstoque from "../../shared/components/modalEstoque/EntradaSaidaEstoque"; // Importa o novo modal

const API_URL = "http://localhost:3000/estoque";
const FUNCIONARIOS_API_URL = "http://localhost:3000/funcionarios";
const ITENS_POR_PAGINA = 6;

export default function Estoque() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [estoque, setEstoque] = useState([]);
  const [loading, setLoading] = useState(true);
  const [funcionarios, setFuncionarios] = useState([]);

  const [isNovoItemModalOpen, setIsNovoItemModalOpen] = useState(false);
  const [isEntradaSaidaModalOpen, setIsEntradaSaidaModalOpen] = useState(false); // Estado para o novo modal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedFilterDate, setSelectedFilterDate] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedItems, setSelectedItems] = useState([]); // Agora guarda IDs

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
  }

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


  useEffect(() => {
    fetchEstoque();
    fetchFuncionarios();
  }, []);

  const handleSaveItem = async (itemData) => {
    const itemPayload = {
      ...itemData,
      preco: parseCurrency(itemData.preco),
      quantidade: parseInt(itemData.quantidade, 10) || 0,
      estoqueMinimo: parseInt(itemData.estoqueMinimo, 10) || 0,
      detalhes: itemData.detalhes ? {
        ...itemData.detalhes,
        valorCompra: parseCurrency(itemData.detalhes.valorCompra),
        valorVenda: parseCurrency(itemData.detalhes.valorVenda),
        movimentos: itemData.detalhes.movimentos || [] // Garante que movimentos exista
      } : null
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
      const itemToUpdate = estoque.find(item => item.id === itemId);
      if (!itemToUpdate) return;

      const newQuantity = movementData.tipo === 'Entrada'
        ? itemToUpdate.quantidade + movementData.quantidade
        : itemToUpdate.quantidade - movementData.quantidade;

      const newMovement = {
        id: `mov-${Date.now()}-${Math.random().toString(16).slice(2)}`, // ID único simples
        ...movementData
      };

      const updatedItem = {
        ...itemToUpdate,
        quantidade: Math.max(0, newQuantity), // Garante que não fique negativo
        detalhes: {
          ...(itemToUpdate.detalhes || {}),
          movimentos: [
            ...(itemToUpdate.detalhes?.movimentos || []),
            newMovement
          ]
        }
      };

      try {
        await fetch(`${API_URL}/${itemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem)
        });
      } catch (error) {
        console.error(`Erro ao atualizar item ${itemId}:`, error);
        throw error; // Re-lança para parar o Promise.all se um falhar
      }
    });

    try {
      await Promise.all(updates);
      await fetchEstoque(); // Rebusca tudo após sucesso
      setIsEntradaSaidaModalOpen(false); // Fecha o modal
      setSelectedItems([]); // Limpa a seleção
      // Poderia adicionar um modal de sucesso específico para movimento aqui
    } catch (error) {
      console.error("Falha ao salvar um ou mais movimentos:", error);
      // Informar o usuário sobre a falha
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

  const openNewItemModal = () => {
    setEditingItem(null);
    setIsNovoItemModalOpen(true);
  };

  const openEditItemModal = (item) => {
    setEditingItem(item);
    setIsNovoItemModalOpen(true);
  };

  const openEntradaSaidaModal = () => setIsEntradaSaidaModalOpen(true); // Abre o novo modal
  const closeEntradaSaidaModal = () => setIsEntradaSaidaModalOpen(false); // Fecha o novo modal

  const openExportModal = () => setIsExportModalOpen(true);
  const closeExportModal = () => setIsExportModalOpen(false);

  const handleSaveSuccess = () => {
    setIsNovoItemModalOpen(false); // Fecha o modal de Novo/Editar
    setIsSuccessModalOpen(true);
    setTimeout(() => {
      setIsSuccessModalOpen(false);
    }, 3000);
  };
  const closeSuccessModal = () => setIsSuccessModalOpen(false);

  const toYYYYMMDD = (date) => {
    return date.toISOString().split("T")[0];
  };

  const filteredEstoque = useMemo(() => {
    let items = [...estoque];

    if (busca) {
      items = items.filter(
        (item) =>
          item.nome.toLowerCase().includes(busca.toLowerCase()) ||
          (item.descricao && item.descricao.toLowerCase().includes(busca.toLowerCase()))
      );
    }

    if (selectedFilterDate) {
      const filterDateStr = toYYYYMMDD(selectedFilterDate);
      items = items.filter(item => {
        if (!item.detalhes || !item.detalhes.movimentos) return false;
        return item.detalhes.movimentos.some(mov => mov.data === filterDateStr);
      });
    }

    const situacaoFilters = activeFilters.situacao || [];
    if (situacaoFilters.length > 0) {
      items = items.filter(item => {
        const situacao = item.quantidade === 0 ? "Fora de estoque"
                       : item.quantidade < item.estoqueMinimo ? "Abaixo do normal"
                       : "Disponível";
        return situacaoFilters.includes(situacao);
      });
    }

    const tipoFilters = activeFilters.tipo || [];
    if (tipoFilters.length > 0) {
      items = items.filter(item => tipoFilters.includes(item.tipo));
    }

    return items;
  }, [estoque, busca, selectedFilterDate, activeFilters]);

  const kpiData = useMemo(() => {
    const totalItens = estoque.reduce((acc, item) => acc + item.quantidade, 0);
    const baixoEstoque = estoque.filter(
      (item) => item.quantidade < item.estoqueMinimo && item.quantidade > 0
    ).length;
    const foraDeEstoque = estoque.filter(
      (item) => item.quantidade === 0
    ).length;
    const produtoEmAlta = estoque.length > 0 ? estoque[0].nome : "N/A";

    return [
      { title: "Total de unidades em estoque", value: totalItens, caption: "+00% este mês", captionColor: "green" },
      { title: "Itens com baixo estoque", value: baixoEstoque, caption: `${baixoEstoque} atualmente` },
      { title: "Produto em alta", value: produtoEmAlta, caption: "Baseado em vendas" },
      { title: "Itens fora de estoque", value: foraDeEstoque, caption: `${foraDeEstoque} atualmente` },
    ];
  }, [estoque]);

  const paginatedEstoque = useMemo(() => {
    const totalPaginas = Math.ceil(filteredEstoque.length / ITENS_POR_PAGINA);
    const paginaAtual = Math.min(pagina, totalPaginas) || 1;
    if (pagina !== paginaAtual && filteredEstoque.length > 0) {
      setPagina(paginaAtual);
    } else if (filteredEstoque.length === 0 && pagina !== 1) {
      setPagina(1);
    }

    const startIndex = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const endIndex = startIndex + ITENS_POR_PAGINA;
    return filteredEstoque.slice(startIndex, endIndex);
  }, [filteredEstoque, pagina]);


  const handleCheckboxChange = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAllChange = (e) => {
    if (e.target.checked) {
      setSelectedItems(paginatedEstoque.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleDateFilterChange = (date) => {
    setSelectedFilterDate(date);
  };

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
  };

  const hasActiveFilters = Object.values(activeFilters).some(
    (arr) => arr && arr.length > 0
  );

  const totalPaginas = Math.ceil(filteredEstoque.length / ITENS_POR_PAGINA);
  const startIndex = (pagina - 1) * ITENS_POR_PAGINA;
  const endIndex = Math.min(startIndex + ITENS_POR_PAGINA, filteredEstoque.length);

  const isAllSelectedOnPage = paginatedEstoque.length > 0 && selectedItems.length === paginatedEstoque.length && paginatedEstoque.every(item => selectedItems.includes(item.id));


  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <div className="pt-20 lg:pt-[80px]" />

        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-[1800px] mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {kpiData.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                    <div className="bg-[#003d6b] p-2 rounded">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    {stat.caption && (
                      <p className="mt-2 text-sm text-gray-600 flex items-center">
                        {stat.captionColor === "green" && (<ArrowUp className="w-4 h-4 mr-1 text-green-500" />)}
                        {stat.caption}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex gap-2 w-full md:w-auto">
                   <button
                    onClick={openNewItemModal}
                    className="bg-[#007EA7] text-white font-medium py-2.5 px-5 rounded-md hover:bg-[#006891] transition-colors flex items-center justify-center whitespace-nowrap gap-2"
                  >
                    <Plus className="w-4 h-4"/> Novo Item
                  </button>
                  <button
                    onClick={openEntradaSaidaModal}
                    disabled={selectedItems.length === 0} // Desabilita se nada selecionado
                    className="bg-blue-600 text-white font-medium py-2.5 px-5 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center whitespace-nowrap gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowRightLeft className="w-4 h-4"/> Registrar Movimento
                  </button>
                </div>


                <div className="flex items-center gap-3 w-full justify-end">
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

                  <div className="flex gap-2 w-auto whitespace-nowrap">
                    <div className="relative">
                      <button
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        className="flex items-center gap-2 border border-gray-300 py-2.5 px-4 rounded-md text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                      >
                        <CalendarDays className="w-4 h-4" />
                        {selectedFilterDate ? selectedFilterDate.toLocaleDateString("pt-BR") : "Data"}
                        <ChevronDown className={`w-4 h-4 transition-transform ${isCalendarOpen ? "rotate-180" : ""}`} />
                      </button>
                      <CalendarDropdown
                        isOpen={isCalendarOpen}
                        onClose={() => setIsCalendarOpen(false)}
                        onDateSelect={handleDateFilterChange}
                      />
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center gap-2 border border-gray-300 py-2.5 px-4 rounded-md text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors ${
                          hasActiveFilters ? "border-[#003d6b] text-[#003d6b] bg-[#e6f0f5]" : ""
                        }`}
                      >
                        <Filter className="w-4 h-4" />
                        Filtrar
                        <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
                      </button>
                      <FilterDropdown
                        isOpen={isFilterOpen}
                        onClose={() => setIsFilterOpen(false)}
                        selectedFilters={activeFilters}
                        onFilterChange={handleFilterChange}
                      />
                    </div>

                    <button
                      onClick={openExportModal}
                      className="flex items-center gap-2 border border-gray-300 py-2.5 px-4 rounded-md text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-4 h-4" /> Exportar
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                {/* CABEÇALHO ALINHADO */}
                <div className="flex items-center bg-gray-50 border-b border-gray-200 mb-2 min-h-[48px] rounded-t-md text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <div className="py-3 w-[5%] pl-4 pr-1">
                    <input type="checkbox"
                           checked={isAllSelectedOnPage}
                           onChange={handleSelectAllChange}
                           className="w-4 h-4 text-[#003d6b] border-gray-300 rounded focus:ring-[#003d6b]" />
                  </div>
                  <div className="py-3 w-[15%] pl-2 pr-1">Nome</div>
                  <div className="py-3 w-[25%] px-4">Descrição</div>
                  <div className="py-3 w-[10%] text-center">Preço</div>
                  <div className="py-3 w-[15%] text-center">Quantidade em estoque</div>
                  <div className="py-3 w-[15%] text-center">Situação</div>
                  <div className="py-3 w-[15%] text-right pr-4">Ações</div>
                </div>


                <div>
                  {loading ? (
                    <p className="text-center p-4">Carregando...</p>
                  ) : paginatedEstoque.length === 0 ? (
                    <p className="text-center p-4 text-gray-500">Nenhum item encontrado.</p>
                  ): (
                    paginatedEstoque.map((item) => {
                      const situacao = item.quantidade === 0 ? "Fora de estoque" : item.quantidade < item.estoqueMinimo ? "Abaixo do normal" : "Disponível";

                      const itemFormatado = {
                        ...item,
                        situacao,
                        preco: formatCurrency(item.preco),
                        detalhes: item.detalhes ? {
                            ...item.detalhes,
                            valorCompra: formatCurrency(item.detalhes.valorCompra),
                            valorVenda: formatCurrency(item.detalhes.valorVenda)
                        } : null
                      };

                      return (
                        <EstoqueItemRow
                          key={item.id}
                          item={itemFormatado}
                          isSelected={selectedItems.includes(item.id)}
                          onToggle={() => handleCheckboxChange(item.id)}
                          onEdit={() => openEditItemModal(item)}
                          onDelete={() => handleDeleteItem(item.id)}
                        />
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
                <p className="text-sm text-gray-600">
                  Mostrando <span className="font-medium">{filteredEstoque.length > 0 ? startIndex + 1 : 0}-{endIndex}</span> de <span className="font-medium">{filteredEstoque.length}</span> resultados
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
                    className="flex items-center gap-1 bg-[#003d6b] text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-[#002a4d] transition-colors disabled:opacity-50"
                  >
                    Próximo <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <NovoProdutoModal
        isOpen={isNovoItemModalOpen}
        onClose={() => setIsNovoItemModalOpen(false)}
        onSave={handleSaveItem}
        item={editingItem}
      />

      {/* NOVO MODAL */}
      <EntradaSaidaEstoque
        isOpen={isEntradaSaidaModalOpen}
        onClose={closeEntradaSaidaModal}
        onSave={handleSaveMovement}
        itemIds={selectedItems} // Passa os IDs selecionados
        estoque={estoque} // Passa o estoque para buscar nomes/unidades
        funcionarios={funcionarios} // Passa a lista de funcionários
      />

      <SucessoModal
        isOpen={isSuccessModalOpen}
        onClose={closeSuccessModal}
      />

      <ExportarModal
        isOpen={isExportModalOpen}
        onClose={closeExportModal}
      />
    </div>
  );
}