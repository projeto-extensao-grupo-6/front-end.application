import React, { useState, useEffect } from "react";
import { Wrench, X, Edit, Save, Calendar, ClipboardList, User, MapPin, Phone, Mail, FileText, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Api from "../../../axios/Api";
import PedidosService from "../../../services/pedidosService";
import EditarAgendamentoModal from "./EditarAgendamentoModal";

// Mantenha os valores EXATAMENTE iguais ao que está no banco de dados (nome da etapa)
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
    const [mostrarModalExcluirAgendamentos, setMostrarModalExcluirAgendamentos] = useState(false);
    const navigate = useNavigate();

    // Helper para classes dinâmicas
    const getInputClass = (isEditable) => {
        return `w-full px-3 py-2 border rounded-lg transition-all duration-300 ${
            isEditable 
                ? "bg-white border-gray-300 text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                : "bg-gray-100 border-transparent text-gray-500 cursor-not-allowed opacity-75"
        }`;
    };

    const getLockedClass = () => {
        return "w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed opacity-60";
    };

    // --- FUNÇÃO AUXILIAR APENAS PARA LEITURA (Encontrar opção no dropdown) ---
    // Remove acentos apenas para comparar strings de forma segura
    const limparTextoParaComparacao = (texto) => {
        if (!texto) return "";
        return texto
            .toUpperCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
            .replace(/ /g, "_"); // Troca espaços por _
    };

    // --- FUNÇÃO PARA CARREGAR: Tenta casar o que vem do back com o front ---
    const encontrarEtapaCorrespondente = (etapaDoBackend) => {
        if (!etapaDoBackend) return "PENDENTE";
        
        // Normaliza o que veio do backend para tentar achar na lista (defensivo)
        const backendLimpo = limparTextoParaComparacao(etapaDoBackend);

        // Procura na lista ETAPAS_SERVICO qual item tem estrutura similar
        const etapaEncontrada = ETAPAS_SERVICO.find(e => limparTextoParaComparacao(e.valor) === backendLimpo);
        
        // Se achou, retorna o valor exato da constante (com acentos), senão retorna o próprio valor do back ou PENDENTE
        return etapaEncontrada ? etapaEncontrada.valor : (etapaDoBackend || "PENDENTE");
    };

    useEffect(() => {
        if (isOpen && servico) {
            const rawEtapa = servico.etapaOriginal || servico.etapa || "PENDENTE";
            
            // Usa a função para achar o valor correto para o dropdown
            const etapaParaExibicao = encontrarEtapaCorrespondente(rawEtapa);
            
            // Achar o progresso baseado na etapa identificada
            const etapaInfo = ETAPAS_SERVICO.find(e => e.valor === etapaParaExibicao);

            setFormData({
                clienteNome: servico.clienteNome || "",
                data: servico.data || "",
                descricao: servico.descricao || "",
                status: servico.status || "Ativo",
                etapa: etapaParaExibicao,
                progressoValor: etapaInfo ? etapaInfo.progresso : (servico.progresso?.[0] || 1),
                progressoTotal: 7,
            });
            setEtapaAnterior(etapaParaExibicao);
            setModoEdicao(false);
            setError(null);
        }
    }, [isOpen, servico]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === "etapa") {
            const etapaInfo = ETAPAS_SERVICO.find(e => e.valor === value);
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
        const voltouParaPendente = etapaAnterior !== "PENDENTE" && formData.etapa === "PENDENTE";
        if (voltouParaPendente && servico?.servico?.agendamentos && servico.servico.agendamentos.length > 0) {
            setMostrarModalExcluirAgendamentos(true);
            return;
        }
        await salvarAlteracoes();
    };

    const salvarAlteracoes = async () => {
        setLoading(true);
        setError(null);

        try {
            const voltouParaPendente = etapaAnterior !== "PENDENTE" && formData.etapa === "PENDENTE";
            
            if (voltouParaPendente && servico?.servico?.agendamentos && servico.servico.agendamentos.length > 0) {
                console.log("🗑️ Excluindo agendamentos devido ao downgrade para PENDENTE...");
                const promisesExclusao = servico.servico.agendamentos.map(agendamento => 
                    Api.delete(`/agendamentos/${agendamento.id}`)
                );
                await Promise.all(promisesExclusao);
            }

            // CORREÇÃO: Envia a etapa EXATAMENTE como está no formData (com acentos e espaços)
            // O Backend espera "ANÁLISE DO ORÇAMENTO", não "ANALISE_DO_ORCAMENTO"
            const etapaParaBackend = formData.etapa;

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
                    id: servico.servico?.id, 
                    nome: servico.servicoNome || servico.servico?.nome || "Serviço",
                    descricao: formData.descricao || "",
                    precoBase: servico.servico?.precoBase || 0.00,
                    ativo: true,
                    etapa: {
                        tipo: "PEDIDO", 
                        nome: etapaParaBackend // Enviando COM acento e espaço, igual ao banco
                    }
                }
            };

            console.log('📤 Enviando para backend:', etapaParaBackend);
            const response = await Api.put(`/pedidos/${servico.id}`, pedidoData);
            
            if (response.status === 200 || response.status === 204) {
                if (onSuccess) {
                    onSuccess({
                        ...servico,
                        descricao: formData.descricao,
                        status: formData.status,
                        etapa: formData.etapa, 
                        etapaOriginal: etapaParaBackend,
                        progresso: [parseInt(formData.progressoValor), 7],
                    });
                }
                setEtapaAnterior(formData.etapa);
                setMostrarModalExcluirAgendamentos(false);
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

    const confirmarExclusaoAgendamentos = async () => {
        await salvarAlteracoes();
    };

    const cancelarExclusaoAgendamentos = () => {
        setMostrarModalExcluirAgendamentos(false);
        setLoading(false);
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
        try {
            // 1️⃣ Primeiro: Recarrega os dados do backend
            const result = await PedidosService.buscarPorId(servico.id);
            if (!result.success) {
                console.error("❌ Erro ao recarregar dados:", result.error);
                return;
            }

            const servicoAtualizado = PedidosService.mapearParaFrontend(result.data);
            
            // 2️⃣ Normaliza a etapa que veio do backend
            const etapaRawDoBackend = servicoAtualizado.etapaOriginal || servicoAtualizado.etapa || "PENDENTE";
            const etapaCalculada = encontrarEtapaCorrespondente(etapaRawDoBackend);
            
            // 3️⃣ Pega a etapa ORIGINAL que veio no objeto servico (antes de qualquer mudança)
            const etapaOriginalRaw = servico.etapaOriginal || servico.etapa || "PENDENTE";
            const etapaAtualFrontend = encontrarEtapaCorrespondente(etapaOriginalRaw);
            
            console.log(`📊 Comparação de Etapas:`);
            console.log(`   Etapa Anterior (estado): "${etapaAnterior}"`);
            console.log(`   Etapa Atual (props): "${etapaAtualFrontend}"`);
            console.log(`   Etapa Nova (backend): "${etapaCalculada}"`);
            console.log(`   Etapa Raw Backend: "${etapaRawDoBackend}"`);
            
            // 4️⃣ Verifica se houve mudança de etapa
            const houveAlteracaoDeEtapa = etapaCalculada !== etapaAnterior;
            
            if (houveAlteracaoDeEtapa) {
                console.log(`🔄 Etapa mudou de "${etapaAnterior}" para "${etapaCalculada}"`);
                
                // 5️⃣ Atualiza a etapa no backend se necessário
                const etapaParaBackend = etapaCalculada;
                
                const pedidoData = {
                    pedido: {
                        valorTotal: servicoAtualizado.valorTotal || 0.00,
                        ativo: servicoAtualizado.status === "Ativo",
                        formaPagamento: servicoAtualizado.formaPagamento || "A negociar",
                        observacao: servicoAtualizado.descricao || "",
                        cliente: {
                            id: servicoAtualizado.clienteId || servicoAtualizado.clienteInfo?.id,
                            nome: servicoAtualizado.clienteNome || servicoAtualizado.clienteInfo?.nome || "",
                            cpf: servicoAtualizado.clienteInfo?.cpf || "",
                            email: servicoAtualizado.clienteInfo?.email || "",
                            telefone: servicoAtualizado.clienteInfo?.telefone || "",
                            status: "Ativo",
                            enderecos: servicoAtualizado.clienteInfo?.endereco ? [{
                                id: servicoAtualizado.clienteInfo.endereco.id || 0,
                                rua: servicoAtualizado.clienteInfo.endereco.rua || "",
                                complemento: servicoAtualizado.clienteInfo.endereco.complemento || "",
                                cep: servicoAtualizado.clienteInfo.endereco.cep || "",
                                cidade: servicoAtualizado.clienteInfo.endereco.cidade || "",
                                bairro: servicoAtualizado.clienteInfo.endereco.bairro || "",
                                uf: servicoAtualizado.clienteInfo.endereco.uf || "",
                                pais: servicoAtualizado.clienteInfo.endereco.pais || "Brasil",
                                numero: servicoAtualizado.clienteInfo.endereco.numero || 0
                            }] : [],
                        },
                        status: {
                            tipo: "PEDIDO",
                            nome: servicoAtualizado.status.toUpperCase()
                        }
                    },
                    servico: {
                        id: servico.servico?.id,
                        nome: servicoAtualizado.servicoNome || servicoAtualizado.servico?.nome || "Serviço",
                        descricao: servicoAtualizado.descricao || "",
                        precoBase: servicoAtualizado.servico?.precoBase || 0.00,
                        ativo: true,
                        etapa: {
                            tipo: "PEDIDO",
                            nome: etapaParaBackend
                        }
                    }
                };
                
                console.log(`📤 Atualizando etapa no backend para: "${etapaParaBackend}"`);
                await Api.put(`/pedidos/${servico.id}`, pedidoData);
                console.log("✅ Etapa atualizada no backend com sucesso");
            } else {
                console.log(`ℹ️ Etapa não mudou, mantendo: "${etapaCalculada}"`);
            }
            
            // 6️⃣ SEMPRE recarrega os dados finais do backend após qualquer operação
            const resultFinal = await PedidosService.buscarPorId(servico.id);
            if (resultFinal.success) {
                const servicoFinal = PedidosService.mapearParaFrontend(resultFinal.data);
                const etapaFinalRaw = servicoFinal.etapaOriginal || servicoFinal.etapa || "PENDENTE";
                const etapaFinal = encontrarEtapaCorrespondente(etapaFinalRaw);
                
                const etapaInfo = ETAPAS_SERVICO.find(e => e.valor === etapaFinal);
                
                console.log(`✅ Dados finais carregados. Etapa: "${etapaFinal}"`);
                
                // 7️⃣ Atualiza o estado local
                setFormData({
                    clienteNome: servicoFinal.clienteNome || "",
                    data: servicoFinal.data || "",
                    descricao: servicoFinal.descricao || "",
                    status: servicoFinal.status || "Ativo",
                    etapa: etapaFinal,
                    progressoValor: etapaInfo ? etapaInfo.progresso : (servicoFinal.progresso?.[0] || 1),
                    progressoTotal: 7,
                });
                setEtapaAnterior(etapaFinal);
                
                // 8️⃣ Notifica o componente pai
                if (onSuccess) {
                    await onSuccess({
                        ...servicoFinal,
                        etapa: etapaFinal,
                        etapaOriginal: etapaFinalRaw
                    });
                }
            }
            
            // 9️⃣ Fecha os modais
            setMostrarEditarAgendamento(false);
            setAgendamentoSelecionado(null);
            
        } catch (error) {
            console.error("❌ Erro ao recarregar dados:", error);
            setError("Erro ao atualizar informações. Recarregue a página.");
        }
    };

    const mostrarBotaoAgendarOrcamento = () => {
        const etapaAtual = formData.etapa?.toUpperCase();
        return etapaAtual === "PENDENTE" && !modoEdicao;
    };

    const mostrarBotaoAgendarServico = () => {
        const etapaAtual = formData.etapa?.toUpperCase();
        return etapaAtual === "ORÇAMENTO APROVADO" && !modoEdicao;
    };

    if (!isOpen || !servico) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
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
                                        {/* Campos Read-Only permanentes */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                                            <input
                                                type="text"
                                                className={getLockedClass()}
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
                                                        className={getLockedClass()}
                                                        value={servico.servico.codigo || 'Não informado'}
                                                        readOnly
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço Base</label>
                                                    <input
                                                        type="text"
                                                        className={getLockedClass()}
                                                        value={`R$ ${servico.servico.precoBase?.toFixed(2) || '0,00'}`}
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Campos Editáveis */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                                            <textarea
                                                name="descricao"
                                                rows={3}
                                                className={getInputClass(modoEdicao) + " resize-none"}
                                                value={formData.descricao}
                                                onChange={handleChange}
                                                readOnly={!modoEdicao}
                                                placeholder="Descrição do serviço..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Etapa Atual</label>
                                            <select
                                                name="etapa"
                                                className={getInputClass(modoEdicao)}
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
                                                                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${
                                                                    agendamento.statusAgendamento?.nome === 'PENDENTE'
                                                                        ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                                                                        : agendamento.statusAgendamento?.nome === 'EM ANDAMENTO'
                                                                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                                                                        : agendamento.statusAgendamento?.nome === 'CONCLUÍDO'
                                                                        ? 'bg-green-100 text-green-700 border-green-300'
                                                                        : 'bg-gray-100 text-gray-700 border-gray-300'
                                                                }`}>
                                                                    {agendamento.statusAgendamento?.nome === 'PENDENTE' && '🟡 '}
                                                                    {agendamento.statusAgendamento?.nome === 'EM ANDAMENTO' && '🔵 '}
                                                                    {agendamento.statusAgendamento?.nome === 'CONCLUÍDO' && '🟢 '}
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
                                            // Normaliza na mão para cancelar (reseta estado)
                                            const rawEtapa = servico.etapaOriginal || servico.etapa || "PENDENTE";
                                            const etapaNormalizada = encontrarEtapaCorrespondente(rawEtapa);

                                            setFormData({
                                                clienteNome: servico.clienteNome || "",
                                                data: servico.data || "",
                                                descricao: servico.descricao || "",
                                                status: servico.status || "Ativo",
                                                etapa: etapaNormalizada,
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

            {/* Modais de Suporte (Agendamento e Exclusão) */}
            <EditarAgendamentoModal
                isOpen={mostrarEditarAgendamento}
                onClose={() => {
                    setMostrarEditarAgendamento(false);
                    setAgendamentoSelecionado(null);
                }}
                agendamento={agendamentoSelecionado}
                onSuccess={handleAgendamentoEditadoSuccess}
            />

            {mostrarModalExcluirAgendamentos && (
                <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/40 px-4 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) cancelarExclusaoAgendamentos(); }}>
                    <div className="flex flex-col gap-4 w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 animate-scaleIn">
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                                <Calendar className="w-8 h-8 text-amber-500" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Excluir Todos os Agendamentos?</h2>
                            <div className="text-slate-600 space-y-2">
                                <p className="font-medium">
                                    ⚠️ Ao voltar para a etapa <span className="font-bold text-amber-600">PENDENTE</span>, todos os agendamentos vinculados a este serviço serão <span className="font-bold text-red-600">EXCLUÍDOS PERMANENTEMENTE</span>.
                                </p>
                                <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded text-left mt-3">
                                    <p className="text-sm text-amber-800 font-medium">
                                        📋 Agendamentos que serão excluídos:
                                    </p>
                                    <ul className="mt-2 space-y-1 text-sm text-amber-700">
                                        {servico?.servico?.agendamentos?.map((ag) => (
                                            <li key={ag.id} className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                                                <span className="font-mono">#AG{ag.id.toString().padStart(3, '0')}</span>
                                                <span>-</span>
                                                <span>{ag.tipoAgendamento === 'ORCAMENTO' ? '📊 Orçamento' : '🔧 Execução'}</span>
                                                <span>-</span>
                                                <span>{ag.dataAgendamento}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <p className="text-sm text-red-600 font-semibold mt-3">
                                    ⚠️ Esta ação NÃO pode ser desfeita!
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-3">
                            <button 
                                onClick={cancelarExclusaoAgendamentos} 
                                disabled={loading}
                                className="flex-1 h-11 rounded-lg border-2 border-slate-300 bg-white text-slate-700 font-semibold cursor-pointer hover:bg-slate-50 disabled:opacity-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmarExclusaoAgendamentos} 
                                disabled={loading}
                                className="flex-1 h-11 rounded-lg bg-red-600 text-white font-semibold cursor-pointer hover:bg-red-700 shadow-md disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Excluindo...
                                    </>
                                ) : (
                                    <>
                                        Sim, Excluir Todos
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditarServicoModal;