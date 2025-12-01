import React, { useState, useEffect, useMemo } from 'react';
import { FaBoxOpen, FaEdit, FaTrash, FaExternalLinkAlt, FaExclamationTriangle } from 'react-icons/fa';
import Api from "../../axios/Api";

const ITEMS_PER_PAGE = 3;

const NOVO_FORM_PEDIDO = () => ({
    produtosDesc: "",
    descricao: "",
    dataCompra: new Date().toISOString().slice(0, 10),
    formaPagamento: "",
    itensCount: 1,
    valorTotal: 0,
});

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
    const numericPart = id.replace(/\D/g, '');
    if (numericPart.length > 0) {
        return numericPart.padStart(3, '0');
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

    const fetchPedidos = async () => {
        setLoading(true);
        try {
            const response = await Api.get("/pedidos");
            const sortedData = response.data.sort((a, b) => {
                const numA = parseInt(a.id.replace(/\D/g, '') || 0, 10);
                const numB = parseInt(b.id.replace(/\D/g, '') || 0, 10);

                return numB - numA;
            });

            setPedidos(sortedData);
        } catch (error) {
            console.error("Erro ao buscar pedidos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPedidos();
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
            if (e.key === "Escape") fecharTodos();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const listaFiltrada = useMemo(() => {
        let lista = pedidos;
        const t = String(busca).toLowerCase().trim();

        if (t) {
            lista = lista.filter((p) =>
                [`#${formatPedidoId(p.id)}`, p.produtosDesc, p.descricao, p.formaPagamento].join(" ").toLowerCase().includes(t)
            );
        }

        if (paymentFilter && paymentFilter !== "Todos") {
            lista = lista.filter(p => p.formaPagamento === paymentFilter);
        }

        return lista;
    }, [busca, pedidos, paymentFilter]);

    const totalPages = Math.max(1, Math.ceil(listaFiltrada.length / ITEMS_PER_PAGE));
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pagina = useMemo(() => listaFiltrada.slice(start, end), [listaFiltrada, start, end]);

    useEffect(() => {
        if (page > totalPages && totalPages > 0) setPage(totalPages);
        else if (page === 0 && totalPages > 0) setPage(1);
    }, [totalPages, page]);

    const proxima = () => page < totalPages && setPage((p) => p + 1);
    const anterior = () => page > 1 && setPage((p) => p - 1);

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
        });
        setErrors({});
        setModal((m) => ({ ...m, form: true }));
    };

    const abrirConfirmarExclusao = (id) => {
        setTargetId(id);
        setModal((m) => ({ ...m, confirm: true }));
    };

    const setField = (name, value) => {
        setForm((f) => ({ ...f, [name]: value }));
        if (errors[name]) {
            setErrors(e => ({ ...e, [name]: undefined }));
        }
    };

    const validar = (f) => {
        const e = {};
        if (!String(f.produtosDesc).trim()) e.produtosDesc = "Informe o produto(s).";
        if (Number(f.itensCount) <= 0) e.itensCount = "Itens deve ser > 0.";
        if (Number(f.valorTotal) <= 0) e.valorTotal = "Valor deve ser > 0.";
        return e;
    };

    const salvar = async (e) => {
        e?.preventDefault();
        const errs = validar(form);
        setErrors(errs);
        if (Object.keys(errs).length) return;

        const pedidoPayload = {
            itensCount: Number(form.itensCount),
            valorTotal: Number(form.valorTotal),
            produtosDesc: form.produtosDesc.trim(),
            descricao: form.descricao.trim(),
            dataCompra: form.dataCompra,
            formaPagamento: form.formaPagamento,
        };

        try {
            if (mode === 'edit') {
                await Api.put(`/pedidos/${current.id}`, pedidoPayload);
            } else {
                await Api.post("/pedidos", pedidoPayload);
            }
            
            await fetchPedidos();
            setCurrent(null);
            setModal((m) => ({ ...m, form: false }));
            if (mode === 'new') setPage(1);
        } catch (error) {
            console.error("Erro na operação de salvar:", error);
        }
    };

    const confirmarExclusao = async () => {
        if (!targetId) return;
        try {
            await Api.delete(`/pedidos/${targetId}`);
            await fetchPedidos();
            setTargetId(null);
            setModal((m) => ({ ...m, confirm: false }));
        } catch (error) {
            console.error("Erro na exclusão:", error);
        }
    };


    return (
        <>
            <div className="text-[13px] text-slate-500 mb-3 text-left font-semibold p-4">Pedidos cadastrados</div>
            <div className="flex flex-col gap-3">
                {loading && <p>Carregando pedidos...</p>}
                {!loading && pagina.length === 0 && <p>Nenhum pedido encontrado, ajuste seus filtros.</p>}

                {!loading && pagina.map((item) => (
                    <article key={item.id} className="rounded-[14px] border border-slate-200 card bg-white p-5 hover:shadow-sm transition-shadow flex flex-col gap-4">

                        <header className="flex items-start justify-between">
                            <div className="flex items-center gap-2 text-slate-600">
                                <FaBoxOpen />
                                <span className="font-semibold">Pedido de produtos - #{formatPedidoId(item.id)}</span>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-7 gap-15 mt-2 text-sm">

                            <div className="md:col-span-2">
                                <div className="text-slate-600 font-semibold">Itens e Valor</div>
                                <div className="text-slate-900 font-normal">
                                    {item.itensCount} Item(s)
                                    <span className="ml-3 font-bold text-[#003d6b]">{formatCurrency(item.valorTotal)}</span>
                                </div>
                            </div>

                            <div className="md:col-span-1">
                                <div className="text-slate-600 font-semibold">Produtos</div>
                                <div className="text-slate-900 truncate" title={item.produtosDesc}>{item.produtosDesc}</div>
                            </div>

                            <div className="md:col-span-1">
                                <div className="text-slate-600 font-semibold">Descrição</div>
                                <div className="text-slate-900 truncate" title={item.descricao}>{item.descricao}</div>
                            </div>

                            <div className="md:col-span-1">
                                <div className="text-slate-600 font-semibold">Data da compra</div>
                                <div className="text-slate-900">{formatDate(item.dataCompra)}</div>
                            </div>

                            <div className="md:col-span-1">
                                <div className="text-slate-600 font-semibold">Forma de pagamento</div>
                                <div className="text-slate-900 font-medium">{item.formaPagamento}</div>
                            </div>

                            <div className="flex items-center gap-2 text-slate-500">
                                <button type="button" className="icon-btn hover:text-[#003d6b] cursor-pointer" title="Editar" onClick={() => abrirEditar(item)}>
                                    <FaEdit />
                                </button>
                                <button type="button" className="icon-btn hover:text-red-500 cursor-pointer" title="Excluir" onClick={() => abrirConfirmarExclusao(item.id)}>
                                    <FaTrash />
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 border-t border-slate-100 pt-2 text-xs text-center text-slate-500">
                            Pedido registrado em {formatDate(item.dataCompra)}.
                        </div>

                    </article>
                ))}
            </div>

            <div className="flex items-center justify-between mt-2 p-5">
                <div className="text-sm text-slate-600">
                    Mostrando {listaFiltrada.length ? start + 1 : 0}–{Math.min(end, listaFiltrada.length)} de {listaFiltrada.length} resultados
                </div>
                <div className="flex gap-2">
                    <button onClick={anterior} disabled={page === 1} className={`btn btn-ghost ${page === 1 ? "opacity-50 cursor-not-allowed" : ""}`}>
                        Anterior
                    </button>
                    <button onClick={proxima} disabled={page === totalPages || totalPages === 0} className={`btn btn-ghost ${page === totalPages || totalPages === 0 ? "opacity-50 cursor-not-allowed" : ""}`}>
                        Próximo
                    </button>
                </div>
            </div>

            {modal.confirm && (
                <div className="fixed inset-0 z-9999 grid place-items-center bg-black/30 px-4" onClick={(e) => { if (e.target === e.currentTarget) fecharTodos(); }}>
                    <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-start gap-3">
                            <FaExclamationTriangle className="text-amber-500 mt-1 text-xl" />
                            <h2 className="text-[22px] font-bold text-center w-full text-slate-800">Tem certeza que deseja excluir o pedido #{formatPedidoId(targetId)}?</h2>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={confirmarExclusao} className="px-5 h-10 rounded-md text-white font-semibold" style={{ backgroundColor: "#007EA7" }}>Sim, Excluir</button>
                            <button onClick={fecharTodos} className="px-5 h-10 rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {modal.view && current && (
                <div className=" bg-black/30 px-4" onClick={(e) => { if (e.target === e.currentTarget) fecharTodos(); }}>
                    <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-2">
                        <h2 className="text-xl font-bold mb-4">Detalhes do Pedido #{formatPedidoId(current.id)}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-slate-600">Produtos</div>
                                <div className="font-medium">{current.produtosDesc}</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-600">Valor Total</div>
                                <div className="font-medium text-[#003d6b]">{formatCurrency(current.valorTotal)}</div>
                            </div>
                            <div className="md:col-span-2">
                                <div className="text-sm text-slate-600">Descrição</div>
                                <div className="font-medium">{current.descricao}</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-600">Quantidade de Itens</div>
                                <div className="font-medium">{current.itensCount}</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-600">Forma de pagamento</div>
                                <div className="font-medium">{current.formaPagamento}</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-600">Data da Compra</div>
                                <div className="font-medium">{formatDate(current.dataCompra)}</div>
                            </div>
                        </div>
                        <div className="mt-6 text-right">
                            <button onClick={fecharTodos} className="px-5 h-10 rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50">Fechar</button>
                        </div>
                    </div>
                </div>
            )}

            {modal.form && (
                <div className="fixed inset-0 z-9999 grid place-items-center bg-black/30 px-4" onClick={(e) => { if (e.target === e.currentTarget) fecharTodos(); }}>
                    <form onSubmit={salvar} className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 max-h-[90vh] flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 grid place-items-center text-slate-400">
                                <FaBoxOpen />
                            </div>
                            <h2 className="text-[22px] font-bold text-slate-800">
                                {mode === "new" ? "Novo pedido de produto" : `Editar pedido #${formatPedidoId(current?.id)}`}
                            </h2>
                        </div>

                        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Produtos (Lista ou Nome Principal)</label>
                                    <input
                                        name="produtosDesc"
                                        value={form.produtosDesc}
                                        onChange={(e) => setField("produtosDesc", e.target.value)}
                                        placeholder="Ex.: Silicone, Parafuso M8"
                                        className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.produtosDesc ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`}
                                    />
                                    {errors.produtosDesc && <p className="text-rose-600 text-xs mt-1">{errors.produtosDesc}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Forma de Pagamento</label>
                                    <select
                                        name="formaPagamento"
                                        value={form.formaPagamento}
                                        onChange={(e) => setField("formaPagamento", e.target.value)}
                                        className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 bg-white ${errors.formaPagamento ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="Cartão de crédito">Cartão de crédito</option>
                                        <option value="Cartão de débito">Cartão de débito</option>
                                        <option value="Pix">Pix</option>
                                        <option value="Dinheiro">Dinheiro</option>
                                        <option value="Boleto">Boleto</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição Detalhada</label>
                                <input
                                    name="descricao"
                                    value={form.descricao}
                                    onChange={(e) => setField("descricao", e.target.value)}
                                    placeholder="Descrição do pedido/motivo da compra"
                                    className="w-full h-11 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9AD1D4]"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Data da Compra</label>
                                    <input
                                        type="date"
                                        name="dataCompra"
                                        value={form.dataCompra}
                                        onChange={(e) => setField("dataCompra", e.target.value)}
                                        className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.dataCompra ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Itens (Quantidade)</label>
                                    <input
                                        type="number"
                                        name="itensCount"
                                        min={1}
                                        value={form.itensCount}
                                        onChange={(e) => setField("itensCount", Number(e.target.value))}
                                        className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.itensCount ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`}
                                    />
                                    {errors.itensCount && <p className="text-rose-600 text-xs mt-1">{errors.itensCount}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor Total</label>
                                    <input
                                        type="number"
                                        name="valorTotal"
                                        min={0.01}
                                        step="0.01"
                                        value={form.valorTotal}
                                        onChange={(e) => setField("valorTotal", Number(e.target.value))}
                                        className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.valorTotal ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`}
                                    />
                                    {errors.valorTotal && <p className="text-rose-600 text-xs mt-1">{errors.valorTotal}</p>}
                                </div>
                            </div>

                        </div>

                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                            <button type="submit" className="px-5 h-10 rounded-md text-white font-semibold" style={{ backgroundColor: "#007EA7" }}>
                                {mode === "new" ? "Salvar Pedido" : "Salvar Alterações"}
                            </button>
                            <button type="button" onClick={fecharTodos} className="px-5 h-10 rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}