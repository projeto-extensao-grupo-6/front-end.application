import React, { useState, useEffect } from "react";
import { Briefcase, ChevronDown, Plus, AlertCircle, User, MapPin, Settings } from "lucide-react";
import Api from "../../../axios/Api";
import { cpfMask, phoneMask, onlyLetters, cepMask } from "../../../utils/masks";

const usePedidoServicoAPI = () => {
    const cadastrarCliente = async (clienteData) => {
        try {
            const response = await Api.post(`/clientes`, {
                nome: clienteData.nome,
                cpf: clienteData.cpf,
                email: clienteData.email,
                telefone: clienteData.telefone.replace(/\D/g, ""),
                status: "Ativo",
                enderecos: clienteData.enderecos || [],
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Erro ao cadastrar cliente");
        }
    };

    const salvarServico = async (servicoData) => {
        try {
            const response = await Api.post(`/pedidos`, servicoData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Erro ao salvar serviço");
        }
    };

    const buscarClientes = async () => {
        try {
            const response = await Api.get(`/clientes`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Erro ao buscar clientes");
        }
    };

    const buscarServicos = async () => {
        try {
            const response = await Api.get(`/servicos`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Erro ao buscar serviços");
        }
    };

    return { cadastrarCliente, salvarServico, buscarClientes, buscarServicos };
};

const DEFAULT_FORM_DATA = {
    // Etapa 1 - Cliente
    tipoCliente: "nenhum",
    clienteId: "",
    clienteNome: "",
    clienteCpf: "",
    clienteEmail: "",
    clienteTelefone: "",

    // Etapa 2 - Endereço
    endereco: {
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
    },

    // Etapa 3 - Dados do Serviço
    servicos: [],
    observacoes: "",
    etapa: "PENDENTE", // Sempre PENDENTE por padrão
    prioridade: "Normal",
};

const NovoPedidoServicoModal = ({ isOpen, onClose, onSuccess }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [clientesExistentes, setClientesExistentes] = useState([]);
    const [servicosDisponiveis, setServicosDisponiveis] = useState([]);

    const { cadastrarCliente, salvarServico, buscarClientes, buscarServicos } = usePedidoServicoAPI();

    const steps = [
        { id: 0, name: "Cliente" },
        { id: 1, name: "Endereço" },
        { id: 2, name: "Serviços" },
        { id: 3, name: "Revisão" },
    ];

    const etapasServico = [
        "PENDENTE",
        "AGUARDANDO ORÇAMENTO",
        "ANÁLISE DO ORÇAMENTO",
        "ORÇAMENTO APROVADO",
        "SERVIÇO AGENDADO",
        "SERVIÇO EM EXECUÇÃO",
        "CONCLUÍDO"
    ];

    useEffect(() => {
        if (isOpen) {
            setFormData(DEFAULT_FORM_DATA);
            setCurrentStep(0);
            setError(null);
            carregarDados();
        }
    }, [isOpen]);

    const carregarDados = async () => {
        // Verificar se existe token antes de fazer as chamadas
        const token = sessionStorage.getItem("accessToken");
        if (!token) {
            console.warn("Token não encontrado, pulando carregamento de dados");
            return;
        }

        try {
            const clientes = await buscarClientes();
            setClientesExistentes(Array.isArray(clientes) ? clientes : []);

            // Remover a chamada para buscarServicos() pois não é necessária
            // Os serviços são criados manualmente no formulário
            setServicosDisponiveis([]);
        } catch (err) {
            console.error("Erro ao carregar dados:", err);
            setClientesExistentes([]);
            setServicosDisponiveis([]);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let maskedValue = value;

        if (name === "clienteCpf") {
            maskedValue = cpfMask(value);
        } else if (name === "clienteTelefone") {
            maskedValue = phoneMask(value);
        } else if (name === "clienteNome") {
            maskedValue = onlyLetters(value);
        }

        setFormData((prev) => ({
            ...prev,
            [name]: maskedValue,
        }));
        setError(null);
    };

    const handleEnderecoChange = (e) => {
        const { name, value } = e.target;
        let maskedValue = value;

        if (name === "cep") {
            maskedValue = cepMask(value);
        }

        setFormData((prev) => ({
            ...prev,
            endereco: {
                ...prev.endereco,
                [name]: maskedValue,
            },
        }));
        setError(null);
    };

    const handleTipoClienteChange = (tipo) => {
        setFormData((prev) => ({
            ...prev,
            tipoCliente: tipo,
            clienteId: "",
            clienteNome: "",
            clienteCpf: "",
            clienteEmail: "",
            clienteTelefone: "",
        }));
        setError(null);
    };

    const handleClienteExistenteChange = (e) => {
        const clienteId = e.target.value;
        const clienteSelecionado = clientesExistentes.find(
            (c) => String(c.id) === String(clienteId)
        );

        if (clienteSelecionado) {
            setFormData((prev) => ({
                ...prev,
                clienteId: clienteSelecionado.id,
                clienteNome: clienteSelecionado.nome,
                clienteCpf: clienteSelecionado.cpf || "",
                clienteEmail: clienteSelecionado.email || "",
                clienteTelefone: clienteSelecionado.telefone || "",
                // Se cliente tem endereços, usar o primeiro
                endereco: clienteSelecionado.enderecos && clienteSelecionado.enderecos.length > 0 
                    ? clienteSelecionado.enderecos[0] 
                    : prev.endereco
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                clienteId: "",
                clienteNome: "",
            }));
        }
        setError(null);
    };

    const handleAddServico = () => {
        setFormData((prev) => ({
            ...prev,
            servicos: [
                ...prev.servicos,
                { 
                    servicoId: "", 
                    nome: "", 
                    descricao: "",
                    precoEstimado: 0,
                    observacoes: ""
                }
            ],
        }));
    };

    const handleRemoveServico = (index) => {
        setFormData((prev) => ({
            ...prev,
            servicos: prev.servicos.filter((_, i) => i !== index),
        }));
    };

    const handleServicoChange = (index, field, value) => {
        setFormData((prev) => {
            const novosServicos = [...prev.servicos];
            
            if (field === "servicoId") {
                const servicoSelecionado = servicosDisponiveis.find(
                    (servico) => String(servico.id) === String(value)
                );
                
                if (servicoSelecionado) {
                    novosServicos[index] = {
                        ...novosServicos[index],
                        servicoId: servicoSelecionado.id,
                        nome: servicoSelecionado.nome,
                        descricao: servicoSelecionado.descricao || "",
                        precoEstimado: servicoSelecionado.precoBase || 0,
                    };
                }
            } else {
                novosServicos[index] = {
                    ...novosServicos[index],
                    [field]: value
                };
            }

            return { ...prev, servicos: novosServicos };
        });
    };

    const calcularValorTotal = () => {
        return formData.servicos.reduce((total, servico) => total + (servico.precoEstimado || 0), 0);
    };

    const validateStep = () => {
        setError(null);

        if (currentStep === 0) {
            if (formData.tipoCliente === "existente" && !formData.clienteId) {
                setError("Selecione um cliente");
                return false;
            }
            if (formData.tipoCliente === "novo") {
                if (!formData.clienteNome.trim()) {
                    setError("Nome do cliente é obrigatório");
                    return false;
                }
                if (!formData.clienteTelefone.trim()) {
                    setError("Telefone do cliente é obrigatório");
                    return false;
                }
            }
            if (formData.tipoCliente === "nenhum" && !formData.clienteNome.trim()) {
                setError("Nome para identificação é obrigatório");
                return false;
            }
        }

        if (currentStep === 1) {
            if (!formData.endereco.logradouro.trim()) {
                setError("Endereço é obrigatório");
                return false;
            }
            if (!formData.endereco.cidade.trim()) {
                setError("Cidade é obrigatória");
                return false;
            }
        }

        if (currentStep === 2) {
            if (formData.servicos.length === 0) {
                setError("Adicione pelo menos um serviço");
                return false;
            }
            
            for (let i = 0; i < formData.servicos.length; i++) {
                const servico = formData.servicos[i];
                if (!servico.nome.trim()) {
                    setError(`Nome do serviço é obrigatório na linha ${i + 1}`);
                    return false;
                }
            }
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateStep()) return;

        setLoading(true);
        setError(null);

        try {
            let clienteId = formData.clienteId;
            let clienteData = null;

            // Se for cliente novo, cadastrar primeiro e obter o ID
            if (formData.tipoCliente === "novo") {
                const novoCliente = await cadastrarCliente({
                    nome: formData.clienteNome,
                    cpf: formData.clienteCpf,
                    email: formData.clienteEmail,
                    telefone: formData.clienteTelefone,
                    enderecos: [{
                        rua: formData.endereco.logradouro || "",
                        complemento: formData.endereco.complemento || "",
                        cep: formData.endereco.cep || "",
                        cidade: formData.endereco.cidade || "",
                        bairro: formData.endereco.bairro || "",
                        uf: formData.endereco.estado || "",
                        pais: "Brasil",
                        numero: parseInt(formData.endereco.numero) || 0
                    }]
                });
                
                clienteId = novoCliente.id;
                clienteData = {
                    id: novoCliente.id,
                    nome: novoCliente.nome,
                    cpf: novoCliente.cpf || "",
                    email: novoCliente.email || "",
                    telefone: novoCliente.telefone || "",
                    status: novoCliente.status || "Ativo",
                    enderecos: novoCliente.enderecos || [{
                        id: 0,
                        rua: formData.endereco.logradouro || "",
                        complemento: formData.endereco.complemento || "",
                        cep: formData.endereco.cep || "",
                        cidade: formData.endereco.cidade || "",
                        bairro: formData.endereco.bairro || "",
                        uf: formData.endereco.estado || "",
                        pais: "Brasil",
                        numero: parseInt(formData.endereco.numero) || 0
                    }]
                };
            } else if (formData.tipoCliente === "existente") {
                // Buscar dados completos do cliente selecionado
                const clienteSelecionado = clientesExistentes.find(
                    (c) => String(c.id) === String(formData.clienteId)
                );
                
                if (clienteSelecionado) {
                    clienteData = {
                        id: clienteSelecionado.id,
                        nome: clienteSelecionado.nome,
                        cpf: clienteSelecionado.cpf || "",
                        email: clienteSelecionado.email || "",
                        telefone: clienteSelecionado.telefone || "",
                        status: clienteSelecionado.status || "Ativo",
                        enderecos: clienteSelecionado.enderecos || [{
                            id: 0,
                            rua: formData.endereco.logradouro || "",
                            complemento: formData.endereco.complemento || "",
                            cep: formData.endereco.cep || "",
                            cidade: formData.endereco.cidade || "",
                            bairro: formData.endereco.bairro || "",
                            uf: formData.endereco.estado || "",
                            pais: "Brasil",
                            numero: parseInt(formData.endereco.numero) || 0
                        }]
                    };
                }
            }

            // Preparar dados do pedido de serviço no formato correto
            const pedidoData = {
                pedido: {
                    valorTotal: calcularValorTotal(),
                    ativo: true,
                    formaPagamento: "A negociar",
                    observacao: formData.observacoes || "",
                    cliente: clienteData,
                    status: {
                        tipo: "PEDIDO",
                        nome: "ATIVO"
                    }
                },
                servico: {
                    nome: formData.servicos.length > 0 ? formData.servicos[0].nome : "Serviço personalizado",
                    descricao: formData.servicos.map(s => s.descricao || s.nome).join("; ") || formData.observacoes || "",
                    precoBase: calcularValorTotal(),
                    ativo: true,
                    etapa: {
                        tipo: "PEDIDO",
                        nome: formData.etapa
                    }
                }
            };

            const pedidoSalvo = await salvarServico(pedidoData);

            if (onSuccess) {
                onSuccess(pedidoSalvo);
            }
            onClose();
        } catch (err) {
            setError(err.message || "Erro ao salvar pedido de serviço");
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (validateStep()) {
            setCurrentStep(currentStep + 1);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start z-9999 px-10 py-20 overflow-y-auto" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[10000vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center px-8 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#eeeeee] p-2.5 rounded-lg">
                            <Briefcase className="w-6 h-6 text-[#828282]" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Novo Pedido de Serviço</h2>
                    </div>
                </div>

                {/* Stepper */}
                <div className="px-8 pt-6 pb-4">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center flex-1 gap-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                                        index <= currentStep ? "bg-[#007EA7] text-white shadow-md" : "bg-gray-200 text-gray-500"
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <span className={`text-sm mt-2 text-center ${
                                        index <= currentStep ? "text-gray-900 font-semibold" : "text-gray-500 font-medium"
                                    }`}>
                                        {step.name}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`flex-1 h-1 mb-6 mx-3 rounded-full ${
                                        index < currentStep ? "bg-[#007EA7]" : "bg-gray-200"
                                    }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Error Alert */}
                <div className="flex justify-center w-full px-8">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 mb-4">
                            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-red-800">Erro</p>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Conteúdo */}
                <div className="flex flex-col px-8 py-4">
                    {/* Etapa 0 - Cliente */}
                    {currentStep === 0 && (
                        <div className="flex flex-col gap-4">
                            <div className="text-left">
                                <h3 className="text-base font-semibold text-gray-900">Cliente</h3>
                                <p className="text-md text-gray-500 mt-1">Informações do cliente para o serviço</p>
                            </div>

                            <div className="flex gap-10">
                                <button
                                    type="button"
                                    onClick={() => handleTipoClienteChange("existente")}
                                    className={`px-10 py-5 rounded-md border transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md ${
                                        formData.tipoCliente === "existente" ? "border-[#007EA7] bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"
                                    }`}
                                >
                                    <User className="w-5 h-5 mx-auto mb-1 text-[#007EA7]" />
                                    <p className="text-md font-semibold text-gray-900">Cliente Existente</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleTipoClienteChange("novo")}
                                    className={`px-10 py-5 rounded-md border transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md ${
                                        formData.tipoCliente === "novo" ? "border-[#007EA7] bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"
                                    }`}
                                >
                                    <Plus className="w-5 h-5 mx-auto mb-1 text-[#007EA7]" />
                                    <p className="text-md font-semibold text-gray-900">Cadastrar Novo</p>
                                </button>
                            </div>

                            {formData.tipoCliente === "existente" && (
                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">Selecionar Cliente</label>
                                    <div className="relative">
                                        <select
                                            name="clienteId"
                                            className="w-full border border-gray-300 rounded-md px-4 py-3 text-left z-10 appearance-none shadow-sm cursor-pointer"
                                            value={formData.clienteId}
                                            onChange={handleClienteExistenteChange}
                                        >
                                            <option value="">Selecione um cliente...</option>
                                            {clientesExistentes.map((cliente) => (
                                                <option key={cliente.id} value={String(cliente.id)}>
                                                    {cliente.nome}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 z-10 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            )}

                            {formData.tipoCliente === "novo" && (
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col gap-1">
                                        <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">
                                            Nome Completo <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="clienteNome"
                                            placeholder="Digite o nome do cliente"
                                            className="w-full border border-gray-300 rounded-md px-4 py-3"
                                            value={formData.clienteNome}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">CPF</label>
                                            <input
                                                type="text"
                                                name="clienteCpf"
                                                placeholder="000.000.000-00"
                                                maxLength={14}
                                                className="w-full border border-gray-300 rounded-md px-4 py-3 text-left"
                                                value={formData.clienteCpf}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">
                                                Telefone <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="clienteTelefone"
                                                placeholder="(00) 00000-0000"
                                                maxLength={15}
                                                className="w-full border border-gray-300 rounded-md px-4 py-3 text-left"
                                                value={formData.clienteTelefone}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">E-mail</label>
                                        <input
                                            type="email"
                                            name="clienteEmail"
                                            placeholder="cliente@email.com"
                                            className="w-full border border-gray-300 rounded-md px-4 py-3"
                                            value={formData.clienteEmail}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Etapa 1 - Endereço */}
                    {currentStep === 1 && (
                        <div className="flex flex-col gap-4">
                            <div className="text-left">
                                <h3 className="text-base font-semibold text-gray-900">Endereço do Serviço</h3>
                                <p className="text-md text-gray-500 mt-1">Onde o serviço será executado</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">CEP</label>
                                    <input
                                        type="text"
                                        name="cep"
                                        placeholder="00000-000"
                                        maxLength={9}
                                        className="w-full border border-gray-300 rounded-md px-4 py-3"
                                        value={formData.endereco.cep}
                                        onChange={handleEnderecoChange}
                                    />
                                </div>
                                
                                <div className="flex flex-col gap-1 col-span-2">
                                    <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">
                                        Logradouro <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="logradouro"
                                        placeholder="Rua, Avenida, etc."
                                        className="w-full border border-gray-300 rounded-md px-4 py-3"
                                        value={formData.endereco.logradouro}
                                        onChange={handleEnderecoChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">Número</label>
                                    <input
                                        type="text"
                                        name="numero"
                                        placeholder="123"
                                        className="w-full border border-gray-300 rounded-md px-4 py-3"
                                        value={formData.endereco.numero}
                                        onChange={handleEnderecoChange}
                                    />
                                </div>
                                
                                <div className="flex flex-col gap-1 col-span-2">
                                    <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">Complemento</label>
                                    <input
                                        type="text"
                                        name="complemento"
                                        placeholder="Apartamento, Bloco, etc."
                                        className="w-full border border-gray-300 rounded-md px-4 py-3"
                                        value={formData.endereco.complemento}
                                        onChange={handleEnderecoChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">Bairro</label>
                                    <input
                                        type="text"
                                        name="bairro"
                                        placeholder="Centro, Vila Nova, etc."
                                        className="w-full border border-gray-300 rounded-md px-4 py-3"
                                        value={formData.endereco.bairro}
                                        onChange={handleEnderecoChange}
                                    />
                                </div>
                                
                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">
                                        Cidade <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="cidade"
                                        placeholder="São Paulo"
                                        className="w-full border border-gray-300 rounded-md px-4 py-3"
                                        value={formData.endereco.cidade}
                                        onChange={handleEnderecoChange}
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">Estado</label>
                                    <input
                                        type="text"
                                        name="estado"
                                        placeholder="SP"
                                        maxLength={2}
                                        className="w-full border border-gray-300 rounded-md px-4 py-3"
                                        value={formData.endereco.estado}
                                        onChange={handleEnderecoChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Etapa 2 - Dados do Serviço */}
                    {currentStep === 2 && (
                        <div className="flex flex-col gap-4">
                            <div className="text-left">
                                <h3 className="text-base font-semibold text-gray-900">Dados do Serviço</h3>
                                <p className="text-md text-gray-500 mt-1">Configure os detalhes do serviço</p>
                            </div>

                            {/* Serviços */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-md font-semibold text-gray-900">Serviços</h4>
                                    <button
                                        type="button"
                                        onClick={handleAddServico}
                                        className="px-4 py-2 bg-[#007EA7] text-sm text-white rounded-md cursor-pointer hover:bg-[#006891] transition-colors flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Adicionar Serviço
                                    </button>
                                </div>

                                {formData.servicos.length === 0 ? (
                                    <div className="flex gap-2 items-center justify-center py-4 bg-gray-50 rounded-md border-2 border-dashed border-gray-300">
                                        <Settings className="w-8 h-8 mx-auto text-gray-400 mb-3" />
                                        <p className="text-gray-600 font-semibold">Nenhum serviço adicionado</p>
                                    </div>
                                ) : (
                                    formData.servicos.map((servico, index) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded-md border">
                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div className="flex flex-col gap-1">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Nome do Serviço <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ex: Instalação elétrica"
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                        value={servico.nome}
                                                        onChange={(e) => handleServicoChange(index, "nome", e.target.value)}
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço Estimado</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        placeholder="0.00"
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                        value={servico.precoEstimado}
                                                        onChange={(e) => handleServicoChange(index, "precoEstimado", parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1 mb-3">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                                <textarea
                                                    placeholder="Descrição detalhada do serviço..."
                                                    rows={2}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none"
                                                    value={servico.descricao}
                                                    onChange={(e) => handleServicoChange(index, "descricao", e.target.value)}
                                                />
                                            </div>

                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveServico(index)}
                                                    className="px-3 py-1 text-red-500 hover:bg-red-50 rounded-md transition-colors text-sm"
                                                >
                                                    Remover
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Configurações gerais */}
                            <div className="flex flex-col gap-1">
                                <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">Observações Gerais</label>
                                <textarea
                                    name="observacoes"
                                    placeholder="Observações adicionais sobre o pedido de serviço..."
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-md px-4 py-3 resize-none"
                                    value={formData.observacoes}
                                    onChange={handleChange}
                                />
                            </div>

                            {formData.servicos.length > 0 && (
                                <div className="bg-gray-50 rounded-lg p-4 border">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-900">Valor Total Estimado:</span>
                                        <span className="text-2xl font-bold text-[#007EA7]">
                                            R$ {calcularValorTotal().toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Etapa 3 - Revisão */}
                    {currentStep === 3 && (
                        <div className="flex flex-col gap-3">
                            <div className="text-left">
                                <h3 className="text-base font-semibold text-gray-900">Revisão do Pedido de Serviço</h3>
                                <p className="text-md text-gray-500 mt-1">Confirme as informações antes de salvar</p>
                            </div>

                            {/* Cliente */}
                            <div className="bg-gray-50 rounded-md p-4 border">
                                <div className="flex items-center gap-2 mb-3">
                                    <User className="w-5 h-5 text-[#007EA7]" />
                                    <h4 className="font-semibold text-gray-900">Cliente</h4>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <p><span className="text-gray-600">Nome:</span> <span className="font-medium">{formData.clienteNome}</span></p>
                                    {formData.clienteTelefone && (
                                        <p><span className="text-gray-600">Telefone:</span> <span className="font-medium">{formData.clienteTelefone}</span></p>
                                    )}
                                </div>
                            </div>

                            {/* Endereço */}
                            <div className="bg-gray-50 rounded-md p-4 border">
                                <div className="flex items-center gap-2 mb-3">
                                    <MapPin className="w-5 h-5 text-[#007EA7]" />
                                    <h4 className="font-semibold text-gray-900">Endereço</h4>
                                </div>
                                <p className="text-gray-900">
                                    {formData.endereco.logradouro}
                                    {formData.endereco.numero && `, ${formData.endereco.numero}`}
                                    {formData.endereco.complemento && ` - ${formData.endereco.complemento}`}
                                    <br />
                                    {formData.endereco.bairro && `${formData.endereco.bairro}, `}
                                    {formData.endereco.cidade}
                                    {formData.endereco.estado && ` - ${formData.endereco.estado}`}
                                    {formData.endereco.cep && ` - ${formData.endereco.cep}`}
                                </p>
                            </div>

                            {/* Serviços */}
                            <div className="bg-gray-50 rounded-md p-4 border">
                                <div className="flex items-center gap-2 mb-3">
                                    <Settings className="w-5 h-5 text-[#007EA7]" />
                                    <h4 className="font-semibold text-gray-900">Serviços</h4>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {formData.servicos.map((servico, index) => (
                                        <div key={index} className="border-l-4 border-[#007EA7] pl-4">
                                            <h5 className="font-semibold text-gray-900">{servico.nome}</h5>
                                            {servico.descricao && <p className="text-gray-600 text-sm">{servico.descricao}</p>}
                                            <p className="text-gray-700 font-medium">R$ {servico.precoEstimado.toFixed(2)}</p>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center pt-3 border-t">
                                        <span className="font-semibold text-gray-900">Total Estimado:</span>
                                        <span className="text-xl font-bold text-[#007EA7]">
                                            R$ {calcularValorTotal().toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Detalhes */}
                            <div className="bg-gray-50 rounded-md p-4 border">
                                <h4 className="font-semibold text-gray-900 mb-3">Detalhes</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <p><span className="text-gray-600">Etapa:</span> <span className="font-medium">{formData.etapa}</span></p>
                                </div>
                                {formData.observacoes && (
                                    <div className="mt-3 pt-3 border-t">
                                        <p className="text-gray-600 mb-1">Observações:</p>
                                        <p className="text-gray-900">{formData.observacoes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t bg-gray-50 flex justify-between">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-5 py-2.5 border border-gray-300 rounded-md text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <div className="flex gap-3">
                        {currentStep > 0 && (
                            <button
                                type="button"
                                onClick={() => setCurrentStep(currentStep - 1)}
                                disabled={loading}
                                className="px-5 py-2.5 border border-gray-300 rounded-md cursor-pointer text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                Voltar
                            </button>
                        )}

                        {currentStep < steps.length - 1 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={loading}
                                className="px-6 py-2.5 bg-[#007EA7] text-white rounded-md cursor-pointer hover:bg-[#006891] transition-colors disabled:opacity-50 font-semibold"
                            >
                                Próxima Etapa
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={loading}
                                className="px-6 py-2.5 bg-[#007EA7] text-white rounded-md cursor-pointer hover:bg-[#006891] transition-colors disabled:opacity-50 font-semibold flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>Salvar Pedido de Serviço</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NovoPedidoServicoModal;