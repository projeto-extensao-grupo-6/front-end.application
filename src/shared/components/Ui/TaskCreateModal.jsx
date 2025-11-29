import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { X, Check, Trash2, CheckCircle, Package } from "lucide-react";

// ==================================================================================
// --- COMPONENTES INTERNOS (UI) ---
// ==================================================================================

const Button = ({ children, variant = "primary", size = "md", className = "", onClick, disabled, type = "button" }) => {
  const baseClass = "inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 border border-transparent shadow-sm hover:shadow-md",
    "btn-primary": "bg-blue-600 text-white hover:bg-blue-700 border border-transparent shadow-sm hover:shadow-md", 
    outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 shadow-sm",
    ghost: "hover:bg-gray-100 text-gray-500 hover:text-gray-700",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
  };
  const sizes = { icon: "h-10 w-10 p-2", sm: "h-8 px-3 text-xs", md: "h-10 px-4 py-2 text-sm", lg: "h-12 px-6 text-base" };
  
  return (
    <button type={type} className={`${baseClass} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

const Input = ({ type = "text", value, onChange, placeholder, error, maxLength, className = "", min }) => (
  <div className={`w-full ${className}`}>
    <input
      type={type}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      min={min}
      className={`flex h-10 w-full rounded-md border ${error ? "border-red-500" : "border-gray-300"} bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm`}
    />
    {error && <span className="text-xs text-red-500 mt-1 block font-medium">{error}</span>}
  </div>
);

const Select = ({ value, onChange, options, placeholder, disabled }) => {
  const handleChange = (e) => {
    const selectedVal = e.target.value;
    if (!selectedVal) return;
    const option = options.find(o => String(o.value) === selectedVal);
    onChange(option);
  };
  const currentValue = value?.value || value || "";

  return (
    <div className="relative w-full">
      <select
        value={currentValue}
        onChange={handleChange}
        disabled={disabled}
        className="flex h-10 w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 transition-all shadow-sm"
      >
        <option value="" disabled>{placeholder || "Selecione..."}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
      </div>
    </div>
  );
};

const MultipleSelectCheckmarks = ({ options, value = [], onChange, placeholder, className }) => {
  const toggleOption = (optionId) => {
    const newValue = value.includes(optionId)
      ? value.filter(id => id !== optionId)
      : [...value, optionId];
    onChange(newValue);
  };

  return (
    <div className={`border border-gray-300 rounded-md p-2 max-h-32 overflow-y-auto bg-white w-full shadow-sm ${className}`}>
      {options.length === 0 ? (
        <span className="text-sm text-gray-400 p-1 block italic">{placeholder || "Sem opções"}</span>
      ) : (
        options.map(opt => (
          <div key={opt.value} className="flex items-center space-x-2 py-1.5 px-2 hover:bg-gray-50 rounded cursor-pointer transition-colors group" onClick={() => toggleOption(opt.value)}>
            <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${value.includes(opt.value) ? "bg-blue-600 border-blue-600" : "border-gray-300 group-hover:border-blue-400"}`}>
              {value.includes(opt.value) && <Check size={12} className="text-white" />}
            </div>
            <span className={`text-sm ${value.includes(opt.value) ? "text-gray-900 font-medium" : "text-gray-700"}`}>{opt.label}</span>
          </div>
        ))
      )}
    </div>
  );
};

// ==================================================================================
// --- SERVICES ---
// ==================================================================================

