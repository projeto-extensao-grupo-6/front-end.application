import React, { useMemo, useState, useEffect } from "react";
import "./servicos.css";
import { FaWrench, FaEdit, FaTrash, FaExternalLinkAlt, FaExclamationTriangle, FaUser } from "react-icons/fa";
import Api from "../../axios/Api";

const formatServicoId = (id) => {
    if (!id) return '';
    if (/^\d+$/.test(id)) {
        return id.padStart(3, '0');
    }
    return id;
}

const ITEMS_PER_PAGE = 3;
const NOVO_FORM = () => ({
    clienteId: "",
    clienteNome: "",
    data: new Date().toISOString().slice(0, 10),
    descricao: "",
    status: "Ativo",
    etapa: "Aguardando orçamento",
    progressoValor: 1,
    progressoTotal: 6,
});

export default function ServicosList({ busca = "", triggerNovoRegistro, onNovoRegistroHandled, statusFilter, etapaFilter }) {
    const [servicos, setServicos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [modal, setModal] = useState({ confirm: false, view: false, form: false });
    const [mode, setMode] = useState("new");
    const [current, setCurrent] = useState(null);
    const [targetId, setTargetId] = useState(null);
    const [form, setForm] = useState(NOVO_FORM());
    const [errors, setErrors] = useState({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const [servicosRes, clientesRes] = await Promise.all([
                Api.get("/servicos"),
                Api.get("/clientes")
            ]);
            const servicosData = servicosRes.data;
            const clientesData = clientesRes.data;

            const sortedServicos = servicosData.sort((a, b) => {
                const idAisNum = /^\d+$/.test(a.id);
                const idBisNum = /^\d+$/.test(b.id);

                if (idAisNum && idBisNum) {
                    return parseInt(b.id, 10) - parseInt(a.id, 10);
                }

                if (a.id < b.id) return 1;
                if (a.id > b.id) return -1;
                return 0;
            });

            setServicos(sortedServicos);
            setClientes(clientesData);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (triggerNovoRegistro) {
            setMode("new");
            setForm(NOVO_FORM());
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

    const listaFiltrada = useMemo(() => {
        let lista = servicos;
        const t = String(busca).toLowerCase().trim();

        if (t) {
            lista = lista.filter((s) =>
                [formatServicoId(s.id), s.clienteNome, s.descricao, s.status, s.etapa].join(" ").toLowerCase().includes(t)
            );
        }

        if (statusFilter && statusFilter !== "Todos") {
            const targetStatus = statusFilter === "Finalizado" ? "Finalizado" : "Ativo";
            lista = lista.filter(s => s.status === targetStatus);
        }

        if (etapaFilter && etapaFilter !== "Todos") {
            lista = lista.filter(s => s.etapa === etapaFilter);
        }

        return lista;
    }, [busca, servicos, statusFilter, etapaFilter]);

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

    const setField = (name, value) => {
        setForm((f) => ({ ...f, [name]: value }));
        if (errors[name]) {
            setErrors(e => ({ ...e, [name]: undefined }));
        }
    };
    const fecharTodos = () => setModal({ confirm: false, view: false, form: false });

    const abrirExibir = (item) => {
        setCurrent(item);
        setModal((m) => ({ ...m, view: true }));
    };
    const fecharExibir = () => {
        setCurrent(null);
        setModal((m) => ({ ...m, view: false }));
    };

    const abrirEditar = (item) => {
        setMode("edit");
        setCurrent(item);
        setForm({
            clienteId: item.clienteId || "",
            clienteNome: item.clienteNome || "",
            data: item.data,
            descricao: item.descricao,
            status: item.status,
            etapa: item.etapa,
            progressoValor: item.progresso?.[0] ?? 1,
            progressoTotal: item.progresso?.[1] ?? 6,
        });
        setErrors({});
        setModal((m) => ({ ...m, form: true }));
    };

    const abrirConfirmarExclusao = (id) => {
        setTargetId(id);
        setModal((m) => ({ ...m, confirm: true }));
    };
    const fecharConfirmarExclusao = () => {
        setTargetId(null);
        setModal((m) => ({ ...m, confirm: false }));
    };

    const validar = (f) => {
        const e = {};
        if (!f.clienteId) e.clienteId = "Selecione um cliente.";
        if (!String(f.descricao).trim()) e.descricao = "Informe a descrição.";
        if (!f.data) e.data = "Informe a data.";
        if (Number(f.progressoTotal) <= 0) e.progressoTotal = "Total precisa ser maior que 0.";
        if (Number(f.progressoValor) < 0 || Number(f.progressoValor) > Number(f.progressoTotal)) e.progressoValor = "Valor entre 0 e total.";
        return e;
    };

    const salvar = async (e) => {
        e?.preventDefault();
        const selectedClient = clientes.find(c => c.id === form.clienteId);
        const clienteNomeToSave = selectedClient ? selectedClient.nome : "";
        const formToValidate = { ...form, clienteNome: clienteNomeToSave };
        const errs = validar(formToValidate);
        setErrors(errs);
        if (Object.keys(errs).length) return;

        const servicoPayload = {
            clienteId: formToValidate.clienteId,
            clienteNome: formToValidate.clienteNome,
            data: formToValidate.data,
            descricao: formToValidate.descricao.trim(),
            status: formToValidate.status,
            etapa: (formToValidate.etapa || "Aguardando orçamento").trim(),
            progresso: [Number(formToValidate.progressoValor) || 1, Number(formToValidate.progressoTotal) || 6],
        };

        if (mode === 'new') {
            delete servicoPayload.id;
        }

        try {
            if (mode === 'edit') {
                await Api.put(`/servicos/${current.id}`, servicoPayload);
            } else {
                await Api.post("/servicos", servicoPayload);
            }
            
            await fetchData();
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
            await Api.delete(`/servicos/${targetId}`);
            await fetchData();
            fecharConfirmarExclusao();
        } catch (error) {
            console.error("Erro na exclusão:", error);
        }
    };

    return (
        <>
            <div className="text-[13px] text-slate-500 mb-3 text-left font-semibold p-4">Serviços cadastrados</div>
            <div className="flex flex-col gap-4">
                {loading && <p>Carregando serviços...</p>}
                {!loading && pagina.length === 0 && <p>Nenhum serviço encontrado, ajuste seus filtros.</p>}
                {!loading && pagina.map((item) => (
                    <article key={item.id} className={`rounded-[14px] border border-slate-200 card bg-white p-4 ${item.status === 'Finalizado' ? "pedido-muted" : ""}`}>
                        <header className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-600">
                                <FaWrench />
                                <span className="font-semibold">Pedido de serviço - #{formatServicoId(item.id)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button type="button" className="icon-btn" title="Editar" onClick={() => abrirEditar(item)}>
                                    <FaEdit />
                                </button>
                                <button type="button" className="icon-btn" title="Excluir" onClick={() => abrirConfirmarExclusao(item.id)}>
                                    <FaTrash />
                                </button>
                                <button type="button" className="icon-btn" title="Exibir" onClick={() => abrirExibir(item)}>
                                    <FaExternalLinkAlt />
                                </button>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mt-4 border-slate-100 border-t pt-4">
                            <div className="md:col-span-2">
                                <div className="text-slate-600 text-sm font-semibold">Nome Cliente</div>
                                <div className="text-slate-900">{item.clienteNome || `ID: ${item.clienteId}` || 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-slate-600 text-sm font-semibold">Data Lançamento</div>
                                <div className="text-slate-900">{item.data ? new Date(item.data + 'T00:00:00').toLocaleDateString("pt-BR") : 'N/A'}</div>
                            </div>
                            <div className="md:col-span-2">
                                <div className="text-slate-600 text-sm font-semibold">Descrição</div>
                                <div className="text-slate-900">{item.descricao}</div>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="text-slate-600 text-sm font-semibold mr-2">Status</div>
                                <StatusPill status={item.status} />
                            </div>
                            <div className="flex flex-col items-center justify-between mt-5">
                                <div className="text-slate-600 text-sm">{item.etapa}</div>
                                <Progress value={item.progresso?.[0]} total={item.progresso?.[1]} dark={item.status === "Finalizado"} />
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            <div className="flex items-center justify-between mt-6 p-5">
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
                <div className="fixed inset-0 z-9999 grid place-items-center bg-black/30 px-4" onClick={(e) => { if (e.target === e.currentTarget) fecharConfirmarExclusao(); }}>
                    <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-start gap-3">
                            <FaExclamationTriangle className="text-amber-500 mt-1 text-xl" />
                            <h2 className="text-[22px] font-bold text-center w-full text-slate-800">Tem certeza que deseja excluir o serviço #{formatServicoId(targetId)}?</h2>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={confirmarExclusao} className="px-5 h-10 rounded-md text-white font-semibold" style={{ backgroundColor: "#007EA7" }}>Sim</button>
                            <button onClick={fecharConfirmarExclusao} className="px-5 h-10 rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {modal.view && current && (
                <div className="fixed inset-0 z-9999 grid place-items-center bg-black/30 px-4" onClick={(e) => { if (e.target === e.currentTarget) fecharExibir(); }}>
                    <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-4">Pedido de serviço - #{formatServicoId(current.id)}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-slate-600">Nome Cliente</div>
                                <div className="font-medium">{current.clienteNome || `ID: ${current.clienteId}` || 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-600">Data lançamento</div>
                                <div className="font-medium">{current.data ? new Date(current.data + 'T00:00:00').toLocaleDateString("pt-BR") : 'N/A'}</div>
                            </div>
                            <div className="md:col-span-2">
                                <div className="text-sm text-slate-600">Descrição</div>
                                <div className="font-medium">{current.descricao}</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-600">Status</div>
                                <StatusPill status={current.status} />
                            </div>
                            <div>
                                <div className="text-sm text-slate-600">Etapa</div>
                                <div className="font-medium">{current.etapa}</div>
                            </div>
                            <div className="md:col-span-2">
                                <div className="text-sm text-slate-600 mb-2">Progresso</div>
                                <Progress value={current.progresso?.[0]} total={current.progresso?.[1]} dark={current.status === "Finalizado"} />
                            </div>
                        </div>
                        <div className="mt-6 text-right">
                            <button onClick={fecharExibir} className="px-5 h-10 rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50">Fechar</button>
                        </div>
                    </div>
                </div>
            )}

            {modal.form && (
                <div className="fixed inset-0 z-9999 grid place-items-center bg-black/30 px-4" onClick={(e) => { if (e.target === e.currentTarget) setModal((m) => ({ ...m, form: false })); }}>
                    <form onSubmit={salvar} className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 max-h-[90vh] flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 grid place-items-center text-slate-400">
                                <FaUser />
                            </div>
                            <h2 className="text-[22px] font-bold text-slate-800">{mode === "new" ? "Novo pedido de serviço" : `Editar pedido #${formatServicoId(current?.id)}`}</h2>
                            <div className="ml-auto flex items-center gap-3">
                                <label className="inline-flex items-center gap-2 text-slate-700 select-none">
                                    <span className="text-sm">Status ativo</span>
                                    <input
                                        type="checkbox"
                                        checked={form.status === "Ativo"}
                                        onChange={(e) => setField("status", e.target.checked ? "Ativo" : "Finalizado")}
                                        className="peer sr-only"
                                    />
                                    <span className="w-11 h-6 rounded-full bg-slate-300 relative transition peer-checked:bg-[#007EA7]">
                                        <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition peer-checked:left-[22px]" />
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                                <select
                                    name="clienteId"
                                    value={form.clienteId}
                                    onChange={(e) => setField("clienteId", e.target.value)}
                                    className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 bg-white ${errors.clienteId ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`}
                                >
                                    <option value="">Selecione um cliente...</option>
                                    {clientes.map(cli => (
                                        <option key={cli.id} value={cli.id}>{cli.nome}</option>
                                    ))}
                                </select>
                                {errors.clienteId && <p className="text-rose-600 text-xs mt-1">{errors.clienteId}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Data de lançamento</label>
                                <input
                                    type="date"
                                    name="data"
                                    value={form.data}
                                    onChange={(e) => setField("data", e.target.value)}
                                    className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.data ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`}
                                />
                                {errors.data && <p className="text-rose-600 text-xs mt-1">{errors.data}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                                <input
                                    name="descricao"
                                    value={form.descricao}
                                    onChange={(e) => setField("descricao", e.target.value)}
                                    placeholder="Descrição do serviço"
                                    className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.descricao ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`}
                                />
                                {errors.descricao && <p className="text-rose-600 text-xs mt-1">{errors.descricao}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Etapa</label>
                                    <input
                                        name="etapa"
                                        value={form.etapa}
                                        onChange={(e) => setField("etapa", e.target.value)}
                                        placeholder="Ex.: Aguardando orçamento"
                                        className="w-full h-11 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9AD1D4]"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Progresso (valor)</label>
                                        <input
                                            type="number"
                                            name="progressoValor"
                                            min={0}
                                            max={form.progressoTotal}
                                            value={form.progressoValor}
                                            onChange={(e) => setField("progressoValor", Number(e.target.value))}
                                            className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.progressoValor ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`}
                                        />
                                        {errors.progressoValor && <p className="text-rose-600 text-xs mt-1">{errors.progressoValor}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Progresso (total)</label>
                                        <input
                                            type="number"
                                            name="progressoTotal"
                                            min={1}
                                            value={form.progressoTotal}
                                            onChange={(e) => setField("progressoTotal", Number(e.target.value))}
                                            className={`w-full h-11 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${errors.progressoTotal ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:ring-[#9AD1D4]"}`}
                                        />
                                        {errors.progressoTotal && <p className="text-rose-600 text-xs mt-1">{errors.progressoTotal}</p>}
                                    </div>
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