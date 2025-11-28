import React, { useState, useEffect, useMemo } from 'react';
import { FaBox, FaBoxOpen, FaTrash, FaExternalLinkAlt, FaExclamationTriangle } from 'react-icons/fa';
import SkeletonLoader from '../../shared/components/skeleton/SkeletonLoader';

// import Api from "../../axios/Api";

// const API_PEDIDOS_URL = "http://localhost:3000/pedidos";

// ===== DADOS MOCADOS =====
const MOCK_PEDIDOS = [
    {
        id: "1",
        produtosDesc: "Vidros temperados",
        descricao: "Vidro temperado 8mm para janela — 1,20m x 1,00m",
        dataCompra: "2025-11-20",
        formaPagamento: "Pix",
        itensCount: 2,
        valorTotal: 480.00,
        status: "Ativo"
    },
    {
        id: "2",
        produtosDesc: "Ferragens para vidro",
        descricao: "Kit de roldanas para porta de correr + puxadores",
        dataCompra: "2025-11-18",
        formaPagamento: "Cartão de crédito",
        itensCount: 6,
        valorTotal: 265.90,
        status: "Finalizado"
    },
    {
        id: "3",
        produtosDesc: "Espelhos",
        descricao: "Espelho 4mm lapidado — 1,50m x 0,60m",
        dataCompra: "2025-11-25",
        formaPagamento: "Dinheiro",
        itensCount: 1,
        valorTotal: 350.00,
        status: "Ativo"
    },
    {
        id: "4",
        produtosDesc: "Box para banheiro",
        descricao: "Box de vidro temperado 8mm — modelo de correr, cor incolor",
        dataCompra: "2025-11-15",
        formaPagamento: "Boleto",
        itensCount: 1,
        valorTotal: 780.00,
        status: "Ativo"
    },
    {
        id: "5",
        produtosDesc: "Vidros laminados",
        descricao: "Vidro laminado 3+3mm — 2 chapas 2,00m x 1,00m",
        dataCompra: "2025-11-22",
        formaPagamento: "Pix",
        itensCount: 2,
        valorTotal: 560.75,
        status: "Ativo"
    },
    {
        id: "6",
        produtosDesc: "Acessórios",
        descricao: "Fechos, dobradiças e suportes para prateleiras de vidro",
        dataCompra: "2025-11-12",
        formaPagamento: "Cartão de crédito",
        itensCount: 10,
        valorTotal: 312.00,
        status: "Finalizado"
    },
    {
        id: "7",
        produtosDesc: "Prateleiras de vidro",
        descricao: "Prateleiras em vidro 10mm — kit com 3 unidades",
        dataCompra: "2025-11-26",
        formaPagamento: "Pix",
        itensCount: 3,
        valorTotal: 450.00,
        status: "Ativo"
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
    const [modal, setModal] = useState({ confirm: false, view: false, form: false });
    const [mode, setMode] = useState("new");
    const [current, setCurrent] = useState(null);
    const [targetId, setTargetId] = useState(null);
    const [form, setForm] = useState(NOVO_FORM_PEDIDO());
    const [errors, setErrors] = useState({});

    const fetchData = async () => {
        setLoading(true);

        // ===== VERSÃO MOCADA =====
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

        // ===== VERSÃO COM API (COMENTADA) =====
        // try {
        //     const response = await Api.get("/pedidos");
        //     const pedidosData = response.data;
        //     
        //     const sortedPedidos = pedidosData.sort((a, b) => {
        //         const idAisNum = /^\d+$/.test(a.id);
        //         const idBisNum = /^\d+$/.test(b.id);
        //         if (idAisNum && idBisNum) return parseInt(b.id, 10) - parseInt(a.id, 10);
        //         if (a.id < b.id) return 1;
        //         if (a.id > b.id) return -1;
        //         return 0;
        //     });
        //     
        //     setPedidos(sortedPedidos);
        // } catch (error) {
        //     console.error("Erro ao buscar pedidos:", error);
        // } finally {
        //     setLoading(false);
        // }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (triggerNovoRegistro) {
            setMode('new');
            setForm(NOVO_FORM_PEDIDO());
            setErrors({});
            setModal((m) => ({ ...m, form: true }));
            onNovoRegistroHandled();
        }
    }, [triggerNovoRegistro, onNovoRegistroHandled]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") setModal({ confirm: false, view: false, form: false });
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

        // Filtro de Status - aceita múltiplos valores
        if (statusFilter && statusFilter !== "Todos") {
            const statusArray = Array.isArray(statusFilter) ? statusFilter : [statusFilter];
            if (statusArray.length > 0 && !statusArray.includes("Todos")) {
                lista = lista.filter(p => statusArray.includes(p.status));
            }
        }

        // Filtro de Pagamento - aceita múltiplos valores
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

    const setField = (name, value) => {
        setForm((f) => ({ ...f, [name]: value }));
        if (errors[name]) setErrors(e => ({ ...e, [name]: undefined }));
    };

    const fecharTodos = () => setModal({ confirm: false, view: false, form: false });

    const abrirExibir = (item) => {
        setCurrent(item);
        setModal((m) => ({ ...m, view: true }));
    };

    const abrirEditar = (item) => {
        setMode("edit");
        setCurrent(item);
        setForm({
            produtosDesc: item.produtosDesc || "",
            descricao: item.descricao || "",
            dataCompra: item.dataCompra,
            formaPagamento: item.formaPagamento,
            itensCount: item.itensCount || 1,
            valorTotal: item.valorTotal || 0,
            status: item.status || "Ativo",
        });
        setErrors({});
        setModal((m) => ({ ...m, form: true }));
    };

    const abrirConfirmarExclusao = (id) => {
        setTargetId(id);
        setModal((m) => ({ ...m, confirm: true }));
    };

    const validar = (f) => {
        const e = {};
        if (!String(f.produtosDesc).trim()) e.produtosDesc = "Informe os produtos.";
        if (!f.dataCompra) e.dataCompra = "Informe a data.";
        if (!f.formaPagamento) e.formaPagamento = "Selecione a forma de pagamento.";
        if (Number(f.itensCount) <= 0) e.itensCount = "Qtd. > 0.";
        if (Number(f.valorTotal) < 0) e.valorTotal = "Valor inválido.";
        return e;
    };

    const salvar = async (e) => {
        e?.preventDefault();
        
        const errs = validar(form);
        setErrors(errs);
        if (Object.keys(errs).length) return;

        const pedidoPayload = {
            produtosDesc: form.produtosDesc.trim(),
            descricao: form.descricao.trim(),
            dataCompra: form.dataCompra,
            formaPagamento: form.formaPagamento,
            itensCount: Number(form.itensCount) || 1,
            valorTotal: Number(form.valorTotal) || 0,
            status: form.status,
        };

        // ===== VERSÃO MOCADA =====
        if (mode === 'edit') {
            const updatedPedidos = pedidos.map(p =>
                p.id === current.id ? { ...p, ...pedidoPayload } : p
            );
            setPedidos(updatedPedidos);
        } else {
            const newId = String(Math.max(...pedidos.map(p => parseInt(p.id) || 0)) + 1);
            setPedidos([{ id: newId, ...pedidoPayload }, ...pedidos]);
            setPage(1);
        }
        fecharTodos();

        // ===== VERSÃO COM API (COMENTADA) =====
        // const url = mode === 'edit' ? `${API_PEDIDOS_URL}/${current.id}` : API_PEDIDOS_URL;
        // const method = mode === 'edit' ? 'PUT' : 'POST';

        // try {
        //     const response = await fetch(url, {
        //         method: method,
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify(pedidoPayload)
        //     });
        //     if (!response.ok) throw new Error("Erro na API");
        //     await fetchData();
        //     fecharTodos();
        //     if (mode === 'new') setPage(1);
        // } catch (error) {
        //     console.error("Erro ao salvar:", error);
        // }
    };

    const confirmarExclusao = async () => {
        if (!targetId) return;

        // ===== VERSÃO MOCADA =====
        setPedidos(pedidos.filter(p => p.id !== targetId));
        fecharTodos();

        // ===== VERSÃO COM API (COMENTADA) =====
        // try {
        //     await fetch(`${API_PEDIDOS_URL}/${targetId}`, { method: 'DELETE' });
        //     await fetchData();
        //     fecharTodos();
        // } catch (error) {
        //     console.error("Erro ao excluir:", error);
        // }
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
                    <article key={item.id} className={`rounded-lg border border-slate-200 bg-white p-5 w-[1300px] transition-all hover:shadow-sm cursor-pointer ${item.status === 'Finalizado' ? "opacity-60 bg-[#f8f9fa]" : ""}`}>
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 text-[#828282] rounded-md">
                                    <FaBox />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-base">
                                        Pedido #{formatPedidoId(item.id)}
                                    </h3>
                                    <span className="text-xs text-slate-500">
                                        {formatDate(item.dataCompra)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-end md:self-auto">
                                <StatusBadge status={item.status} />
                                <div className="h-4 w-px bg-slate-300 mx-1"></div>
                                <button type="button" className="p-1.5 rounded-full text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a]" title="Exibir Detalhes" onClick={() => abrirExibir(item)}>
                                    <FaExternalLinkAlt />
                                </button>
                                <button type="button" className="p-1.5 rounded-full text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a]" title="Editar" onClick={() => abrirEditar(item)}>
                                    <FaBox />
                                </button>
                                <button type="button" className="p-1.5 rounded-full text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600" title="Excluir" onClick={() => abrirConfirmarExclusao(item.id)}>
                                    <FaTrash />
                                </button>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-sm">
                            <div className="md:col-span-3">
                                <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Produtos</div>
                                <div className="font-medium text-slate-700 truncate" title={item.produtosDesc}>
                                    {item.produtosDesc}
                                </div>
                            </div>

                            <div className="md:col-span-4">
                                <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Descrição</div>
                                <div className="text-slate-600 line-clamp-2" title={item.descricao}>
                                    {item.descricao || '-'}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Pagamento</div>
                                <div className="text-slate-700 font-medium">{item.formaPagamento}</div>
                            </div>

                            <div className="md:col-span-3 flex flex-col justify-center">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 text-xs font-semibold uppercase">Valor Total</span>
                                    <span className="text-[#007EA7] text-lg font-bold">{formatCurrency(item.valorTotal)}</span>
                                </div>
                                <div className="text-xs text-slate-500 text-right mt-1">
                                    {item.itensCount} {item.itensCount === 1 ? 'item' : 'itens'}
                                </div>
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
                        <button onClick={anterior} disabled={page === 1} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            Anterior
                        </button>
                        <button onClick={proxima} disabled={page === totalPages} className="px-4 py-2 text-sm font-medium text-white bg-[#007EA7] rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                            Próximo
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL CONFIRMAÇÃO */}
            {modal.confirm && (
                <div className="fixed inset-0 z-9999 grid place-items-center bg-black/40 px-4 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) fecharTodos(); }}>
                    <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 animate-scaleIn">
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
                            <button onClick={fecharTodos} className="flex-1 h-10 rounded-md border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50">Cancelar</button>
                            <button onClick={confirmarExclusao} className="flex-1 h-10 rounded-md bg-rose-600 text-white font-medium hover:bg-rose-700 shadow-sm">Sim, Excluir</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL VIEW */}
            {modal.view && current && (
                <div className="fixed inset-0 z-9999 grid place-items-center bg-black/40 px-4 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) fecharTodos(); }}>
                    <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6 animate-scaleIn">
                        <div className="flex justify-between items-start mb-6 border-b pb-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <FaBoxOpen className="text-[#007EA7]" /> Detalhes do Pedido
                                </h2>
                                <p className="text-sm text-slate-500">ID: #{formatPedidoId(current.id)}</p>
                            </div>
                            <StatusBadge status={current.status} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Produtos</label>
                                    <p className="font-medium text-slate-800">{current.produtosDesc}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Data da Compra</label>
                                    <p className="font-medium text-slate-800">{formatDate(current.dataCompra)}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Forma de Pagamento</label>
                                    <p className="font-medium text-slate-800 bg-slate-50 p-2 rounded border border-slate-100 mt-1">{current.formaPagamento}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Descrição</label>
                                    <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1 min-h-20 text-sm leading-relaxed">{current.descricao || 'Sem descrição'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase">Quantidade</label>
                                        <p className="font-medium text-slate-800 text-2xl">{current.itensCount}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase">Valor Total</label>
                                        <p className="font-bold text-[#007EA7] text-2xl">{formatCurrency(current.valorTotal)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t flex justify-end">
                            <button onClick={fecharTodos} className="px-6 py-2 rounded-md bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors">Fechar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL FORM (Novo/Editar) */}
            {modal.form && (
                <div className="fixed inset-0 z-9999 grid place-items-center bg-black/40 px-4 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) fecharTodos(); }}>
                    <form onSubmit={salvar} className="w-full max-w-3xl bg-white rounded-xl shadow-2xl p-0 overflow-hidden flex flex-col max-h-[90vh] animate-scaleIn">

                        {/* Header Modal */}
                        <div className="px-6 py-4 bg-slate-50 border-b flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white border shadow-sm grid place-items-center text-[#007EA7]">
                                    {mode === "new" ? <FaBoxOpen /> : <FaEdit />}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">{mode === "new" ? "Novo Pedido" : `Editar Pedido #${formatPedidoId(current?.id)}`}</h2>
                                    <p className="text-xs text-slate-500">Preencha os dados abaixo</p>
                                </div>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer group">
                                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800">Status Ativo</span>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={form.status === "Ativo"}
                                        onChange={(e) => setField("status", e.target.checked ? "Ativo" : "Finalizado")}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-[#007EA7] transition-colors"></div>
                                    <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
                                </div>
                            </label>
                        </div>

                        {/* Body Scrollable */}
                        <div className="p-6 overflow-y-auto space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Produtos <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={form.produtosDesc}
                                        onChange={(e) => setField("produtosDesc", e.target.value)}
                                        placeholder="Ex: Peças automotivas"
                                        className={`w-full h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 transition-all ${errors.produtosDesc ? "border-rose-300 focus:ring-rose-100" : "border-slate-300 focus:border-[#007EA7] focus:ring-[#007EA7]/20"}`}
                                    />
                                    {errors.produtosDesc && <p className="text-rose-500 text-xs mt-1">{errors.produtosDesc}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Data da Compra <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        value={form.dataCompra}
                                        onChange={(e) => setField("dataCompra", e.target.value)}
                                        className={`w-full h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 transition-all ${errors.dataCompra ? "border-rose-300 focus:ring-rose-100" : "border-slate-300 focus:border-[#007EA7] focus:ring-[#007EA7]/20"}`}
                                    />
                                    {errors.dataCompra && <p className="text-rose-500 text-xs mt-1">{errors.dataCompra}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Descrição Detalhada</label>
                                <textarea
                                    value={form.descricao}
                                    onChange={(e) => setField("descricao", e.target.value)}
                                    placeholder="Descreva os itens do pedido..."
                                    rows={3}
                                    className="w-full rounded-md border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:border-[#007EA7] focus:ring-[#007EA7]/20 transition-all resize-none"
                                />
                            </div>

                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <h3 className="text-sm font-bold text-slate-700 mb-3">Informações Financeiras</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Forma de Pagamento <span className="text-red-500">*</span></label>
                                        <select
                                            value={form.formaPagamento}
                                            onChange={(e) => setField("formaPagamento", e.target.value)}
                                            className={`w-full h-9 rounded border px-3 text-sm focus:border-[#007EA7] focus:outline-none ${errors.formaPagamento ? "border-rose-300" : "border-slate-300"}`}
                                        >
                                            <option value="">Selecione...</option>
                                            <option value="Pix">Pix</option>
                                            <option value="Cartão de crédito">Cartão de crédito</option>
                                            <option value="Dinheiro">Dinheiro</option>
                                            <option value="Boleto">Boleto</option>
                                        </select>
                                        {errors.formaPagamento && <p className="text-rose-500 text-xs mt-1">{errors.formaPagamento}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Quantidade de Itens</label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={form.itensCount}
                                            onChange={(e) => setField("itensCount", Number(e.target.value))}
                                            className="w-full h-9 rounded border border-slate-300 px-3 text-sm focus:border-[#007EA7] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Valor Total (R$)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min={0}
                                            value={form.valorTotal}
                                            onChange={(e) => setField("valorTotal", Number(e.target.value))}
                                            className="w-full h-9 rounded border border-slate-300 px-3 text-sm focus:border-[#007EA7] focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Modal */}
                        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
                            <button type="button" onClick={fecharTodos} className="px-5 py-2 rounded-md border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-100 transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" className="px-5 py-2 rounded-md text-white font-semibold shadow-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: "#007EA7" }}>
                                {mode === "new" ? "Salvar Pedido" : "Salvar Alterações"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}