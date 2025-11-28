import React, { useMemo, useState, useEffect } from "react";
import { FaWrench, FaEdit, FaTrash, FaExternalLinkAlt, FaExclamationTriangle } from "react-icons/fa";
import SkeletonLoader from "../../shared/components/skeleton/SkeletonLoader";
import NovoServicoModal from "../../shared/components/pedidosServicosComponents/NovoServicoModal";
// import Api from "../../axios/Api"

// const API_SERVICOS_URL = "http://localhost:3000/servicos";
// const API_CLIENTES_URL = "http://localhost:3000/clientes";

// ===== DADOS MOCADOS =====
const MOCK_CLIENTES = [
    { id: "1", nome: "João Silva" },
    { id: "2", nome: "Maria Santos" },
    { id: "3", nome: "Carlos Oliveira" },
    { id: "4", nome: "Ana Costa" },
    { id: "5", nome: "Pedro Almeida" },
];

const MOCK_SERVICOS = [
    {
        id: "1",
        clienteId: "1",
        clienteNome: "João Silva",
        data: "2025-11-20",
        descricao: "Troca de óleo e filtros do motor",
        status: "Ativo",
        etapa: "Execução em andamento",
        progresso: [3, 6]
    },
    {
        id: "2",
        clienteId: "2",
        clienteNome: "Maria Santos",
        data: "2025-11-15",
        descricao: "Revisão completa de freios ABS",
        status: "Finalizado",
        etapa: "Concluído",
        progresso: [6, 6]
    },
    {
        id: "3",
        clienteId: "3",
        clienteNome: "Carlos Oliveira",
        data: "2025-11-25",
        descricao: "Alinhamento e balanceamento de rodas",
        status: "Ativo",
        etapa: "Aguardando orçamento",
        progresso: [1, 6]
    },
    {
        id: "4",
        clienteId: "4",
        clienteNome: "Ana Costa",
        data: "2025-11-18",
        descricao: "Reparo de sistema elétrico e bateria",
        status: "Ativo",
        etapa: "Aguardando peças",
        progresso: [2, 6]
    },
    {
        id: "5",
        clienteId: "5",
        clienteNome: "Pedro Almeida",
        data: "2025-11-22",
        descricao: "Troca de correia dentada e tensor",
        status: "Ativo",
        etapa: "Orçamento aprovado",
        progresso: [2, 6]
    },
    {
        id: "6",
        clienteId: "1",
        clienteNome: "João Silva",
        data: "2025-11-10",
        descricao: "Limpeza de bicos injetores",
        status: "Finalizado",
        etapa: "Concluído",
        progresso: [6, 6]
    },
    {
        id: "7",
        clienteId: "2",
        clienteNome: "Maria Santos",
        data: "2025-11-26",
        descricao: "Substituição de amortecedores dianteiros",
        status: "Ativo",
        etapa: "Execução em andamento",
        progresso: [4, 6]
    },
];
// ===== FIM DADOS MOCADOS =====

function StatusPill({ status }) {
    const styles = {
        Ativo: "px-2.5 py-1 rounded-2xl text-[11px] font-medium uppercase tracking-wide bg-[#bfdbfe] text-[#1e3a8a]",
        Finalizado: "px-2.5 py-1 rounded-2xl text-[11px] font-medium uppercase tracking-wide bg-[#d1fae5] text-[#065f46]",
        "Aguardando": "px-2.5 py-1 rounded-2xl text-[11px] font-medium uppercase tracking-wide bg-[#fef3c7] text-[#92400e]"
    };
    return <span className={styles[status] || "px-2.5 py-1 rounded-2xl text-[11px] font-medium uppercase tracking-wide"}>{status}</span>;
}

function Progress({ value = 0, total = 6, dark = false }) {
    const pct = Math.min(100, Math.round((Number(value) / Number(total)) * 100));
    return (
        <div className="flex items-center gap-2 min-w-[140px]">
            <div className="h-3.5 w-full max-w-[120px] rounded-full bg-slate-200 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${pct}%`,
                        backgroundColor: dark ? "#475569" : "#002A4B"
                    }}
                />
            </div>
            <span className="text-sm text-slate-600 font-medium">{value}/{total}</span>
        </div>
    );
}

const formatServicoId = (id) => {
    if (!id) return '';
    if (/^\d+$/.test(id)) {
        return id.padStart(3, '0');
    }
    return id;
}

