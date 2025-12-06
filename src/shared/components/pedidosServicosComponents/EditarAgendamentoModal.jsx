import React, { useState, useEffect } from "react";
import { Calendar, Clock, X, Save, Trash2, MapPin, Users, Package, FileText, AlertCircle } from "lucide-react";
import agendamentosService from "../../../services/agendamentosService";

const EditarAgendamentoModal = ({ isOpen, onClose, agendamento, onSuccess }) => {
    const [formData, setFormData] = useState({
        dataAgendamento: "",
        inicioAgendamento: "",
        fimAgendamento: "",
        observacao: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (isOpen && agendamento) {
            setFormData({
                dataAgendamento: agendamento.dataAgendamento || "",
                inicioAgendamento: agendamento.inicioAgendamento || "",
                fimAgendamento: agendamento.fimAgendamento || "",
                observacao: agendamento.observacao || "",
            });
            setError(null);
        }
    }, [isOpen, agendamento]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        
        if (!formData.dataAgendamento || !formData.inicioAgendamento || !formData.fimAgendamento) {
            setError("Por favor, preencha a data, horário de início e fim do agendamento.");
            return;
        }

        
        if (formData.inicioAgendamento >= formData.fimAgendamento) {
            setError("O horário de fim deve ser posterior ao horário de início.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
          
            const agendamentoData = {
                tipoAgendamento: agendamento.tipoAgendamento,
                dataAgendamento: formData.dataAgendamento,
                inicioAgendamento: formData.inicioAgendamento,
                fimAgendamento: formData.fimAgendamento,
                observacao: formData.observacao,
                statusAgendamento: agendamento.statusAgendamento,
                endereco: agendamento.endereco,
                funcionarios: agendamento.funcionarios || [],
                produtos: agendamento.produtos || [],
                servico: agendamento.servico ? { id: agendamento.servico.id } : null
            };

            console.log("🔄 Atualizando agendamento:", agendamentoData);

            await agendamentosService.update(agendamento.id, agendamentoData);
            
            if (onSuccess) {
                onSuccess();
            }
            onClose();
        } catch (err) {
            console.error("❌ Erro ao atualizar agendamento:", err);
            setError(err.response?.data?.message || "Erro ao atualizar agendamento. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        setError(null);

        try {
            await agendamentosService.delete(agendamento.id);
            
            if (onSuccess) {
                onSuccess();
            }
            setShowDeleteConfirm(false);
            onClose();
        } catch (err) {
            console.error("❌ Erro ao deletar agendamento:", err);
            setError(err.response?.data?.message || "Erro ao deletar agendamento. Tente novamente.");
            setShowDeleteConfirm(false);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            dataAgendamento: "",
            inicioAgendamento: "",
            fimAgendamento: "",
            observacao: "",
        });
        setError(null);
        setShowDeleteConfirm(false);
        onClose();
    };

    if (!isOpen || !agendamento) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center px-4 z-50"
                onClick={handleCancel}
            >
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    Editar Agendamento #{agendamento.id?.toString().padStart(3, '0')}
                                </h2>
                                <p className="text-blue-100 text-sm">
                                    {agendamento.tipoAgendamento === 'ORCAMENTO' ? 'Orçamento' : 'Execução de Serviço'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleCancel}
                            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mx-6 mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-red-800 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Conteúdo */}
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Coluna Esquerda - Edição */}
                            <div className="space-y-4">
                                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Informações do Agendamento
                                    </h3>
                                </div>

                                {/* Data do Agendamento */}
                                <div className="flex flex-col gap-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Data do Agendamento *
                                    </label>
                                    <input
                                        type="date"
                                        name="dataAgendamento"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={formData.dataAgendamento}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split("T")[0]}
                                    />
                                </div>

                                {/* Horário de Início */}
                                <div className="flex flex-col gap-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Horário de Início *
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="time"
                                            name="inicioAgendamento"
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={formData.inicioAgendamento}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Horário de Fim */}
                                <div className="flex flex-col gap-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Horário de Término *
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="time"
                                            name="fimAgendamento"
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={formData.fimAgendamento}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Observações */}
                                <div className="flex flex-col gap-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Observações
                                    </label>
                                    <textarea
                                        name="observacao"
                                        rows={4}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Adicione informações adicionais sobre o agendamento..."
                                        value={formData.observacao}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Coluna Direita - Informações */}
                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">
                                        Detalhes do Agendamento
                                    </h3>
                                </div>

                                {/* Status */}
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Status:</span>
                                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                            agendamento.statusAgendamento?.nome === 'PENDENTE'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : agendamento.statusAgendamento?.nome === 'CONFIRMADO'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {agendamento.statusAgendamento?.nome || 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                {/* Endereço */}
                                {agendamento.endereco && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPin className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm font-semibold text-blue-800">Local</span>
                                        </div>
                                        <div className="text-sm text-blue-700 space-y-1">
                                            <p>{agendamento.endereco.rua}, {agendamento.endereco.numero || 'S/N'}</p>
                                            <p>{agendamento.endereco.bairro}, {agendamento.endereco.cidade} - {agendamento.endereco.uf}</p>
                                            <p>CEP: {agendamento.endereco.cep}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Funcionários */}
                                {agendamento.funcionarios && agendamento.funcionarios.length > 0 && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users className="w-4 h-4 text-green-600" />
                                            <span className="text-sm font-semibold text-green-800">
                                                Equipe ({agendamento.funcionarios.length})
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {agendamento.funcionarios.map((funcionario) => (
                                                <div key={funcionario.id} className="text-sm text-green-700">
                                                    <p className="font-medium">{funcionario.nome}</p>
                                                    <p className="text-xs">{funcionario.funcao}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Produtos */}
                                {agendamento.produtos && agendamento.produtos.length > 0 && (
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Package className="w-4 h-4 text-purple-600" />
                                            <span className="text-sm font-semibold text-purple-800">
                                                Produtos ({agendamento.produtos.length})
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {agendamento.produtos.map((item, index) => (
                                                <div key={index} className="text-sm text-purple-700">
                                                    <p className="font-medium">{item.produto.nome}</p>
                                                    <p className="text-xs">Qtd: {item.quantidadeReservada}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t bg-gray-50 px-6 py-4 flex justify-between items-center">
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={loading}
                            className="px-4 py-2.5 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            Excluir
                        </button>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={loading}
                                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={loading}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-semibold disabled:opacity-50"
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
                    </div>
                </div>
            </div>

            {/* Modal de Confirmação de Exclusão */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center px-4 z-[60]">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Excluir Agendamento</h3>
                                <p className="text-sm text-gray-600">Esta ação não pode ser desfeita</p>
                            </div>
                        </div>
                        
                        <p className="text-gray-700 mb-6">
                            Tem certeza que deseja excluir o agendamento <span className="font-bold">#{agendamento.id?.toString().padStart(3, '0')}</span>?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50"
                            >
                                {loading ? 'Excluindo...' : 'Sim, Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EditarAgendamentoModal;
