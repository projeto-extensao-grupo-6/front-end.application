import React, { useState, useEffect } from "react";
import { Wrench, X, Edit, Save, Calendar, ClipboardList, User, MapPin, Package, Users, Clock, Phone, Mail, CreditCard, FileText, CheckCircle, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Api from "../../../axios/Api";
import EditarAgendamentoModal from "./EditarAgendamentoModal";

const ETAPAS_SERVICO = [
    { valor: "PENDENTE", label: "Pendente", progresso: 1 },
    { valor: "AGUARDANDO ORÇAMENTO", label: "Aguardando Orçamento", progresso: 2 },
    { valor: "ANÁLISE DO ORÇAMENTO", label: "Análise do Orçamento", progresso: 3 },
    { valor: "ORÇAMENTO APROVADO", label: "Orçamento Aprovado", progresso: 4 },
    { valor: "SERVIÇO AGENDADO", label: "Serviço Agendado", progresso: 5 },
    { valor: "SERVIÇO EM EXECUÇÃO", label: "Serviço em Execução", progresso: 6 },
    { valor: "CONCLUÍDO", label: "Concluído", progresso: 7 },
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
    const [etapaAnterior, setEtapaAnterior] = useState("");
    const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
    const [mostrarEditarAgendamento, setMostrarEditarAgendamento] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && servico) {
            const etapaNormalizada = servico.etapaOriginal || servico.etapa?.toUpperCase().replace(/\s+/g, "_") || "PENDENTE";
            
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
        
        if (name === "etapa") {
            const etapaInfo = ETAPAS_SERVICO.find(e => e.valor === value);
            
            if (etapaAnterior === "PENDENTE" && value === "AGUARDANDO ORÇAMENTO") {
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
            const pedidoData = {
                pedido: {
                    valorTotal: servico.valorTotal || 0.00,
                    ativo: formData.status === "Ativo",
                    formaPagamento: servico.formaPagamento || "A negociar",
                    observacao: formData.descricao || "",
                    cliente: {
                        id: servico.clienteId || servico.clienteInfo?.id,
                        nome: servico.clienteNome || servico.clienteInfo?.nome || "",
                        cpf: servico.clienteInfo?.cpf || "",
                        email: servico.clienteInfo?.email || "",
                        telefone: servico.clienteInfo?.telefone || "",
                        status: "Ativo",
                        enderecos: servico.clienteInfo?.endereco ? [{
                            id: servico.clienteInfo.endereco.id || 0,
                            rua: servico.clienteInfo.endereco.rua || "",
                            complemento: servico.clienteInfo.endereco.complemento || "",
                            cep: servico.clienteInfo.endereco.cep || "",
                            cidade: servico.clienteInfo.endereco.cidade || "",
                            bairro: servico.clienteInfo.endereco.bairro || "",
                            uf: servico.clienteInfo.endereco.uf || "",
                            pais: servico.clienteInfo.endereco.pais || "Brasil",
                            numero: servico.clienteInfo.endereco.numero || 0
                        }] : []
                    },
                    status: {
                        tipo: "PEDIDO",
                        nome: formData.status.toUpperCase()
                    }
                },
                servico: {
                    nome: servico.servicoNome || servico.servico?.nome || "Serviço",
                    descricao: formData.descricao || "",
                    precoBase: servico.servico?.precoBase || 0.00,
                    ativo: true,
                    etapa: {
                        tipo: "PEDIDO",
                        nome: formData.etapa
                    }
                }
            };

            const response = await Api.put(`/pedidos/${servico.id}`, pedidoData);
            
            if (response.status === 200 || response.status === 204) {
                if (onSuccess) {
                    onSuccess({
                        ...servico,
                        descricao: formData.descricao,
                        status: formData.status,
                        etapa: formData.etapa,
                        etapaOriginal: formData.etapa,
                        progresso: [parseInt(formData.progressoValor), 7],
                    });
                }
                setEtapaAnterior(formData.etapa);
                onClose();
            } else {
                setError("Erro ao atualizar serviço");
            }
        } catch (err) {
            console.error("Erro ao atualizar serviço:", err);
            const errorMessage = err.response?.data?.message || err.message || "Erro ao atualizar serviço";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleAgendarOrcamento = () => {
        navigate('/agendamentos', { 
            state: { 
                tipo: 'orcamento',
                servicoId: servico.id,
                clienteNome: servico.clienteNome,
                servicoNome: servico.servicoNome
            }
        });
        onClose();
    };

    const handleAgendarServico = () => {
        navigate('/agendamentos', { 
            state: { 
                tipo: 'servico',
                servicoId: servico.id,
                clienteNome: servico.clienteNome,
                servicoNome: servico.servicoNome
            }
        });
        onClose();
    };

    const handleEditarAgendamento = (agendamento) => {
        setAgendamentoSelecionado(agendamento);
        setMostrarEditarAgendamento(true);
    };

    const handleAgendamentoEditadoSuccess = async () => {
        if (onSuccess) {
            await onSuccess(servico);
        }
        setMostrarEditarAgendamento(false);
        setAgendamentoSelecionado(null);
    };

    const mostrarBotaoAgendarOrcamento = () => {
        const etapaAtual = formData.etapa?.toUpperCase();
        console.log("Debug - Etapa atual:", etapaAtual, "| Modo edição:", modoEdicao);
        console.log("Debug - Servico completo:", servico);
        console.log("Debug - Mostrar botão orçamento:", etapaAtual === "PENDENTE" && !modoEdicao);
        return etapaAtual === "PENDENTE" && !modoEdicao;
    };

    const mostrarBotaoAgendarServico = () => {
        const etapaAtual = formData.etapa?.toUpperCase();
        console.log("Debug - Mostrar botão serviço:", etapaAtual === "ORÇAMENTO APROVADO" && !modoEdicao);
        return etapaAtual === "ORÇAMENTO APROVADO" && !modoEdicao;
    };

    if (!isOpen || !servico) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden">
                {/* Header Modernizado */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-xl">
                                <Wrench className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Pedido #{servico.id?.toString().padStart(3, "0")}
                                </h2>
                                <p className="text-blue-100 text-sm">
                                    {modoEdicao ? "Editando informações" : "Visualizando informações"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mx-6 mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                        <p className="text-red-800 font-medium">{error}</p>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6">
                        {/* Layout em 2 colunas */}
                        <div className="grid grid-cols-12 gap-6">
                            {/* Coluna Esquerda - Informações Principais */}
                            <div className="col-span-5 space-y-6">
                                {/* Resumo do Pedido */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Resumo do Pedido</h3>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600 font-medium">Valor Total:</span>
                                            <span className="text-xl font-bold text-green-600">
                                                R$ {servico?.valorTotal?.toFixed(2) || '0,00'}
                                            </span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600 font-medium">Forma de Pagamento:</span>
                                            <span className="text-gray-900 font-medium">
                                                {servico?.formaPagamento || 'A negociar'}
                                            </span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600 font-medium">Tipo:</span>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                {servico?.tipoPedido || 'Serviço'}
                                            </span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-gray-600 font-medium">Status:</span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                formData.status === 'Ativo' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {formData.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Cliente */}
                                {servico?.cliente && (
                                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <User className="w-5 h-5 text-green-600" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900">Cliente</h3>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <User className="w-4 h-4 text-gray-500" />
                                                <div>
                                                    <p className="font-semibold text-gray-900">{servico.cliente.nome}</p>
                                                    <p className="text-sm text-gray-600">CPF: {servico.cliente.cpf || 'Não informado'}</p>
                                                </div>
                                            </div>
                                            
                                            {servico.cliente.email && (
                                                <div className="flex items-center gap-3">
                                                    <Mail className="w-4 h-4 text-gray-500" />
                                                    <span className="text-gray-700">{servico.cliente.email}</span>
                                                </div>
                                            )}
                                            
                                            {servico.cliente.telefone && (
                                                <div className="flex items-center gap-3">
                                                    <Phone className="w-4 h-4 text-gray-500" />
                                                    <span className="text-gray-700">{servico.cliente.telefone}</span>
                                                </div>
                                            )}
                                            
                                            {/* Endereço compacto */}
                                            {servico.cliente.enderecos && servico.cliente.enderecos.length > 0 && (
                                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <MapPin className="w-4 h-4 text-gray-500" />
                                                        <span className="text-sm font-medium text-gray-700">Endereço</span>
                                                    </div>
                                                    {servico.cliente.enderecos.map((endereco, index) => (
                                                        <div key={index} className="text-sm text-gray-600">
                                                            <p>{endereco.rua}, {endereco.numero || 'S/N'}</p>
                                                            <p>{endereco.bairro}, {endereco.cidade} - {endereco.uf}</p>
                                                            <p>CEP: {endereco.cep}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Serviço */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Wrench className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Serviço</h3>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                                                value={servico?.servico?.nome || servico?.servicoNome || 'Serviço não especificado'}
                                                readOnly
                                            />
                                        </div>

                                        {servico?.servico && (
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                                                        value={servico.servico.codigo || 'Não informado'}
                                                        readOnly
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço Base</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                                                        value={`R$ ${servico.servico.precoBase?.toFixed(2) || '0,00'}`}
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                                            <textarea
                                                name="descricao"
                                                rows={3}
                                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg resize-none ${
                                                    modoEdicao ? "bg-white" : "bg-gray-50"
                                                }`}
                                                value={formData.descricao}
                                                onChange={handleChange}
                                                readOnly={!modoEdicao}
                                                placeholder="Descrição do serviço..."
                                            />
                                        </div>

                                        {/* Etapa e Progresso */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Etapa Atual</label>
                                            <select
                                                name="etapa"
                                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                                                    modoEdicao ? "bg-white" : "bg-gray-50"
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
                                        </div>

                                        {/* Barra de Progresso */}
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium text-gray-700">
                                                    Progresso do Serviço
                                                </span>
                                                <span className="text-sm font-bold text-blue-600">
                                                    {Math.round((formData.progressoValor / 7) * 100)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                                                    style={{
                                                        width: `${Math.min(100, (formData.progressoValor / 7) * 100)}%`,
                                                    }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Etapa {formData.progressoValor} de 7
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Coluna Direita - Agendamentos */}
                            <div className="col-span-7">
                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm h-full">
                                    <div className="p-6 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-orange-100 rounded-lg">
                                                    <Calendar className="w-5 h-5 text-orange-600" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Agendamentos
                                                    {servico?.servico?.agendamentos && (
                                                        <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                                                            {servico.servico.agendamentos.length}
                                                        </span>
                                                    )}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 max-h-[600px] overflow-y-auto">
                                        {servico?.servico?.agendamentos && servico.servico.agendamentos.length > 0 ? (
                                            <div className="space-y-4">
                                                {servico.servico.agendamentos.map((agendamento, index) => (
                                                    <div key={agendamento.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                                                        {/* Header do Agendamento */}
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                                                    agendamento.tipoAgendamento === 'ORCAMENTO' 
                                                                        ? 'bg-blue-100 text-blue-700'
                                                                        : 'bg-green-100 text-green-700'
                                                                }`}>
                                                                    {agendamento.tipoAgendamento === 'ORCAMENTO' ? 'Orçamento' : 'Execução'}
                                                                </span>
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
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-mono text-gray-500">
                                                                    #AG{agendamento.id.toString().padStart(3, '0')}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleEditarAgendamento(agendamento)}
                                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                    title="Editar agendamento"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Informações principais */}
                                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                                            <div className="bg-gray-50 rounded-lg p-3">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Calendar className="w-4 h-4 text-gray-500" />
                                                                    <span className="text-sm font-medium text-gray-700">Data</span>
                                                                </div>
                                                                <p className="text-gray-900 font-semibold">{agendamento.dataAgendamento}</p>
                                                            </div>
                                                            
                                                            <div className="bg-gray-50 rounded-lg p-3">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Clock className="w-4 h-4 text-gray-500" />
                                                                    <span className="text-sm font-medium text-gray-700">Horário</span>
                                                                </div>
                                                                <p className="text-gray-900 font-semibold">
                                                                    {agendamento.inicioAgendamento} - {agendamento.fimAgendamento}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Endereço do agendamento */}
                                                        {agendamento.endereco && (
                                                            <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <MapPin className="w-4 h-4 text-blue-600" />
                                                                    <span className="text-sm font-medium text-blue-800">Local do Agendamento</span>
                                                                </div>
                                                                <div className="text-sm text-blue-700">
                                                                    <p className="font-medium">
                                                                        {agendamento.endereco.rua}, {agendamento.endereco.numero || 'S/N'}
                                                                    </p>
                                                                    {agendamento.endereco.complemento && (
                                                                        <p>{agendamento.endereco.complemento}</p>
                                                                    )}
                                                                    <p>
                                                                        {agendamento.endereco.bairro}, {agendamento.endereco.cidade} - {agendamento.endereco.uf}
                                                                    </p>
                                                                    <p>CEP: {agendamento.endereco.cep} | {agendamento.endereco.pais}</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Observações */}
                                                        {agendamento.observacao && (
                                                            <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <FileText className="w-4 h-4 text-yellow-600" />
                                                                    <span className="text-sm font-medium text-yellow-800">Observações</span>
                                                                </div>
                                                                <p className="text-sm text-yellow-700">{agendamento.observacao}</p>
                                                            </div>
                                                        )}

                                                        {/* Funcionários */}
                                                        {agendamento.funcionarios && agendamento.funcionarios.length > 0 ? (
                                                            <div className="mb-4">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <Users className="w-4 h-4 text-gray-600" />
                                                                    <span className="text-sm font-medium text-gray-700">
                                                                        Equipe Designada ({agendamento.funcionarios.length})
                                                                    </span>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    {agendamento.funcionarios.map((funcionario) => (
                                                                        <div key={funcionario.id} className="bg-green-50 rounded-lg p-3">
                                                                            <div className="flex items-center justify-between">
                                                                                <div>
                                                                                    <p className="font-semibold text-green-800">{funcionario.nome}</p>
                                                                                    <p className="text-sm text-green-600">{funcionario.funcao}</p>
                                                                                </div>
                                                                                <div className="text-right text-sm text-green-600">
                                                                                    <p>{funcionario.telefone}</p>
                                                                                    <p className="text-xs">{funcionario.contrato}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="mb-4">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <Users className="w-4 h-4 text-gray-400" />
                                                                    <span className="text-sm text-gray-500">Nenhuma equipe designada</span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Produtos */}
                                                        {agendamento.produtos && agendamento.produtos.length > 0 ? (
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <Package className="w-4 h-4 text-gray-600" />
                                                                    <span className="text-sm font-medium text-gray-700">
                                                                        Produtos Utilizados ({agendamento.produtos.length})
                                                                    </span>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    {agendamento.produtos.map((item, prodIndex) => (
                                                                        <div key={prodIndex} className="bg-purple-50 rounded-lg p-3">
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex-1">
                                                                                    <p className="font-semibold text-purple-800">{item.produto.nome}</p>
                                                                                    <p className="text-sm text-purple-600">{item.produto.descricao}</p>
                                                                                    <p className="text-xs text-purple-500 mt-1">
                                                                                        Unidade: {item.produto.unidademedida}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="text-right ml-4">
                                                                                    <div className="text-sm text-purple-700">
                                                                                        <div className="flex justify-between gap-4">
                                                                                            <span>Reservado:</span>
                                                                                            <span className="font-medium">{item.quantidadeReservada}</span>
                                                                                        </div>
                                                                                        <div className="flex justify-between gap-4">
                                                                                            <span>Utilizado:</span>
                                                                                            <span className="font-medium">{item.quantidadeUtilizada}</span>
                                                                                        </div>
                                                                                        <div className="border-t border-purple-200 pt-1 mt-1">
                                                                                            <div className="flex justify-between gap-4">
                                                                                                <span>Preço:</span>
                                                                                                <span className="font-bold text-purple-800">
                                                                                                    R$ {item.produto.preco?.toFixed(2)}
                                                                                                </span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <Package className="w-4 h-4 text-gray-400" />
                                                                    <span className="text-sm text-gray-500">Nenhum produto definido</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                                <p className="text-gray-500 font-medium">Nenhum agendamento encontrado</p>
                                                <p className="text-gray-400 text-sm">Os agendamentos aparecerão aqui quando criados</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                            >
                                Fechar
                            </button>

                            {mostrarBotaoAgendarOrcamento() && (
                                <button
                                    onClick={handleAgendarOrcamento}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                                >
                                    <ClipboardList className="w-4 h-4" />
                                    Agendar Orçamento
                                </button>
                            )}

                            {mostrarBotaoAgendarServico() && (
                                <button
                                    onClick={handleAgendarServico}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
                                >
                                    <Calendar className="w-4 h-4" />
                                    Agendar Serviço
                                </button>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {modoEdicao ? (
                                <>
                                    <button
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
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 font-medium"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Salvar
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setModoEdicao(true)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                                >
                                    <Edit className="w-4 h-4" />
                                    Editar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Edição de Agendamento */}
            <EditarAgendamentoModal
                isOpen={mostrarEditarAgendamento}
                onClose={() => {
                    setMostrarEditarAgendamento(false);
                    setAgendamentoSelecionado(null);
                }}
                agendamento={agendamentoSelecionado}
                onSuccess={handleAgendamentoEditadoSuccess}
            />
        </div>
    );
};

export default EditarServicoModal;
