import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import Header from "../../shared/components/header/header";
import Sidebar from "../../shared/components/sidebar/sidebar";
import PedidosList from "./PedidosList";
import ServicosList from "../servicos/ServicosList";
import { FaBoxOpen, FaWrench, FaFilter, FaSearch, FaPlus, FaTimes } from "react-icons/fa";

const FilterModal = ({ activeTab, filters, setFilters, onClose, onApply }) => {
    const STATUS_OPTIONS = ["Todos", "Ativo", "Finalizado"];
    const PAYMENT_OPTIONS = ["Todos", "Pix", "Cartão de crédito", "Dinheiro", "Boleto"];
    const ETAPA_OPTIONS = ["Todos", "Aguardando orçamento", "Orçamento aprovado", "Execução em andamento", "Aguardando peças", "Concluído"];

    const isPedidos = activeTab === 'pedidos';
    const primaryOptions = isPedidos ? PAYMENT_OPTIONS : ETAPA_OPTIONS;
    const primaryFilterKey = isPedidos ? 'paymentFilter' : 'etapaFilter';

    return (
        <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/30 px-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <FaFilter className="text-slate-600"/> Filtros Avançados
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><FaTimes /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status (Ativo/Finalizado)</label>
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
                    <button
                        onClick={onApply}
                        className="px-5 h-10 rounded-md text-white font-semibold"
                        style={{ backgroundColor: "#007EA7" }}
                    >
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
    const initialTab = location.pathname === '/servicos' ? 'servicos' : 'pedidos';
    const [activeTab, setActiveTab] = useState(initialTab);

    const [busca, setBusca] = useState("");
    const [triggerNovo, setTriggerNovo] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const [filters, setFilters] = useState({
        statusFilter: "Todos",
        paymentFilter: "Todos",
        etapaFilter: "Todos",
    });

    useEffect(() => {
        setActiveTab(location.pathname === '/servicos' ? 'servicos' : 'pedidos');
    }, [location.pathname]);

    const handleNovoRegistroClick = () => {
        setTriggerNovo(true);
    };

    const handleNovoRegistroHandled = () => {
        setTriggerNovo(false);
    };

    const handleFilterClick = () => {
        setIsFilterModalOpen(true);
    };

    const handleApplyFilters = () => {
        setIsFilterModalOpen(false);
    };


    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col min-h-screen">
                <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                <div className="h-[80px]" />

                <main className="flex-1 p-8">
                    <section className="max-w-6xl mx-auto mb-8 text-center">
                        <h1 className="text-[32px] leading-tight font-bold text-[#0F172A]">
                            Pedidos e Serviços
                        </h1>
                        <p className="text-[15px] text-slate-500 mt-2">
                            Tenha uma visão completa dos pedidos e serviços atuais.
                        </p>
                    </section>

                    <section className="max-w-6xl mx-auto">
                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                                <button
                                    className="w-full md:w-auto inline-flex items-center gap-2 px-6 py-2 rounded text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                                    style={{ backgroundColor: "#007EA7" }}
                                    onClick={handleNovoRegistroClick}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = "#002A4B"}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = "#007EA7"}
                                >
                                    <FaPlus className="w-3 h-3"/> Novo Registro
                                </button>

                                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                                    <div className="relative w-full md:min-w-[260px]">
                                        <input
                                            placeholder="Busque Por..."
                                            value={busca}
                                            onChange={(e) => setBusca(e.target.value)}
                                            className="w-full h-10 pl-10 pr-4 rounded-md border border-slate-300 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#007EA7]"
                                        />
                                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    </div>

                                    <button
                                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 h-10 rounded-md border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-sm cursor-pointer"
                                        title="Filtrar"
                                        onClick={handleFilterClick}
                                    >
                                        <FaFilter /> Filtrar
                                    </button>

                                    <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-1">
                                        <Link
                                            to="/pedidos"
                                            onClick={() => setActiveTab('pedidos')}
                                            className={`p-2 rounded-md text-sm font-medium flex items-center justify-center cursor-pointer transition-colors ${
                                                activeTab === 'pedidos' ? "bg-white text-[#003d6b] shadow-sm" : "hover:bg-slate-200 text-slate-600"
                                            }`}
                                            title="Pedidos de Produtos"
                                        >
                                            <FaBoxOpen className="w-5 h-5"/>
                                        </Link>
                                        <Link
                                            to="/servicos"
                                            onClick={() => setActiveTab('servicos')}
                                            className={`p-2 rounded-md text-sm font-medium flex items-center justify-center cursor-pointer transition-colors ${
                                                activeTab === 'servicos' ? "bg-white text-[#003d6b] shadow-sm" : "hover:bg-slate-200 text-slate-600"
                                            }`}
                                            title="Pedidos de Serviços"
                                        >
                                            <FaWrench className="w-5 h-5"/>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
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
