import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../shared/components/header/header";
import Sidebar from "../../shared/components/sidebar/sidebar";
import PedidosList from "./PedidosList";
import ServicosList from "../servicos/ServicosList";
import { FaBoxOpen, FaWrench, FaFilter, FaSearch, FaTimes, FaChevronDown } from "react-icons/fa";

// --- Componente Modal de Filtros (Mantido igual) ---
const FilterModal = ({ activeTab, filters, setFilters, onClose, onApply }) => {
    const STATUS_OPTIONS = ["Todos", "Ativo", "Finalizado"];
    const PAYMENT_OPTIONS = ["Todos", "Pix", "Cartão de crédito", "Dinheiro", "Boleto"];
    const ETAPA_OPTIONS = ["Todos", "Aguardando orçamento", "Orçamento aprovado", "Execução em andamento", "Aguardando peças", "Concluído"];

    const isPedidos = activeTab === 'pedidos';
    const primaryOptions = isPedidos ? PAYMENT_OPTIONS : ETAPA_OPTIONS;
    const primaryFilterKey = isPedidos ? 'paymentFilter' : 'etapaFilter';

    return (
        <div className="fixed inset-0 z-9999 grid place-items-center bg-black/30 px-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <FaFilter className="text-slate-600"/> Filtros Avançados
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><FaTimes /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <select
                            value={filters.statusFilter}
                            onChange={(e) => setFilters(prev => ({ ...prev, statusFilter: e.target.value }))}
                            className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#007EA7]"
                        >
                            {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {isPedidos ? "Forma de Pagamento" : "Etapa Atual"}
                        </label>
                        <select
                            value={filters[primaryFilterKey]}
                            onChange={(e) => setFilters(prev => ({ ...prev, [primaryFilterKey]: e.target.value }))}
                            className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#007EA7]"
                        >
                            {primaryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onApply} className="px-5 h-10 rounded-md text-white font-semibold" style={{ backgroundColor: "#007EA7" }}>
                        Aplicar Filtros
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function Pedidos() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const location = useLocation();
    const initialTab = location.pathname.includes('/servicos') ? 'servicos' : 'pedidos';
    const [activeTab, setActiveTab] = useState(initialTab);

    const [busca, setBusca] = useState("");
    const [triggerNovo, setTriggerNovo] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const [filters, setFilters] = useState({
        statusFilter: "Todos",
        paymentFilter: "Todos",
        etapaFilter: "Todos",
    });

    const handleNovoRegistroClick = () => setTriggerNovo(true);
    const handleNovoRegistroHandled = () => setTriggerNovo(false);
    const handleFilterClick = () => setIsFilterModalOpen(true);
    const handleApplyFilters = () => setIsFilterModalOpen(false);

    // Classes das abas - Adicionado translate-y-px para cobrir a borda
    const tabBaseClass = "px-6 py-3 rounded-t-lg font-medium text-sm transition-all flex items-center gap-2 border-t border-l border-r cursor-pointer select-none translate-y-[1px]";
    const activeTabClass = "bg-white text-[#007EA7] border-slate-200 z-10"; 
    const inactiveTabClass = "bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200 z-0";

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            
            <div className="flex-1 flex flex-col min-h-screen">
                <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                
                <div className="pt-20 lg:pt-20" />

                <main className="flex-1 p-4 md:p-8">
                    {/* ALINHAMENTO CORRIGIDO: Largura unificada no pai */}
                    <section className="mb-8 w-full max-w-[1600px] mx-auto">
                        
                        {/* ABAS: Removido padding lateral excessivo para alinhar com o card */}
                        <div className="flex items-end gap-2 w-full px-1">
                            <button 
                                onClick={() => setActiveTab('pedidos')}
                                className={`${tabBaseClass} ${activeTab === 'pedidos' ? activeTabClass : inactiveTabClass}`}
                            >
                                <FaBoxOpen className={activeTab === 'pedidos' ? "text-[#007EA7]" : "text-slate-400"} />
                                Pedidos
                            </button>
                            
                            <button 
                                onClick={() => setActiveTab('servicos')}
                                className={`${tabBaseClass} ${activeTab === 'servicos' ? activeTabClass : inactiveTabClass}`}
                            >
                                <FaWrench className={activeTab === 'servicos' ? "text-[#007EA7]" : "text-slate-400"} />
                                Serviços
                            </button>
                        </div>

                        {/* CARD PRINCIPAL: Sem max-w conflitante, usa w-full para seguir o pai */}
                        <div className="w-full bg-white border border-slate-200 rounded-b-lg rounded-tr-lg shadow-sm relative z-0 p-6">
                            
                            {/* Barra de Ferramentas */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                                <button
                                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md text-white text-sm font-bold shadow-sm hover:opacity-90 transition-all"
                                    style={{ backgroundColor: "#007EA7" }}
                                    onClick={handleNovoRegistroClick}
                                >
                                    Novo Registro
                                </button>

                                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                                    <div className="relative w-full md:w-[350px]">
                                        <input
                                            placeholder="Busque Por.."
                                            value={busca}
                                            onChange={(e) => setBusca(e.target.value)}
                                            className="w-full h-10 pl-10 pr-4 rounded-md border border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007EA7] focus:bg-white transition-all"
                                        />
                                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    </div>

                                    <button
                                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 h-10 rounded-md border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-sm font-semibold cursor-pointer transition-colors shadow-sm"
                                        title="Filtrar"
                                        onClick={handleFilterClick}
                                    >
                                        <FaFilter className="text-slate-800 w-3 h-3" /> 
                                        Filtrar
                                        <FaChevronDown className="text-slate-400 w-2.5 h-2.5 ml-1" />
                                    </button>
                                </div>
                            </div>

                            {/* Conteúdo das Listas */}
                            <div className="min-h-[400px]">
                                {activeTab === 'pedidos' && (
                                    <PedidosList
                                        busca={busca}
                                        triggerNovoRegistro={triggerNovo && activeTab === 'pedidos'}
                                        onNovoRegistroHandled={handleNovoRegistroHandled}
                                        statusFilter={filters.statusFilter}
                                        paymentFilter={filters.paymentFilter}
                                    />
                                )}
                                {activeTab === 'servicos' && (
                                    <ServicosList
                                        busca={busca}
                                        triggerNovoRegistro={triggerNovo && activeTab === 'servicos'}
                                        onNovoRegistroHandled={handleNovoRegistroHandled}
                                        statusFilter={filters.statusFilter}
                                        etapaFilter={filters.etapaFilter}
                                    />
                                )}
                            </div>
                        </div>
                    </section>
                </main>
            </div>

            {isFilterModalOpen && (
                <FilterModal
                    activeTab={activeTab}
                    filters={filters}
                    setFilters={setFilters}
                    onClose={() => setIsFilterModalOpen(false)}
                    onApply={handleApplyFilters}
                />
            )}
        </div>
    );
}