const getAuthHeader = () => {
  const token = localStorage.getItem("token") || 
                localStorage.getItem("access_token") ||
                (localStorage.getItem("user") && JSON.parse(localStorage.getItem("user")).token);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const agendamentosService = {
  create: async (payload) => {
    return axios.post('http://localhost:3000/api/agendamentos', payload, { headers: getAuthHeader() });
  }
};

// ==================================================================================
// --- MODAL PRINCIPAL ---
// ==================================================================================

const categoryOptions = [
  { value: "SERVICO", label: "Prestação de serviço", color: "#3B82F6" },
  { value: "ORCAMENTO", label: "Orçamento", color: "#FBBF24" },
];

const serviceOptions = [
  { value: "PEDIDO_001", label: "Pedido#001" },
  { value: "PEDIDO_002", label: "Pedido#002" },
  { value: "PEDIDO_003", label: "Pedido#003" },
];

const TaskCreateModal = ({ isOpen, onClose, onSave, initialData = {} }) => {
  const [formData, setFormData] = useState({
    tipoAgendamento: "",
    pedido: null,
    funcionarios: [],
    produtos: [], // { id, nome, quantidade }
    eventDate: "",
    startTime: "",
    endTime: "",
    rua: "",
    cep: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    pais: "",
    observacao: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  // Estados de dados
  const [funcionariosOptions, setFuncionariosOptions] = useState([]);
  const [pedidoOptions, setPedidoOptions] = useState([]);
  const [produtosOptions, setProdutosOptions] = useState([]); 
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [selectedFuncionarios, setSelectedFuncionarios] = useState([]);

  // --- CARREGAMENTO DE DADOS ---

  // 1. Busca Funcionários
  const fetchFuncionarios = useCallback(async (tipoValue) => {
    if (!tipoValue) {
      setFuncionariosOptions([]);
      return;
    }
    try {
      const headers = getAuthHeader();
      const response = await axios.get("http://localhost:3000/api/funcionarios", { headers });
      const todosFuncionarios = response.data || [];
      let funcionariosFiltrados = todosFuncionarios;

      if (tipoValue === "ORCAMENTO") {
          const leandroEncontrado = todosFuncionarios.find(f => 
            f.nome && f.nome.toUpperCase().includes("LEANDRO")
          );
          if (leandroEncontrado) {
            funcionariosFiltrados = [leandroEncontrado];
          } else {
            funcionariosFiltrados = [{ id: "LEANDRO_FIXO", nome: "Leandro (Técnico)" }];
          }
      }

      setFuncionariosOptions(funcionariosFiltrados.map((func) => ({
        value: func.id,
        label: func.nome,
      })));
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
      if (tipoValue === "ORCAMENTO") {
        setFuncionariosOptions([{ value: "LEANDRO_FIXO", label: "Leandro (Técnico)" }]);
      } else {
        setFuncionariosOptions([]);
      }
    }
  }, []);

  // 2. Busca Pedidos
  const fetchOpcoesPedido = useCallback(async (tipoValue) => {
    if (!tipoValue) {
      setPedidoOptions([]);
      return;
    }
    setLoadingOptions(true);
    try {
      const headers = getAuthHeader();
      let nomeEtapaParaBusca = tipoValue === "ORCAMENTO" ? "PENDENTE" : "ORÇAMENTO APROVADO";
      
      const response = await axios.get(`http://localhost:3000/api/pedidos/findAllBy`, {
        headers: headers,
        params: { nome: nomeEtapaParaBusca }
      });

      setPedidoOptions(response.data.map((dto) => ({
        value: dto.id,
        label: dto.descricao || dto.nome || `Pedido #${dto.id}`,
        originalData: dto 
      })));
    } catch (error) {
      console.error("Erro ao buscar opções de pedidos:", error);
      setPedidoOptions([]);
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  // 3. Busca Produtos (INTEGRAÇÃO ETAPA 3)
  const fetchProdutos = useCallback(async () => {
    try {
      const headers = getAuthHeader();
      const response = await axios.get("http://localhost:3000/api/produtos", { headers });
      const dados = response.data || [];
      
      setProdutosOptions(dados.map(prod => ({
        value: prod.id,
        label: prod.nome || prod.descricao || `Produto ${prod.id}`,
        originalData: prod
      })));
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      setProdutosOptions([]);
    }
  }, []);

  // --- HANDLERS ---

  const handleTypeChange = (selectedOption) => {
    const typeValue = selectedOption?.value || selectedOption;
    setFormData((prev) => ({ ...prev, tipoAgendamento: selectedOption, pedido: null }));
    setSelectedFuncionarios([]);
    fetchFuncionarios(typeValue);
    fetchOpcoesPedido(typeValue);
  };

  const handlePedidoChange = (selectedPedidoOption) => {
      setFormData(prev => ({ ...prev, pedido: selectedPedidoOption }));
      if (selectedPedidoOption?.originalData?.endereco) {
          const end = selectedPedidoOption.originalData.endereco;
          setFormData(prev => ({
              ...prev,
              rua: end.rua || prev.rua,
              cep: end.cep || prev.cep,
              numero: end.numero || prev.numero,
              bairro: end.bairro || prev.bairro,
              cidade: end.cidade || prev.cidade,
              uf: end.uf || prev.uf,
              pais: end.pais || prev.pais,
              complemento: end.complemento || prev.complemento
          }));
      }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors?.[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Handlers de Produtos (Step 3)
  const handleProdutosSelectChange = (selectedIds) => {
    setFormData((prev) => {
      const currentProducts = prev.produtos || [];
      const keptProducts = currentProducts.filter(p => selectedIds.includes(p.id));
      const newIds = selectedIds.filter(id => !currentProducts.some(p => p.id === id));
      const newProducts = newIds.map(id => {
        const option = produtosOptions.find(opt => opt.value === id);
        return {
          id: id,
          nome: option ? option.label : "Produto",
          quantidade: 1 
        };
      });
      return { ...prev, produtos: [...keptProducts, ...newProducts] };
    });
  };

  const handleProdutoQuantidadeChange = (id, novaQtde) => {
    setFormData(prev => ({
      ...prev,
      produtos: prev.produtos.map(p => 
        p.id === id ? { ...p, quantidade: Number(novaQtde) } : p
      )
    }));
  };

  const handleRemoveProduto = (id) => {
    setFormData(prev => ({
      ...prev,
      produtos: prev.produtos.filter(p => p.id !== id)
    }));
  };

  // --- INICIALIZAÇÃO ---

  useEffect(() => {
    if (isOpen) {
      setFormData({
        tipoAgendamento: initialData?.tipoAgendamento || "",
        pedido: initialData?.pedido || null,
        funcionarios: initialData?.funcionarios || [],
        produtos: [],
        eventDate: initialData?.eventDate || "",
        startTime: initialData?.startTime || "",
        endTime: initialData?.endTime || "",
        rua: initialData?.rua || "",
        cep: initialData?.cep || "",
        numero: initialData?.numero || "",
        complemento: initialData?.complemento || "",
        bairro: initialData?.bairro || "",
        cidade: initialData?.cidade || "",
        uf: initialData?.uf || "",
        pais: initialData?.pais || "",
        observacao: initialData?.observacao || "",
      });
      setErrors({});
      setSelectedFuncionarios(initialData?.funcionarios || []);
      setStep(1);
      setIsSuccess(false);

      if (initialData?.tipoAgendamento) {
        const typeValue = initialData.tipoAgendamento.value || initialData.tipoAgendamento;
        fetchFuncionarios(typeValue);
        fetchOpcoesPedido(typeValue);
      }
    }
  }, [isOpen, initialData, fetchFuncionarios, fetchOpcoesPedido]);

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (!formData?.tipoAgendamento?.trim())
      newErrors.tipoAgendamento = "* Tipo de agendamento é obrigatório";
    if (!formData?.eventDate?.trim())
      newErrors.eventDate = "* Data do evento é obrigatória";
    if (!formData?.startTime?.trim())
      newErrors.startTime = "* Horário de início é obrigatório";
    if (!formData?.endTime?.trim())
      newErrors.endTime = "* Horário de fim é obrigatório";
    if (!formData?.rua?.trim())
      newErrors.rua = "* Nome da rua é obrigatório";
    if (!formData?.cep?.trim()) newErrors.cep = "* CEP é obrigatório";
    if (!formData?.numero?.trim())
      newErrors.numero = "* Número é obrigatório";
    if (!formData?.bairro?.trim())
      newErrors.bairro = "* Bairro é obrigatório";
    if (!formData?.cidade?.trim())
      newErrors.cidade = "* Cidade é obrigatória";
    if (!formData?.uf?.trim()) newErrors.uf = "* UF é obrigatório";
    if (!formData?.pais?.trim()) newErrors.pais = "* País é obrigatório";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatTimeToHHmmss = (timeStr) => {
    if (!timeStr) return "00:00:00";
    const [hour = 0, minute = 0] = timeStr.split(":").map((t) => Number(t));
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(hour)}:${pad(minute)}:00`;
  };

  const submitToBackend = async () => {
    setLoading(true);
    try {
      const formatDateToISO = (dateStr) => {
        if (!dateStr) return "";
        if (dateStr.includes("-")) return dateStr;
        const [day, month, year] = dateStr.split("/");
        return `${year}-${month}-${day}`;
      };

      const tipoValor = formData.tipoAgendamento?.value || formData.tipoAgendamento;
      
      // ✅ NOVO: Enviar dados completos dos funcionários
      const funcionariosPayload = selectedFuncionarios.map(id => {
        const funcEncontrado = funcionariosOptions.find(f => f.value === id);
        return {
          id: id,
          nome: funcEncontrado?.label || "Funcionário",
        };
      });
      
      // ✅ NOVO: Enviar dados completos do pedido
      const pedidoPayload = formData.pedido?.originalData 
        ? formData.pedido.originalData 
        : (formData.pedido?.value 
          ? { 
              id: formData.pedido.value,
              nome: formData.pedido?.label || `Pedido #${formData.pedido.value}`,
              descricao: formData.pedido?.label
            } 
          : null);

      const statusAgendamentoPayload = { tipo: "AGENDAMENTO", nome: "PENDENTE" };

      const agendamentoProdutoPayload = formData.produtos.map(p => ({
        produtoId: p.id,
        quantidadeUtilizada: 0, 
        quantidadeReservada: Number(p.quantidade)
      }));

      const payload = {
        tipoAgendamento: tipoValor, 
        dataAgendamento: formatDateToISO(formData.eventDate),
        inicioAgendamento: formatTimeToHHmmss(formData.startTime),
        fimAgendamento: formatTimeToHHmmss(formData.endTime),
        statusAgendamento: statusAgendamentoPayload,
        observacao: formData.observacao || "",
        pedido: pedidoPayload,  // ✅ Agora com dados completos
        endereco: {
          rua: formData.rua,
          complemento: formData.complemento || "",
          cep: formData.cep,
          cidade: formData.cidade,
          bairro: formData.bairro,
          uf: formData.uf,
          pais: formData.pais,
        },
        funcionarios: funcionariosPayload,  // ✅ Agora com dados completos
        agendamentoProduto: agendamentoProdutoPayload 
      };

      console.log("Enviando payload completo:", payload);
      const result = await agendamentosService.create(payload);
      setIsSuccess(true);
      onSave?.(result);
    } catch (error) {
      console.error("Erro no submit:", error);
      const serverMsg = error.response?.data?.message || error.response?.data?.error || error.message;
      setErrors({ submit: `Erro: ${serverMsg}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateStep(step)) return;

    // Se estiver na etapa 2, busca produtos antes de ir para a 3
    if (step === 2) {
        setLoading(true);
        await fetchProdutos();
        setLoading(false);
        setStep(3);
        return;
    }

    if (step < 3) {
      setStep((s) => s + 1);
      return;
    }
    await submitToBackend();
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => Math.max(1, s - 1));
  };

  if (!isOpen) return null;

  // TELA DE SUCESSO
  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
        <div 
          className="bg-white border border-gray-200 rounded-xl p-10 m-3 w-full max-w-md shadow-2xl flex flex-col items-center justify-center text-center transform transition-all scale-100"
          onClick={(e) => e?.stopPropagation()}
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Agendamento Criado!</h2>
          <p className="text-gray-500 mb-8">
            O agendamento foi salvo com sucesso no sistema e os produtos foram reservados.
          </p>
          <div className="w-full">
            <Button variant="success" size="lg" className="w-full justify-center" onClick={onClose}>
              Concluir
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white border border-gray-200 rounded-xl p-8 m-3 min-h-[650px] w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e?.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Novo Agendamento</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={24} />
          </Button>
        </div>

        {/* Steps Indicator */}
        <div className="py-6 flex items-center justify-center gap-4">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${step >= 1 ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600"}`}>1</div>
          <div className={`h-1 w-12 rounded ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>2</div>
          <div className={`h-1 w-12 rounded ${step >= 3 ? "bg-blue-600" : "bg-gray-200"}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>3</div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6 overflow-y-auto px-2">
          {errors?.submit && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {errors.submit}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de agendamento <span className="text-red-500">*</span></label>
                  <Select
                    value={formData?.tipoAgendamento}
                    onChange={handleTypeChange} 
                    options={categoryOptions}
                    placeholder="Selecione o tipo"
                  />
                  {errors?.tipoAgendamento && <span className="text-red-500 text-xs mt-1">{errors.tipoAgendamento}</span>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex justify-between">
                    <span>Pedido Vinculado <span className="text-red-500">*</span></span>
                    {loadingOptions && <span className="text-xs text-blue-600 animate-pulse">Carregando...</span>}
                  </label>
                  <Select
                    value={formData?.pedido}
                    onChange={handlePedidoChange} 
                    options={pedidoOptions}
                    placeholder={loadingOptions ? "Buscando pedidos..." : "Selecione o pedido"}
                    disabled={!formData?.tipoAgendamento || loadingOptions}
                  />
                  {errors?.pedido && <span className="text-red-500 text-xs mt-1">{errors.pedido}</span>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Funcionários responsáveis</label>
                <MultipleSelectCheckmarks
                  placeholder="Selecione os funcionários"
                  options={funcionariosOptions}
                  value={selectedFuncionarios}
                  onChange={setSelectedFuncionarios}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.tipoAgendamento?.value === "ORCAMENTO" 
                    ? "Apenas técnicos habilitados para orçamento são listados." 
                    : ""}
                </p>
              </div>

              <div className="grid grid-cols-11 gap-4">
                <div className="col-span-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Data do evento <span className="text-red-500">*</span></label>
                  <Input 
                    type="date" 
                    value={formData?.eventDate} 
                    onChange={(e) => handleInputChange("eventDate", e?.target?.value)} 
                    error={errors?.eventDate} 
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Início <span className="text-red-500">*</span></label>
                  <Input type="time" value={formData?.startTime} onChange={(e) => handleInputChange("startTime", e?.target?.value)} error={errors?.startTime} />
                </div>
                <div className="col-span-1 flex justify-center items-center text-gray-700 pt-6">até</div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fim <span className="text-red-500">*</span></label>
                  <Input type="time" value={formData?.endTime} onChange={(e) => handleInputChange("endTime", e?.target?.value)} error={errors?.endTime} />
                </div>
              </div>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">CEP <span className="text-red-500">*</span></label>
                  <Input type="text" value={formData?.cep} onChange={(e) => handleInputChange("cep", e?.target?.value)} placeholder="00000-000" error={errors?.cep} maxLength={9} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rua <span className="text-red-500">*</span></label>
                  <Input type="text" value={formData?.rua} onChange={(e) => handleInputChange("rua", e?.target?.value)} placeholder="Nome da rua" error={errors?.rua} />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Número</label>
                    <Input type="text" value={formData?.numero} onChange={(e) => handleInputChange("numero", e?.target?.value)} placeholder="Nº" />
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Complemento</label>
                    <Input type="text" value={formData?.complemento} onChange={(e) => handleInputChange("complemento", e?.target?.value)} placeholder="Apto, Bloco..." />
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bairro</label>
                    <Input type="text" value={formData?.bairro} onChange={(e) => handleInputChange("bairro", e?.target?.value)} placeholder="Bairro" />
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cidade</label>
                    <Input type="text" value={formData?.cidade} onChange={(e) => handleInputChange("cidade", e?.target?.value)} placeholder="Cidade" />
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">UF</label>
                    <Input type="text" value={formData?.uf} onChange={(e) => handleInputChange("uf", e?.target?.value)} placeholder="UF" maxLength={2} />
                 </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">País</label>
                    <Input type="text" value={formData?.pais} onChange={(e) => handleInputChange("pais", e?.target?.value)} placeholder="Brasil" />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Observação</label>
                <Input 
                  type="text"
                  value={formData?.observacao} 
                  onChange={(e) => handleInputChange("observacao", e?.target?.value)} 
                  placeholder="Observação" 
                />
              </div>
            </>
          )}

          {/* STEP 3: PRODUTOS */}
          {step === 3 && (
            <div className="flex flex-col gap-4 h-full">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Adicionar Produtos (Opcional)</label>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {formData.produtos.length} itens selecionados
                  </span>
                </div>
                <MultipleSelectCheckmarks
                  options={produtosOptions}
                  value={formData.produtos.map(p => p.id)}
                  onChange={handleProdutosSelectChange}
                  placeholder="Pesquise e selecione produtos..."
                  className="mb-4"
                />
              </div>

              <div className="flex-1 border border-gray-200 rounded-md overflow-hidden flex flex-col">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-7 text-left flex items-center gap-2">
                    <Package size={14} /> Produto
                  </div>
                  <div className="col-span-4 text-center">Qtd. Reserva</div>
                  <div className="col-span-1 text-center">Ação</div>
                </div>

                <div className="overflow-y-auto flex-1 bg-gray-50/30">
                  {formData.produtos.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
                      <Package size={40} className="mb-2 opacity-20" />
                      <p className="text-sm">Nenhum produto selecionado.</p>
                      <p className="text-xs mt-1">Clique em "Finalizar" para pular esta etapa.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {formData.produtos.map((prod) => (
                        <div key={prod.id} className="grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-white transition-colors bg-white">
                          <div className="col-span-7 text-sm font-medium text-gray-900 text-left truncate" title={prod.nome}>
                            {prod.nome}
                          </div>
                          <div className="col-span-4">
                            <Input 
                              type="number" 
                              min="1" 
                              value={prod.quantidade} 
                              onChange={(e) => handleProdutoQuantidadeChange(prod.id, e.target.value)}
                              className="text-center h-8"
                            />
                          </div>
                          <div className="col-span-1 flex justify-center">
                            <button 
                              type="button"
                              className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-full transition-colors" 
                              onClick={() => handleRemoveProduto(prod.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* FOOTER DE NAVEGAÇÃO */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
            <div>
              {step > 1 && (
                <Button variant="outline" onClick={handleBack}>
                  Voltar
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                iconPosition="left" 
                size="md" 
                variant="btn-primary" 
                disabled={loading}
              >
                {loading ? "Salvando..." : step < 3 ? "Próximo" : "Finalizar Agendamento"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCreateModal;