import React, { useMemo, useState, useEffect } from "react";
import { FaWrench, FaTrash, FaExclamationTriangle } from "react-icons/fa";
import { BiSolidPencil } from "react-icons/bi";
import SkeletonLoader from "../../shared/components/skeleton/SkeletonLoader";
import NovoServicoModal from "../../shared/components/pedidosServicosComponents/NovoServicoModal";
import EditarServicoModal from "../../shared/components/pedidosServicosComponents/EditarServicoModal";

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
        Ativo: "inline-flex items-center px-2.5 py-1 rounded-2xl text-[11px] font-medium uppercase tracking-wide bg-[#bfdbfe] text-[#1e3a8a]",
        Finalizado: "inline-flex items-center px-2.5 py-1 rounded-2xl text-[11px] font-medium uppercase tracking-wide bg-[#d1fae5] text-[#065f46]",
        "Aguardando": "inline-flex items-center px-2.5 py-1 rounded-2xl text-[11px] font-medium uppercase tracking-wide bg-[#fef3c7] text-[#92400e]"
    };
    return <span className={styles[status] || styles.Ativo}>{status}</span>;
}

function Progress({ value = 0, total = 6, dark = false }) {
    const pct = Math.min(100, Math.round((Number(value) / Number(total)) * 100));
    return (
        <div className="flex items-center gap-2 w-full mt-1">
            <div className="h-2 w-full max-w-[120px] rounded-full bg-slate-200 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${pct}%`,
                        backgroundColor: dark ? "#475569" : "#007EA7"
                    }}
                />
            </div>
            <span className="text-xs text-slate-500 font-medium">{value}/{total}</span>
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
    const [modal, setModal] = useState({ confirm: false, view: false, form: false, novo: false, editar: false });
    const [mode, setMode] = useState("new");
    const [current, setCurrent] = useState(null);
    const [targetId, setTargetId] = useState(null);
    const [form, setForm] = useState(NOVO_FORM());
    const [errors, setErrors] = useState({});

    const fetchData = async () => {
        setLoading(true);
        setTimeout(() => {
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

        if (statusFilter && statusFilter !== "Todos") {
            const statusArray = Array.isArray(statusFilter) ? statusFilter : [statusFilter];
            if (statusArray.length > 0 && !statusArray.includes("Todos")) {
                lista = lista.filter(s => statusArray.includes(s.status));
            }
        }

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
        setServicos(servicos.filter(s => s.id !== targetId));
        fecharTodos();
    };

    const handleNovoServicoSuccess = (novoServico) => {
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
    };

    const handleEditarServicoSuccess = (servicoAtualizado) => {
        const updatedServicos = servicos.map(s =>
            s.id === servicoAtualizado.id ? servicoAtualizado : s
        );
        setServicos(updatedServicos);
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
                    <article key={item.id} className={`flex flex-col gap-3 rounded-lg border p-5 w-full shadow-sm transition-all hover:shadow-md ${item.status === 'Finalizado' ? "bg-gray-50 border-gray-200 opacity-60" : "bg-white border-slate-200"}`}>
                        {/* HEADER DO CARD */}
                        <header className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-md ${item.status === 'Finalizado' ? 'text-gray-400 bg-gray-200' : 'text-slate-400 bg-slate-100'}`}>
                                    <FaWrench />
                                </div>
                                <div>
                                    <h3 className={`font-semibold text-sm md:text-base ${item.status === 'Finalizado' ? 'text-gray-600' : 'text-slate-800'}`}>
                                        Serviço #{formatServicoId(item.id)}
                                    </h3>
                                    <span className={`text-xs block md:hidden ${item.status === 'Finalizado' ? 'text-gray-400' : 'text-slate-500'}`}>{formatDate(item.data)}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <StatusPill status={item.status} />
                                <div className="hidden md:block h-4 w-px bg-slate-200 mx-1"></div>
                                <button type="button" className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors" title="Editar" onClick={() => abrirEditar(item)}>
                                    <BiSolidPencil size={18} />
                                </button>
                                <button type="button" className="p-1.5 rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors" title="Excluir" onClick={() => abrirConfirmarExclusao(item.id)}>
                                    <FaTrash size={16} />
                                </button>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-2">
                            
                            <div className="md:col-span-3 flex flex-col items-start justify-start gap-2">
                                <span className={`text-md font-bold mb-1 ${item.status === 'Finalizado' ? 'text-gray-400' : 'text-slate-500'}`}>Cliente</span>
                                <span className={`text-md font-medium truncate w-full text-left ${item.status === 'Finalizado' ? 'text-gray-500' : 'text-slate-700'}`} title={item.clienteNome}>
                                    {item.clienteNome || `ID: ${item.clienteId}`}
                                </span>
                            </div>

                            <div className="md:col-span-2 flex flex-col items-start justify-start gap-2">
                                <span className={`text-md font-bold mb-1 ${item.status === 'Finalizado' ? 'text-gray-400' : 'text-slate-500'}`}>Data</span>
                                <span className={`text-md font-medium ${item.status === 'Finalizado' ? 'text-gray-500' : 'text-slate-700'}`}>
                                    {formatDate(item.data)}
                                </span>
                            </div>

                            <div className="md:col-span-4 flex flex-col items-start justify-start gap-2">
                                <span className={`text-md font-bold mb-1 ${item.status === 'Finalizado' ? 'text-gray-400' : 'text-slate-500'}`}>Descrição</span>
                                <p className={`text-md line-clamp-2 leading-snug w-full text-left ${item.status === 'Finalizado' ? 'text-gray-500' : 'text-slate-600'}`} title={item.descricao}>
                                    {item.descricao}
                                </p>
                            </div>

                            <div className="md:col-span-3 flex flex-col items-start justify-start gap-2">
                                <span className={`text-md font-medium truncate w-full text-left ${item.status === 'Finalizado' ? 'text-gray-500' : 'text-slate-700'}`} title={item.etapa}>{item.etapa}</span>
                                <Progress
                                    value={item.progresso?.[0]}
                                    total={item.progresso?.[1]}
                                    dark={item.status === "Finalizado"}
                                />
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
                            <button onClick={fecharTodos} className="flex-1 h-10 rounded-md border border-slate-300 bg-white text-slate-700 font-medium cursor-pointer hover:bg-slate-50">Cancelar</button>
                            <button onClick={confirmarExclusao} className="flex-1 h-10 rounded-md bg-rose-600 text-white font-medium cursor-pointer hover:bg-rose-700 shadow-sm">Sim, Excluir</button>
                        </div>
                    </div>
                </div>
            )}
            
            <NovoServicoModal 
                isOpen={modal.novo}
                onClose={fecharTodos}
                onSuccess={handleNovoServicoSuccess}
            />

            <EditarServicoModal 
                isOpen={modal.editar}
                onClose={fecharTodos}
                servico={current}
                onSuccess={handleEditarServicoSuccess}
            />
        </>
    );
}