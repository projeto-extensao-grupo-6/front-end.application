import React, { useState, useEffect } from "react";
import { Wrench, X, Edit, Save } from "lucide-react";
import Api from "../../../axios/Api";
import AgendamentoModal from "./AgendamentoModal";

// Definição das etapas do serviço
const ETAPAS_SERVICO = [
    { valor: "PENDENTE", label: "Pendente", progresso: 1 },
    { valor: "AGUARDANDO_ORCAMENTO", label: "Aguardando Orçamento", progresso: 2 },
    { valor: "ANALISE_ORCAMENTO", label: "Análise do Orçamento", progresso: 3 },
    { valor: "ORCAMENTO_APROVADO", label: "Orçamento Aprovado", progresso: 4 },
    { valor: "SERVICO_AGENDADO", label: "Serviço Agendado", progresso: 5 },
    { valor: "SERVICO_EM_EXECUCAO", label: "Serviço em Execução", progresso: 6 },
    { valor: "CONCLUIDO", label: "Concluído", progresso: 7 },
];

const EditarServicoModal = ({ isOpen, onClose, servico, onSuccess }) => {
    const [modoEdicao, setModoEdicao] = useState(false);
    const [formData, setFormData] = useState({
        clienteNome: "",
        data: "",
        descricao: "",
        status: "",
        etapa: "",
        progressoValor: 1,
        progressoTotal: 7,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mostrarAgendamento, setMostrarAgendamento] = useState(false);
    const [etapaAnterior, setEtapaAnterior] = useState("");

    useEffect(() => {
        if (isOpen && servico) {
            // Normalizar a etapa vinda do backend
            const etapaNormalizada = servico.etapa?.toUpperCase().replace(/\s+/g, "_") || "PENDENTE";
            
            setFormData({
                clienteNome: servico.clienteNome || "",
                data: servico.data || "",
                descricao: servico.descricao || "",
                status: servico.status || "Ativo",
                etapa: etapaNormalizada,
                progressoValor: servico.progresso?.[0] || 1,
                progressoTotal: 7,
            });
            setEtapaAnterior(etapaNormalizada);
            setModoEdicao(false);
            setError(null);
        }
    }, [isOpen, servico]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Se mudou a etapa, atualizar o progresso automaticamente
        if (name === "etapa") {
            const etapaInfo = ETAPAS_SERVICO.find(e => e.valor === value);
            
            // Detectar se mudou de PENDENTE para AGUARDANDO_ORCAMENTO
            if (etapaAnterior === "PENDENTE" && value === "AGUARDANDO_ORCAMENTO") {
                setMostrarAgendamento(true);
            }
            
            setFormData((prev) => ({
                ...prev,
                [name]: value,
                progressoValor: etapaInfo ? etapaInfo.progresso : prev.progressoValor,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);

        try {
            const servicoAtualizado = {
                ...servico,
                descricao: formData.descricao,
                status: formData.status,
                etapa: formData.etapa,
                progresso: [
                    parseInt(formData.progressoValor),
                    7,
                ],
            };

            // Chamar API para atualizar
            await Api.put(`/servicos/${servico.id}`, servicoAtualizado);

            if (onSuccess) {
                onSuccess(servicoAtualizado);
            }
            setEtapaAnterior(formData.etapa);
            onClose();
        } catch (err) {
            setError(err.message || "Erro ao atualizar serviço");
        } finally {
            setLoading(false);
        }
    };

    const handleAgendamentoSave = async (dadosAgendamento) => {
        // Aqui você pode salvar os dados do agendamento na API
        console.log("Dados do agendamento:", dadosAgendamento);
        // Exemplo: await Api.post(`/servicos/${servico.id}/agendamento`, dadosAgendamento);
        
        // Fechar o modal de agendamento
        setMostrarAgendamento(false);
    };

    if (!isOpen || !servico) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex justify-center items-start px-10 py-20 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[130vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#eeeeee] p-2.5 rounded-lg">
                            <Wrench className="w-6 h-6 text-[#828282]" />
                        </div>
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Pedido #{servico.id?.toString().padStart(3, "0")}
                            </h2>
                            <p className="text-md text-gray-500">
                                ({modoEdicao ? "Editando informações" : "Visualizando informações"})
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {/* Informações Pedido */}
                <div className="px-6 py-4 space-y-4 flex flex-col gap-6">
                    {/* Cliente */}
                    <div className="flex flex-row gap-10 items-start">
                        <div className="flex flex-col gap-1 items-start rounded-md">
                            <label className="block text-md font-semibold text-gray-700 mb-2">
                                Cliente
                            </label>
                            <input
                                type="text"
                                className="w-lg px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                                value={formData.clienteNome}
                                readOnly
                            />
                        </div>
                        <div className="flex flex-col gap-1 items-start rounded-md">
                            <label className="block text-md font-semibold text-gray-700 mb-2">
                                Data do Pedido
                            </label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                                value={formData.data}
                                readOnly
                            />
                        </div>
                    </div>

                    {/* Descrição */}
                    <div className="flex flex-col gap-1 items-start rounded-md">
                        <label className="block text-md font-semibold text-gray-700 mb-2">
                            Descrição do Serviço
                        </label>
                        <textarea
                            name="descricao"
                            rows={4}
                            className={`w-full px-4 py-2 border border-gray-300 rounded-lg resize-none ${
                                modoEdicao ? "bg-white" : "bg-gray-100"
                            }`}
                            value={formData.descricao}
                            onChange={handleChange}
                            readOnly={!modoEdicao}
                        />
                    </div>

                    {/* Status e Etapa */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1 items-start">
                            <label className="block text-md font-semibold text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                name="status"
                                className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                                    modoEdicao ? "bg-white" : "bg-gray-100"
                                }`}
                                value={formData.status}
                                onChange={handleChange}
                                disabled={!modoEdicao}
                            >
                                <option value="Ativo">Ativo</option>
                                <option value="Finalizado">Finalizado</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1 items-start">
                            <label className="block text-md font-semibold text-gray-700 mb-2">
                                Etapa Atual
                            </label>
                            <select
                                name="etapa"
                                className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                                    modoEdicao ? "bg-white" : "bg-gray-100"
                                }`}
                                value={formData.etapa}
                                onChange={handleChange}
                                disabled={!modoEdicao}
                            >
                                {ETAPAS_SERVICO.map((etapa) => (
                                    <option key={etapa.valor} value={etapa.valor}>
                                        {etapa.label}
                                    </option>
                                ))}
                            </select>
                            {modoEdicao && (
                                <p className="text-sm text-gray-500 mt-2">
                                    Progresso: {formData.progressoValor}/7 etapas
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Progresso */}
                    <div className="flex flex-col gap-2 items-start w-full">
                        <label className="block text-md font-semibold text-gray-700 mb-2">
                            Progresso
                        </label>
                        <div className="flex flex-col gap-2 w-full">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">
                                    Etapa {formData.progressoValor} de 7
                                </span>
                                <span className="text-sm font-semibold text-[#007EA7]">
                                    {Math.round((formData.progressoValor / 7) * 100)}%
                                </span>
                            </div>
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#007EA7] transition-all duration-300"
                                    style={{
                                        width: `${Math.min(
                                            100,
                                            (formData.progressoValor / 7) * 100
                                        )}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t bg-gray-50 flex justify-between">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        Fechar
                    </button>

                    {modoEdicao ? (
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setModoEdicao(false);
                                    setFormData({
                                        clienteNome: servico.clienteNome || "",
                                        data: servico.data || "",
                                        descricao: servico.descricao || "",
                                        status: servico.status || "Ativo",
                                        etapa: etapaAnterior,
                                        progressoValor: servico.progresso?.[0] || 1,
                                        progressoTotal: 7,
                                    });
                                }}
                                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={loading}
                                className="px-6 py-2.5 bg-[#007EA7] text-white rounded-lg  cursor-pointer hover:bg-[#006891] transition-colors disabled:opacity-50 flex items-center gap-2 font-semibold"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Salvar Alterações
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setModoEdicao(true)}
                            className="px-6 py-2.5 bg-[#007EA7] text-white rounded-lg cursor-pointer hover:bg-[#006891] transition-colors flex items-center gap-2 font-semibold"
                        >
                            <Edit className="w-4 h-4" />
                            Editar
                        </button>
                    )}
                </div>
            </div>
            
            {/* Modal de Agendamento */}
            <AgendamentoModal
                isOpen={mostrarAgendamento}
                onClose={() => setMostrarAgendamento(false)}
                onSave={handleAgendamentoSave}
                servicoId={servico?.id}
            />
        </div>
    );
};

export default EditarServicoModal;