const ITEMS_PER_PAGE = 5;
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
    const [modal, setModal] = useState({ confirm: false, view: false, form: false, novo: false });
    const [mode, setMode] = useState("new");
    const [current, setCurrent] = useState(null);
    const [targetId, setTargetId] = useState(null);
    const [form, setForm] = useState(NOVO_FORM());
    const [errors, setErrors] = useState({});

    const fetchData = async () => {
        setLoading(true);

        // ===== VERSÃO MOCADA =====
        const sortedServicos = [...MOCK_SERVICOS].sort((a, b) => {
            const idAisNum = /^\d+$/.test(a.id);
            const idBisNum = /^\d+$/.test(b.id);
            if (idAisNum && idBisNum) return parseInt(b.id, 10) - parseInt(a.id, 10);
            if (a.id < b.id) return 1;
            if (a.id > b.id) return -1;
            return 0;
        });
        setServicos(sortedServicos);
        setClientes(MOCK_CLIENTES);
        setLoading(false);

        // ===== VERSÃO COM API (COMENTADA) =====
        // try {
        //     const [servicosRes, clientesRes] = await Promise.all([
        //         Api.get("/servicos"),
        //         Api.get("/clientes")
        //     ]);
        //     const servicosData = servicosRes.data;
        //     const clientesData = clientesRes.data;

        //     const sortedServicos = servicosData.sort((a, b) => {
        //         const idAisNum = /^\d+$/.test(a.id);
        //         const idBisNum = /^\d+$/.test(b.id);
        //         if (idAisNum && idBisNum) return parseInt(b.id, 10) - parseInt(a.id, 10);
        //         if (a.id < b.id) return 1;
        //         if (a.id > b.id) return -1;
        //         return 0;
        //     });

        //     setServicos(sortedServicos);
        //     setClientes(clientesData);
        // } catch (error) {
        //     console.error("Erro ao buscar dados:", error);
        // } finally {
        //     setLoading(false);
        // }
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
            if (e.key === "Escape") setModal({ confirm: false, view: false, form: false, novo: false });
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString + 'T00:00:00').toLocaleDateString("pt-BR");
        } catch (e) {
            return 'Data inválida';
        }
    }

    const listaFiltrada = useMemo(() => {
        let lista = servicos;
        const t = String(busca).toLowerCase().trim();

        if (t) {
            lista = lista.filter((s) =>
                [formatServicoId(s.id), s.clienteNome, s.descricao, s.status, s.etapa].join(" ").toLowerCase().includes(t)
            );
        }

        // Filtro de Status - aceita múltiplos valores
        if (statusFilter && statusFilter !== "Todos") {
            const statusArray = Array.isArray(statusFilter) ? statusFilter : [statusFilter];
            if (statusArray.length > 0 && !statusArray.includes("Todos")) {
                lista = lista.filter(s => statusArray.includes(s.status));
            }
        }

        // Filtro de Etapa - aceita múltiplos valores
        if (etapaFilter && etapaFilter !== "Todos") {
            const etapaArray = Array.isArray(etapaFilter) ? etapaFilter : [etapaFilter];
            if (etapaArray.length > 0 && !etapaArray.includes("Todos")) {
                lista = lista.filter(s => etapaArray.includes(s.etapa));
            }
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
    }, [totalPages, page, listaFiltrada]);

    const proxima = () => page < totalPages && setPage((p) => p + 1);
    const anterior = () => page > 1 && setPage((p) => p - 1);

    const setField = (name, value) => {
        setForm((f) => ({ ...f, [name]: value }));
        if (errors[name]) setErrors(e => ({ ...e, [name]: undefined }));
    };

    const fecharTodos = () => setModal({ confirm: false, view: false, form: false, novo: false });

    const abrirExibir = (item) => {
        setCurrent(item);
        setModal((m) => ({ ...m, view: true }));
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

    const validar = (f) => {
        const e = {};
        if (!f.clienteId) e.clienteId = "Selecione um cliente.";
        if (!String(f.descricao).trim()) e.descricao = "Informe a descrição.";
        if (!f.data) e.data = "Informe a data.";
        if (Number(f.progressoTotal) <= 0) e.progressoTotal = "Total > 0.";
        if (Number(f.progressoValor) < 0 || Number(f.progressoValor) > Number(f.progressoTotal)) e.progressoValor = "Inválido.";
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

        // ===== VERSÃO MOCADA =====
        if (mode === 'edit') {
            const updatedServicos = servicos.map(s =>
                s.id === current.id ? { ...s, ...servicoPayload } : s
            );
            setServicos(updatedServicos);
        } else {
            const newId = String(Math.max(...servicos.map(s => parseInt(s.id) || 0)) + 1);
            setServicos([{ id: newId, ...servicoPayload }, ...servicos]);
            setPage(1);
        }
        fecharTodos();

        // ===== VERSÃO COM API (COMENTADA) =====
        // const url = mode === 'edit' ? `${API_SERVICOS_URL}/${current.id}` : API_SERVICOS_URL;
        // const method = mode === 'edit' ? 'PUT' : 'POST';

        // try {
        //     const response = await fetch(url, {
        //         method: method,
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify(servicoPayload)
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
        setServicos(servicos.filter(s => s.id !== targetId));
        fecharTodos();

        // ===== VERSÃO COM API (COMENTADA) =====
        // try {
        //     await fetch(`${API_SERVICOS_URL}/${targetId}`, { method: 'DELETE' });
        //     await fetchData();
        //     fecharTodos();
        // } catch (error) {
        //     console.error("Erro ao excluir:", error);
        // }
    };

    const handleNovoServicoSuccess = (novoServico) => {
        // ===== VERSÃO MOCADA =====
        const newId = String(Math.max(...servicos.map(s => parseInt(s.id) || 0)) + 1);
        const servicoCompleto = {
            id: newId,
            clienteId: novoServico.clienteId,
            clienteNome: novoServico.clienteNome,
            data: novoServico.data,
            descricao: novoServico.descricao,
            status: "Ativo",
            etapa: "Aguardando orçamento",
            progresso: [1, 6]
        };
        setServicos([servicoCompleto, ...servicos]);
        setPage(1);

        // ===== VERSÃO COM API (COMENTADA) =====
        // fetchData(); // Recarregar dados da API
    };

    return (
        <>
            <div className="flex flex-col gap-4 w-full py-4">
                {loading && <SkeletonLoader count={ITEMS_PER_PAGE} />}

                {!loading && pagina.length === 0 && (
                    <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                        Nenhum serviço encontrado com os filtros atuais.
                    </div>
                )}

                {!loading && pagina.map((item) => (
                    <article key={item.id} className={`flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-6 w-[1300px] shadow-lg/5 transition-all hover:shadow-sm cursor-pointer ${item.status === 'Finalizado' ? "opacity-60 bg-[#f8f9fa]" : ""}`}>
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 text-[#828282] rounded-md">
                                    <FaWrench />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800 text-base">
                                        Pedido de Serviço - #{formatServicoId(item.id)}
                                    </h3>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-end md:self-auto">
                                <StatusPill status={item.status} />
                                <div className="h-4 w-px bg-slate-300 mx-1"></div>
                                <button type="button" className="p-1.5 rounded-full text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a]" title="Exibir Detalhes" onClick={() => abrirExibir(item)}>
                                    <FaExternalLinkAlt />
                                </button>
                                <button type="button" className="p-1.5 rounded-full text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a]" title="Editar" onClick={() => abrirEditar(item)}>
                                    <FaEdit />
                                </button>
                                <button type="button" className="p-1.5 rounded-full text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600" title="Excluir" onClick={() => abrirConfirmarExclusao(item.id)}>
                                    <FaTrash />
                                </button>
                            </div>
                        </header>

                        <div className="flex flex-row gap-10 text-1xl w-[1050px]">
                            <div className="w-1/4 flex flex-col items-center gap-1">
                                <div className="md:col-span-3 flex flex-col items-start gap-1">
                                    <span className="text-slate-500 font-semibold">Nome do Cliente</span>
                                    <span
                                        className="font-semibold text-slate-700 truncate"
                                        title={item.clienteNome}
                                    >
                                        {item.clienteNome || `ID: ${item.clienteId}`}
                                    </span>
                                </div>
                            </div>

                            <div className="w-1/4 flex flex-col gap-1">
                                <div className="md:col-span-3 flex flex-col items-start gap-1">
                                    <span className="text-slate-500 font-semibold">Data Lançamento</span>
                                    <span className="text-slate-700">
                                        {formatDate(item.data)}
                                    </span>
                                </div>
                            </div>

                            <div className="w-1/4 flex flex-col gap-1">
                                <div className="md:col-span-3 flex flex-col items-start gap-1">
                                    <span className="text-slate-500 font-semibold">Descrição Serviço</span>
                                    <span
                                        className="text-slate-600" title={item.descricao}>{item.descricao}
                                    </span>
                                </div>
                            </div>

                            <div className="w-1/4 flex flex-col gap-2">
                                <div className="md:col-span-3 flex flex-col items-start gap-2">
                                    <span className="text-slate-500 font-semibold">{item.etapa}</span>
                                    <Progress
                                        value={item.progresso?.[0]}
                                        total={item.progresso?.[1]}
                                        dark={item.status === "Finalizado"}
                                    />
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
                            <h2 className="text-xl font-bold text-slate-800">Excluir Serviço?</h2>
                            <p className="text-slate-600">
                                Você está prestes a excluir o serviço <span className="font-bold">#{formatServicoId(targetId)}</span>. Esta ação não pode ser desfeita.
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
                                    <FaWrench className="text-[#007EA7]" /> Detalhes da OS
                                </h2>
                                <p className="text-sm text-slate-500">ID: #{formatServicoId(current.id)}</p>
                            </div>
                            <StatusPill status={current.status} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Cliente</label>
                                    <p className="font-medium text-slate-800">{current.clienteNome}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Data Lançamento</label>
                                    <p className="font-medium text-slate-800">{current.data ? new Date(current.data + 'T00:00:00').toLocaleDateString("pt-BR") : '-'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Etapa Atual</label>
                                    <p className="font-medium text-slate-800 bg-slate-50 p-2 rounded border border-slate-100 mt-1">{current.etapa}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Descrição</label>
                                    <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1 min-h-20 text-sm leading-relaxed">{current.descricao}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Progresso</label>
                                    <Progress value={current.progresso?.[0]} total={current.progresso?.[1]} dark={current.status === "Finalizado"} />
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
                                    {mode === "new" ? <FaWrench /> : <FaEdit />}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">{mode === "new" ? "Nova Ordem de Serviço" : `Editar OS #${formatServicoId(current?.id)}`}</h2>
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
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cliente <span className="text-red-500">*</span></label>
                                    <select
                                        name="clienteId"
                                        value={form.clienteId}
                                        onChange={(e) => setField("clienteId", e.target.value)}
                                        className={`w-full h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 bg-white transition-all ${errors.clienteId ? "border-rose-300 focus:ring-rose-100" : "border-slate-300 focus:border-[#007EA7] focus:ring-[#007EA7]/20"}`}
                                    >
                                        <option value="">Selecione...</option>
                                        {clientes.map(cli => (
                                            <option key={cli.id} value={cli.id}>{cli.nome}</option>
                                        ))}
                                    </select>
                                    {errors.clienteId && <p className="text-rose-500 text-xs mt-1">{errors.clienteId}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Data de Lançamento <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        value={form.data}
                                        onChange={(e) => setField("data", e.target.value)}
                                        className={`w-full h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 transition-all ${errors.data ? "border-rose-300 focus:ring-rose-100" : "border-slate-300 focus:border-[#007EA7] focus:ring-[#007EA7]/20"}`}
                                    />
                                    {errors.data && <p className="text-rose-500 text-xs mt-1">{errors.data}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Descrição do Serviço <span className="text-red-500">*</span></label>
                                <textarea
                                    value={form.descricao}
                                    onChange={(e) => setField("descricao", e.target.value)}
                                    placeholder="Descreva o problema e o serviço a ser realizado..."
                                    rows={3}
                                    className={`w-full rounded-md border p-3 text-sm outline-none focus:ring-2 transition-all resize-none ${errors.descricao ? "border-rose-300 focus:ring-rose-100" : "border-slate-300 focus:border-[#007EA7] focus:ring-[#007EA7]/20"}`}
                                />
                                {errors.descricao && <p className="text-rose-500 text-xs mt-1">{errors.descricao}</p>}
                            </div>

                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><FaExclamationTriangle className="text-amber-500" /> Controle de Andamento</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Etapa Atual</label>
                                        <input
                                            value={form.etapa}
                                            onChange={(e) => setField("etapa", e.target.value)}
                                            placeholder="Ex: Aguardando peças"
                                            className="w-full h-9 rounded border border-slate-300 px-3 text-sm focus:border-[#007EA7] focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Feito</label>
                                            <input
                                                type="number"
                                                min={0}
                                                max={form.progressoTotal}
                                                value={form.progressoValor}
                                                onChange={(e) => setField("progressoValor", Number(e.target.value))}
                                                className="w-full h-9 rounded border border-slate-300 px-3 text-sm focus:border-[#007EA7] focus:outline-none"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Total</label>
                                            <input
                                                type="number"
                                                min={1}
                                                value={form.progressoTotal}
                                                onChange={(e) => setField("progressoTotal", Number(e.target.value))}
                                                className="w-full h-9 rounded border border-slate-300 px-3 text-sm focus:border-[#007EA7] focus:outline-none"
                                            />
                                        </div>
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
            
            {/* MODAL NOVO SERVIÇO COM MULTI-ETAPAS */}
            <NovoServicoModal 
                isOpen={modal.novo}
                onClose={fecharTodos}
                onSuccess={handleNovoServicoSuccess}
            />
        </>
    );
}