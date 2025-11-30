import React, { useState, useEffect, useMemo } from 'react';
import { FaBox, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { BiSolidPencil } from "react-icons/bi";
import SkeletonLoader from '../../shared/components/skeleton/SkeletonLoader';
import NovoPedidoModal from '../../shared/components/pedidosServicosComponents/NovoPedidoModal';
import EditarPedidoModal from '../../shared/components/pedidosServicosComponents/EditarPedidoModal';

// ===== DADOS MOCADOS =====
const MOCK_PEDIDOS = [
    {
        id: "1",
        clienteNome: "João Silva",
        produtosDesc: "Vidros temperados",
        descricao: "Vidro temperado 8mm para janela — 1,20m x 1,00m",
        dataCompra: "2025-11-20",
        data: "2025-11-20",
        formaPagamento: "Pix",
        itensCount: 2,
        valorTotal: 480.00,
        status: "Ativo",
        produtos: [
            { nome: "Vidro Temperado 8mm", quantidade: 1, preco: 400.00 },
            { nome: "Kit de Fixação", quantidade: 1, preco: 80.00 }
        ],
        observacoes: "Entrega urgente"
    },
    {
        id: "2",
        clienteNome: "Maria Santos",
        produtosDesc: "Ferragens para vidro",
        descricao: "Kit de roldanas para porta de correr + puxadores",
        dataCompra: "2025-11-18",
        data: "2025-11-18",
        formaPagamento: "Cartão de crédito",
        itensCount: 6,
        valorTotal: 265.90,
        status: "Finalizado",
        produtos: [
            { nome: "Roldanas", quantidade: 4, preco: 45.00 },
            { nome: "Puxadores", quantidade: 2, preco: 42.95 }
        ],
        observacoes: ""
    },
    {
        id: "3",
        clienteNome: "Cliente não informado",
        produtosDesc: "Espelhos",
        descricao: "Espelho 4mm lapidado — 1,50m x 0,60m",
        dataCompra: "2025-11-25",
        data: "2025-11-25",
        formaPagamento: "Dinheiro",
        itensCount: 1,
        valorTotal: 350.00,
        status: "Ativo",
        produtos: [
            { nome: "Espelho 4mm Lapidado", quantidade: 1, preco: 350.00 }
        ],
        observacoes: "Cliente preferiu não se identificar"
    },
    {
        id: "4",
        clienteNome: "Ana Costa",
        produtosDesc: "Box para banheiro",
        descricao: "Box de vidro temperado 8mm — modelo de correr, cor incolor",
        dataCompra: "2025-11-15",
        data: "2025-11-15",
        formaPagamento: "Boleto",
        itensCount: 1,
        valorTotal: 780.00,
        status: "Ativo",
        produtos: [
            { nome: "Box Vidro Temperado 8mm", quantidade: 1, preco: 780.00 }
        ],
        observacoes: "Instalação agendada para próxima semana"
    },
    {
        id: "5",
        clienteNome: "Pedro Almeida",
        produtosDesc: "Vidros laminados",
        descricao: "Vidro laminado 3+3mm — 2 chapas 2,00m x 1,00m",
        dataCompra: "2025-11-22",
        data: "2025-11-22",
        formaPagamento: "Pix",
        itensCount: 2,
        valorTotal: 560.75,
        status: "Ativo",
        produtos: [
            { nome: "Vidro Laminado 3+3mm", quantidade: 2, preco: 280.375 }
        ],
        observacoes: "Medidas exatas - sem margem de erro"
    },
    {
        id: "6",
        clienteNome: "Carlos Oliveira",
        produtosDesc: "Acessórios",
        descricao: "Fechos, dobradiças e suportes para prateleiras de vidro",
        dataCompra: "2025-11-12",
        data: "2025-11-12",
        formaPagamento: "Cartão de crédito",
        itensCount: 10,
        valorTotal: 312.00,
        status: "Finalizado",
        produtos: [
            { nome: "Fechos", quantidade: 4, preco: 25.00 },
            { nome: "Dobradiças", quantidade: 4, preco: 35.00 },
            { nome: "Suportes", quantidade: 2, preco: 56.00 }
        ],
        observacoes: ""
    },
    {
        id: "7",
        clienteNome: "Cliente não informado",
        produtosDesc: "Prateleiras de vidro",
        descricao: "Prateleiras em vidro 10mm — kit com 3 unidades",
        dataCompra: "2025-11-26",
        data: "2025-11-26",
        formaPagamento: "Pix",
        itensCount: 3,
        valorTotal: 450.00,
        status: "Ativo",
        produtos: [
            { nome: "Prateleira Vidro 10mm", quantidade: 3, preco: 150.00 }
        ],
        observacoes: "Retirada no local"
    },
];
// ===== FIM DADOS MOCADOS =====

const ITEMS_PER_PAGE = 5;

const NOVO_FORM_PEDIDO = () => ({
    produtosDesc: "",
    descricao: "",
    dataCompra: new Date().toISOString().slice(0, 10),
    formaPagamento: "Pix",
    itensCount: 1,
    valorTotal: 0,
    status: "Ativo",
});

function StatusBadge({ status }) {
    const styles = {
        Ativo: "inline-flex items-center px-2.5 py-1 rounded-2xl text-[11px] font-medium uppercase tracking-wide bg-[#bfdbfe] text-[#1e3a8a]",
        Finalizado: "inline-flex items-center px-2.5 py-1 rounded-2xl text-[11px] font-medium uppercase tracking-wide bg-[#d1fae5] text-[#065f46]",
    };
    return <span className={styles[status] || styles.Ativo}>{status}</span>;
}

const formatCurrency = (value) => {
    if (typeof value !== "number") value = 0;
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString + 'T00:00:00').toLocaleDateString("pt-BR");
    } catch (e) {
        return 'Data inválida';
    }
}

const formatPedidoId = (id) => {
    if (!id) return '';
    if (/^\d+$/.test(id)) {
        return id.padStart(3, '0');
    }
    return id;
}

export default function PedidosList({ busca = "", triggerNovoRegistro, onNovoRegistroHandled, statusFilter, paymentFilter }) {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [modal, setModal] = useState({ confirm: false, view: false, form: false, novo: false, editar: false });
    const [mode, setMode] = useState("new");
    const [current, setCurrent] = useState(null);
    const [targetId, setTargetId] = useState(null);
    const [form, setForm] = useState(NOVO_FORM_PEDIDO());
    const [errors, setErrors] = useState({});

    const fetchData = async () => {
        setLoading(true);
        // Simulação de delay
        setTimeout(() => {
            const sortedPedidos = [...MOCK_PEDIDOS].sort((a, b) => {
                const idAisNum = /^\d+$/.test(a.id);
                const idBisNum = /^\d+$/.test(b.id);
                if (idAisNum && idBisNum) return parseInt(b.id, 10) - parseInt(a.id, 10);
                if (a.id < b.id) return 1;
                if (a.id > b.id) return -1;
                return 0;
            });
            setPedidos(sortedPedidos);
            setLoading(false);
        }, 500);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (triggerNovoRegistro) {
            setModal((m) => ({ ...m, novo: true }));
            onNovoRegistroHandled();
        }
    }, [triggerNovoRegistro, onNovoRegistroHandled]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") setModal({ confirm: false, view: false, form: false, novo: false, editar: false });
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // Lógica de Filtragem
    const listaFiltrada = useMemo(() => {
        let lista = pedidos;
        const t = String(busca).toLowerCase().trim();

        if (t) {
            lista = lista.filter((p) =>
                [formatPedidoId(p.id), p.produtosDesc, p.descricao, p.formaPagamento].join(" ").toLowerCase().includes(t)
            );
        }

        if (statusFilter && statusFilter !== "Todos") {
            const statusArray = Array.isArray(statusFilter) ? statusFilter : [statusFilter];
            if (statusArray.length > 0 && !statusArray.includes("Todos")) {
                lista = lista.filter(p => statusArray.includes(p.status));
            }
        }

        if (paymentFilter && paymentFilter !== "Todos") {
            const paymentArray = Array.isArray(paymentFilter) ? paymentFilter : [paymentFilter];
            if (paymentArray.length > 0 && !paymentArray.includes("Todos")) {
                lista = lista.filter(p => paymentArray.includes(p.formaPagamento));
            }
        }

        return lista;
    }, [busca, pedidos, statusFilter, paymentFilter]);

    // Lógica de Paginação
    const totalPages = Math.max(1, Math.ceil(listaFiltrada.length / ITEMS_PER_PAGE));
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pagina = useMemo(() => listaFiltrada.slice(start, end), [listaFiltrada, start, end]);

    useEffect(() => {
        if (page > totalPages && totalPages > 0) setPage(totalPages);
        else if (page === 0 && totalPages > 0) setPage(1);
    }, [totalPages, page, listaFiltrada]);

    const proxima = () => page < totalPages && setPage((p) => p + 1);
    const anterior = () => page > 1 && setPage((p) => p - 1);

    const fecharTodos = () => setModal({ confirm: false, view: false, form: false, novo: false, editar: false });

    const abrirEditar = (item) => {
        setCurrent(item);
        setModal((m) => ({ ...m, editar: true }));
    };

    const abrirConfirmarExclusao = (id) => {
        setTargetId(id);
        setModal((m) => ({ ...m, confirm: true }));
    };

    const confirmarExclusao = async () => {
        if (!targetId) return;
        setPedidos(pedidos.filter(p => p.id !== targetId));
        fecharTodos();
    };

    const handleNovoPedidoSuccess = (novoPedido) => {
        const newId = String(Math.max(...pedidos.map(p => parseInt(p.id) || 0)) + 1);
        const pedidoCompleto = {
            id: newId,
            clienteNome: novoPedido.clienteNome,
            produtosDesc: novoPedido.produtos?.map(p => p.nome).join(", ") || "Produtos",
            descricao: novoPedido.descricao || "",
            dataCompra: novoPedido.data,
            formaPagamento: novoPedido.formaPagamento,
            itensCount: novoPedido.itensCount || 0,
            valorTotal: novoPedido.valorTotal || 0,
            produtos: novoPedido.produtos || [],
            observacoes: novoPedido.observacoes || "",
            status: "Ativo"
        };
        setPedidos([pedidoCompleto, ...pedidos]);
        setPage(1);
    };

    const handleEditarPedidoSuccess = (pedidoAtualizado) => {
        const updatedPedidos = pedidos.map(p =>
            p.id === pedidoAtualizado.id ? pedidoAtualizado : p
        );
        setPedidos(updatedPedidos);
    };

    return (
        <>
            <div className="flex flex-col gap-4 w-full py-4">
                {loading && <SkeletonLoader count={ITEMS_PER_PAGE} />}

                {!loading && pagina.length === 0 && (
                    <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                        Nenhum pedido encontrado com os filtros atuais.
                    </div>
                )}

                {!loading && pagina.map((item) => (
                    <article key={item.id} className={`flex flex-col gap-4 rounded-lg border p-5 w-full shadow-sm transition-all hover:shadow-md ${item.status === 'Finalizado' ? "bg-gray-50 border-gray-200 opacity-60" : "bg-white border-slate-200"}`}>
                        {/* HEADER DO CARD */}
                        <header className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-md ${item.status === 'Finalizado' ? 'text-gray-400 bg-gray-200' : 'text-slate-400 bg-slate-100'}`}>
                                    <FaBox />
                                </div>
                                <div>
                                    <h3 className={`font-semibold text-sm md:text-base ${item.status === 'Finalizado' ? 'text-gray-600' : 'text-slate-800'}`}>
                                        Pedido #{formatPedidoId(item.id)}
                                    </h3>
                                    <span className={`text-xs block md:hidden ${item.status === 'Finalizado' ? 'text-gray-400' : 'text-slate-500'}`}>{formatDate(item.dataCompra)}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <StatusBadge status={item.status} />
                                <div className="hidden md:block h-4 w-px bg-slate-200 mx-1"></div>
                                <button type="button" className="p-1.5 rounded-md text-slate-500 cursor-pointer hover:bg-slate-100 hover:text-blue-600 transition-colors" title="Editar" onClick={() => abrirEditar(item)}>
                                    <BiSolidPencil size={18} />
                                </button>
                                <button type="button" className="p-1.5 rounded-md text-slate-500 cursor-pointer hover:bg-rose-50 hover:text-rose-600 transition-colors" title="Excluir" onClick={() => abrirConfirmarExclusao(item.id)}>
                                    <FaTrash size={16} />
                                </button>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-2">
                            
                            <div className="md:col-span-2 flex flex-col items-start justify-start gap-1">
                                <span className={`text-md font-bold ${item.status === 'Finalizado' ? 'text-gray-400' : 'text-slate-500'}`}>
                                    {item.itensCount} {item.itensCount === 1 ? 'item' : 'itens'}
                                </span>
                                <span className={`text-base font-bold ${item.status === 'Finalizado' ? 'text-gray-500' : 'text-[#157A98]'}`}>
                                    {formatCurrency(item.valorTotal)}
                                </span>
                            </div>

                            <div className="md:col-span-3 flex flex-col items-start justify-start gap-1">
                                <span className={`text-md font-bold ${item.status === 'Finalizado' ? 'text-gray-400' : 'text-slate-500'}`}>Produtos</span>
                                <span className={`text-md font-medium truncate w-full text-left ${item.status === 'Finalizado' ? 'text-gray-500' : 'text-slate-700'}`} title={item.produtosDesc}>
                                    {item.produtosDesc}
                                </span>
                            </div>

                            <div className="md:col-span-3 flex flex-col items-start justify-start gap-1">
                                <span className={`text-md font-bold ${item.status === 'Finalizado' ? 'text-gray-400' : 'text-slate-500'}`}>Descrição</span>
                                <p className={`text-md line-clamp-2 leading-snug w-full text-left ${item.status === 'Finalizado' ? 'text-gray-500' : 'text-slate-600'}`} title={item.descricao}>
                                    {item.descricao || '-'}
                                </p>
                            </div>

                            <div className="md:col-span-2 flex flex-col items-start justify-start gap-1">
                                <span className={`text-md font-bold ${item.status === 'Finalizado' ? 'text-gray-400' : 'text-slate-500'}`}>Pagamento</span>
                                <span className={`text-md font-medium text-left ${item.status === 'Finalizado' ? 'text-gray-500' : 'text-slate-700'}`}>
                                    {item.formaPagamento}
                                </span>
                            </div>

                            <div className="md:col-span-2 flex flex-col items-start justify-start gap-1">
                                <span className={`text-md font-bold ${item.status === 'Finalizado' ? 'text-gray-400' : 'text-slate-500'}`}>Data da Compra</span>
                                <span className={`text-md font-medium text-left ${item.status === 'Finalizado' ? 'text-gray-500' : 'text-slate-700'}`}>
                                    {formatDate(item.dataCompra)}
                                </span>
                            </div>

                        </div>
                    </article>
                ))}
            </div>

            {/* Paginação */}
            {!loading && listaFiltrada.length > 0 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                    <div className="text-sm text-slate-500">
                        Mostrando <span className="font-medium text-slate-800">{start + 1}</span> a <span className="font-medium text-slate-800">{Math.min(end, listaFiltrada.length)}</span> de {listaFiltrada.length}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={anterior} disabled={page === 1} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md cursor-pointer hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            Anterior
                        </button>
                        <button onClick={proxima} disabled={page === totalPages} className="px-4 py-2 text-sm font-medium text-white bg-[#007EA7] rounded-md cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                            Próximo
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL CONFIRMAÇÃO */}
            {modal.confirm && (
                <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/40 px-4 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) fecharTodos(); }}>
                    <div className=" flex flex-col gap-4 w-full max-w-md bg-white rounded-xl shadow-2xl p-6 animate-scaleIn">
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 text-xl">
                                <FaExclamationTriangle />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Excluir Pedido?</h2>
                            <p className="text-slate-600">
                                Você está prestes a excluir o pedido <span className="font-bold">#{formatPedidoId(targetId)}</span>. Esta ação não pode ser desfeita.
                            </p>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button onClick={fecharTodos} className="flex-1 h-10 rounded-md border border-slate-300 bg-white text-slate-700 font-medium cursor-pointer hover:bg-slate-50">Cancelar</button>
                            <button onClick={confirmarExclusao} className="flex-1 h-10 rounded-md bg-rose-600 text-white font-medium cursor-pointer hover:bg-rose-700 shadow-sm">Sim, Excluir</button>
                        </div>
                    </div>
                </div>
            )}  

            <NovoPedidoModal
                isOpen={modal.novo}
                onClose={fecharTodos}
                onSuccess={handleNovoPedidoSuccess}
            />

            <EditarPedidoModal
                isOpen={modal.editar}
                onClose={fecharTodos}
                pedido={current}
                onSuccess={handleEditarPedidoSuccess}
            />
        </>
    );
}