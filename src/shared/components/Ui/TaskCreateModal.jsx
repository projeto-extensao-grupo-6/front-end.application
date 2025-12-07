import React, { useState, useEffect, useCallback } from "react";
import { X, Check, Trash2, CheckCircle, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Api from "../../../axios/Api";
import { cepMask } from "../../../utils/masks";

// --- COMPONENTES UI INTERNOS (Button, Input, Select, etc...) ---
// Mantidos exatamente iguais para não quebrar o layout que arrumamos

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
      className={`flex h-10 w-full rounded-md border ${error ? "border-red-500" : "border-gray-300"} bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm inherit`}
      style={{ textAlign: className.includes('text-center') ? 'center' : 'left' }}
    />
    {error && <span className="text-xs text-red-500 mt-1 block font-medium text-center">{error}</span>}
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

const categoryOptions = [
  { value: "SERVICO", label: "Prestação de serviço", color: "#3B82F6" },
  { value: "ORCAMENTO", label: "Orçamento", color: "#FBBF24" },
];

// --- COMPONENTE PRINCIPAL ---

const TaskCreateModal = ({ isOpen, onClose, onSave, initialData = {} }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: null,
    tipoAgendamento: "",
    pedido: null,
    funcionarios: [],
    produtos: [],
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

  const [funcionariosOptions, setFuncionariosOptions] = useState([]);
  const [pedidoOptions, setPedidoOptions] = useState([]);
  const [produtosOptions, setProdutosOptions] = useState([]); 
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [selectedFuncionarios, setSelectedFuncionarios] = useState([]);
  const [loadingCep, setLoadingCep] = useState(false);

  const fetchFuncionarios = useCallback(async (tipoValue) => {
    if (!tipoValue) {
      setFuncionariosOptions([]);
      return;
    }
    try {
      if (tipoValue === "ORCAMENTO") {
        try {
          const response = await Api.get("/funcionarios/1");
          const data = Array.isArray(response.data) ? response.data : [response.data];
          setFuncionariosOptions(data.map(f => ({ value: f.id, label: f.nome })));
        } catch (error) {
          setFuncionariosOptions([{ value: 1, label: "Leandro (Técnico)" }]);
        }
        return;
      }
      const response = await Api.get("/funcionarios");
      setFuncionariosOptions(response.data.map((func) => ({ value: func.id, label: func.nome })));
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
      setFuncionariosOptions([]);
    }
  }, [navigate]);

  // --- CORREÇÃO AQUI: Lógica inteligente para buscar pedidos disponíveis ---
  const fetchOpcoesPedido = useCallback(async (tipoValue) => {
    if (!tipoValue) { 
        setPedidoOptions([]); 
        return; 
    }
    setLoadingOptions(true);
    
    try {
      console.log('🔍 Buscando pedidos para tipo:', tipoValue);
      
      // Tenta primeiro buscar todos os pedidos de serviço
      let allOrders = [];
      
      try {
        const responseServicos = await Api.get("/pedidos/servicos");
        allOrders = responseServicos.data || [];
        console.log('📦 Pedidos de serviço encontrados:', allOrders.length);
      } catch (error) {
        console.warn('⚠️ Endpoint /pedidos/servicos não disponível, tentando alternativa...');
        
        // Se falhar, tenta buscar todos os pedidos e filtra os de serviço
        try {
          const responseAll = await Api.get("/pedidos");
          const todosPedidos = responseAll.data || [];
          allOrders = todosPedidos.filter(p => p.tipoPedido === 'serviço' || p.servico);
          console.log('📦 Pedidos filtrados como serviço:', allOrders.length);
        } catch (error2) {
          console.error('❌ Erro ao buscar pedidos:', error2);
        }
      }
      
      console.log('📦 Total de pedidos antes do filtro:', allOrders);

      console.log('📦 Total de pedidos antes do filtro:', allOrders);

      // Filtra pedidos baseado no tipo de agendamento e na etapa atual
      const availableOrders = allOrders.filter(order => {
          // Precisa ter serviço
          if (!order.servico) {
              console.log('❌ Pedido sem serviço:', order.id);
              return false;
          }
          
          const etapaNome = order.servico.etapa?.nome || order.etapa?.nome || 'PENDENTE';
          console.log(`🔍 Pedido ${order.id} - Etapa: ${etapaNome}, Tipo buscado: ${tipoValue}`);
          
          // Verifica se já tem agendamento ativo desse tipo
          const agendamentos = order.servico.agendamentos || [];
          const hasActiveAppointment = agendamentos.some(ag => 
              ag.tipoAgendamento === tipoValue && 
              ag.statusAgendamento?.nome !== 'CANCELADO' &&
              ag.statusAgendamento?.nome !== 'INATIVO'
          );

          if (hasActiveAppointment) {
              console.log(`❌ Pedido ${order.id} já tem agendamento ativo de ${tipoValue}`);
              return false;
          }
          
          // Define quais etapas são válidas para cada tipo
          let etapaValida = false;
          
          if (tipoValue === "ORCAMENTO") {
              // Para orçamento: aceita PENDENTE, sem agendamento prévio, ou que teve agendamento cancelado
              // Basicamente qualquer pedido que NÃO tenha um orçamento ativo
              const etapasAceitasOrcamento = [
                  "PENDENTE", 
                  "AGUARDANDO ORÇAMENTO",
                  "AGUARDANDO ORCAMENTO" // sem acento
              ];
              
              etapaValida = etapasAceitasOrcamento.some(e => 
                  etapaNome.toUpperCase().includes(e.toUpperCase()) || 
                  e.toUpperCase().includes(etapaNome.toUpperCase())
              );
              
              // Se a etapa não está na lista mas não tem agendamento ativo de orçamento,
              // pode ser um pedido novo, então aceita também
              if (!etapaValida && agendamentos.length === 0) {
                  console.log(`✅ Pedido ${order.id} sem agendamentos - aceito para orçamento`);
                  etapaValida = true;
              }
              
          } else if (tipoValue === "SERVICO") {
              // Para serviço: só aceita se o orçamento já foi aprovado
              const etapasAceitasServico = [
                  "ORÇAMENTO APROVADO", 
                  "ORCAMENTO APROVADO",
                  "ANÁLISE DO ORÇAMENTO",
                  "ANALISE DO ORCAMENTO",
                  "SERVIÇO AGENDADO",
                  "SERVICO AGENDADO"
              ];
              
              etapaValida = etapasAceitasServico.some(e => 
                  etapaNome.toUpperCase().includes(e.toUpperCase()) || 
                  e.toUpperCase().includes(etapaNome.toUpperCase())
              );
          }
          
          if (!etapaValida) {
              console.log(`❌ Pedido ${order.id} - Etapa ${etapaNome} não válida para ${tipoValue}`);
              return false;
          }
          
          console.log(`✅ Pedido ${order.id} disponível para ${tipoValue}`);
          return true;
      });
      
      console.log('📊 Resumo:', {
          total: allOrders.length,
          disponiveis: availableOrders.length,
          tipoAgendamento: tipoValue
      });

      // 5. Mapeia para o formato do Select
      const options = availableOrders.map((dto) => {
          // Debug: Log cada pedido individualmente
          console.log('🔍 Processando pedido:', dto);
          
          // Garante que temos um ID válido
          const pedidoId = dto.id || dto.pedidoId || dto.idPedido;
          
          // Monta uma label descritiva baseada nos dados disponíveis
          let label = '';
          
          if (dto.descricao) {
              label = dto.descricao;
          } else if (dto.nome) {
              label = dto.nome;
          } else {
              // Usa informações do cliente ou serviço
              const clienteNome = dto.cliente?.nome || dto.servico?.cliente?.nome;
              const servicoNome = dto.servico?.nome || dto.servico?.descricao;
              
              if (clienteNome && servicoNome) {
                  label = `${clienteNome} - ${servicoNome}`;
              } else if (clienteNome) {
                  label = `Pedido de ${clienteNome}`;
              } else if (servicoNome) {
                  label = servicoNome;
              } else if (pedidoId) {
                  label = `Pedido #${pedidoId}`;
              } else {
                  label = `Pedido sem identificação`;
              }
              
              // Adiciona a etapa se disponível
              if (dto.etapa?.nome) {
                  label += ` (${dto.etapa.nome})`;
              }
          }
          
          console.log('✅ Label gerada:', label);
          
          return { 
              value: pedidoId, 
              label: label, 
              originalData: dto 
          };
      }).filter(opt => opt.value); // Remove opções sem ID válido
      
      // Garante que o pedido atual (se estiver editando) apareça na lista
      if (initialData?.pedido?.value) {
         const exists = options.find(o => String(o.value) === String(initialData.pedido.value));
         if (!exists) {
             options.unshift(initialData.pedido);
         }
      }

      setPedidoOptions(options);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      setPedidoOptions([]);
    } finally {
      setLoadingOptions(false);
    }
  }, [initialData]);

  const fetchProdutos = useCallback(async () => {
    try {
      const response = await Api.get("/produtos");
      const dados = response.data || [];
      setProdutosOptions(dados.map(prod => ({ value: prod.id, label: prod.nome || prod.descricao || `Produto ${prod.id}`, originalData: prod })));
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      setProdutosOptions([]);
    }
  }, [navigate]);

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
              rua: end.rua || prev.rua || end.logradouro || "",
              cep: end.cep || prev.cep || "",
              numero: end.numero || prev.numero || "",
              bairro: end.bairro || prev.bairro || "",
              cidade: end.cidade || prev.cidade || "",
              uf: end.uf || prev.uf || "",
              pais: end.pais || prev.pais || "Brasil",
              complemento: end.complemento || prev.complemento || ""
          }));
      }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors?.[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleCepChange = async (value) => {
    const maskedValue = cepMask(value);
    setFormData((prev) => ({ ...prev, cep: maskedValue }));
    if (errors?.cep) setErrors((prev) => ({ ...prev, cep: "" }));
    const cleanCep = maskedValue.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData((prev) => ({ ...prev, rua: data.logradouro || prev.rua, bairro: data.bairro || prev.bairro, cidade: data.localidade || prev.cidade, uf: data.uf || prev.uf, pais: "Brasil" }));
        }
      } catch (error) { console.error("Erro ao buscar CEP:", error); } finally { setLoadingCep(false); }
    }
  };

  const handleProdutosSelectChange = (selectedIds) => {
    setFormData((prev) => {
      const currentProducts = prev.produtos || [];
      const keptProducts = currentProducts.filter(p => selectedIds.includes(p.id));
      const newIds = selectedIds.filter(id => !currentProducts.some(p => p.id === id));
      const newProducts = newIds.map(id => {
        const option = produtosOptions.find(opt => opt.value === id);
        const existingInitData = initialData?.produtos?.find(p => p.id === id);
        return { 
            id: id, 
            nome: option ? option.label : (existingInitData ? existingInitData.nome : "Produto"), 
            quantidade: existingInitData ? existingInitData.quantidade : 1 
        };
      });
      return { ...prev, produtos: [...keptProducts, ...newProducts] };
    });
  };

  const handleRemoveProduto = (id) => {
    setFormData(prev => ({ ...prev, produtos: prev.produtos.filter(p => p.id !== id) }));
  };

  useEffect(() => {
    if (isOpen) {
      setFormData({
        id: initialData?.id || null,
        tipoAgendamento: initialData?.tipoAgendamento || "",
        pedido: initialData?.pedido || null,
        funcionarios: initialData?.funcionarios || [],
        produtos: initialData?.produtos || [],
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

        if (initialData.pedido) {
            setPedidoOptions([initialData.pedido]);
        }
      }
      
      if (initialData?.produtos?.length > 0) {
          fetchProdutos();
      }
    }
  }, [isOpen, initialData, fetchFuncionarios, fetchOpcoesPedido, fetchProdutos]);

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      const tipoValue = formData?.tipoAgendamento?.value || formData?.tipoAgendamento;
      if (!tipoValue) newErrors.tipoAgendamento = "* Obrigatório";
      if (!formData?.eventDate?.trim()) newErrors.eventDate = "* Obrigatória";
      if (!formData?.startTime?.trim()) newErrors.startTime = "* Obrigatório";
      if (!formData?.endTime?.trim()) newErrors.endTime = "* Obrigatório";
    }
    if (currentStep === 2) {
      if (!formData?.rua?.trim()) newErrors.rua = "* Rua obrigatória";
      if (!formData?.cep?.trim()) newErrors.cep = "* CEP obrigatório";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatTimeToHHmmss = (timeStr) => {
    if (!timeStr) return "00:00:00";
    const [hour = "00", minute = "00"] = timeStr.split(":");
    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
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
      
      const funcionariosPayload = await Promise.all(
        selectedFuncionarios.map(async (id) => {
          try {
            const response = await Api.get(`/funcionarios/${id}`);
            const func = response.data;
            return { nome: func.nome || "", telefone: func.telefone || "", funcao: func.funcao || "", contrato: func.contrato || "", escala: func.escala || "", status: func.status !== undefined ? func.status : true };
          } catch (error) {
            const funcEncontrado = funcionariosOptions.find(f => f.value === id);
            return { nome: funcEncontrado?.label || "Funcionário", telefone: "", funcao: "", contrato: "", escala: "", status: true };
          }
        })
      );
      
      const pedidoCompleto = formData.pedido?.originalData || null;
      // Mantém a etapa do pedido como está ou default, o backend irá atualizar automaticamente ao criar o agendamento
      const servicoPayload = pedidoCompleto?.servico ? { 
          id: pedidoCompleto.servico.id, 
          codigo: pedidoCompleto.servico.codigo, 
          nome: pedidoCompleto.servico.nome, 
          descricao: pedidoCompleto.servico.descricao, 
          precoBase: pedidoCompleto.servico.precoBase, 
          ativo: true, 
          etapa: pedidoCompleto.servico.etapa || { id: 0, tipo: "SERVICO", nome: "PENDENTE" } 
      } : { id: 0, codigo: `auto_${Date.now()}`, nome: "", descricao: "", precoBase: 0.00, ativo: true, etapa: { id: 0, tipo: "SERVICO", nome: "PENDENTE" } };
      
      const produtosPayload = formData.produtos.filter(p => p.id != null).map(p => ({ produtoId: parseInt(p.id, 10), quantidadeUtilizada: 0.00, quantidadeReservada: parseFloat(p.quantidade) || 0.00 }));
      
      const payload = { 
          id: formData.id, 
          servico: servicoPayload, 
          tipoAgendamento: tipoValor, 
          dataAgendamento: formatDateToISO(formData.eventDate), 
          inicioAgendamento: formatTimeToHHmmss(formData.startTime), 
          fimAgendamento: formatTimeToHHmmss(formData.endTime), 
          statusAgendamento: { tipo: "AGENDAMENTO", nome: "PENDENTE" }, 
          observacao: formData.observacao || "", 
          endereco: { 
              rua: formData.rua || "", 
              complemento: formData.complemento || "", 
              cep: formData.cep || "", 
              cidade: formData.cidade || "", 
              bairro: formData.bairro || "", 
              uf: formData.uf || "", 
              pais: formData.pais || "", 
              numero: formData.numero ? parseInt(formData.numero, 10) : 0 
          }, 
          funcionarios: funcionariosPayload, 
          produtos: produtosPayload 
      };
      
      let result;
      if (formData.id) {
          result = await Api.put(`/agendamentos/${formData.id}`, payload);
      } else {
          result = await Api.post("/agendamentos", payload);
      }
      
      // Atualiza a etapa do pedido após criar/editar o agendamento
      if (pedidoCompleto?.id && pedidoCompleto?.servico?.id) {
          try {
              // Define a nova etapa baseada no tipo de agendamento
              let novaEtapa = '';
              if (tipoValor === 'ORCAMENTO') {
                  novaEtapa = 'AGUARDANDO ORÇAMENTO';
              } else if (tipoValor === 'SERVICO') {
                  novaEtapa = 'SERVIÇO AGENDADO';
              }
              
              if (novaEtapa) {
                  // Atualiza o serviço com a nova etapa
                  const servicoAtualizado = {
                      ...pedidoCompleto.servico,
                      etapa: {
                          tipo: 'SERVICO',
                          nome: novaEtapa
                      }
                  };
                  
                  // Atualiza o pedido completo
                  await Api.put(`/pedidos/${pedidoCompleto.id}`, {
                      pedido: {
                          valorTotal: pedidoCompleto.valorTotal || 0,
                          ativo: true,
                          observacao: pedidoCompleto.observacao || '',
                          formaPagamento: pedidoCompleto.formaPagamento || 'Pix',
                          cliente: pedidoCompleto.cliente ? { id: pedidoCompleto.cliente.id } : null,
                          status: pedidoCompleto.status || { tipo: 'PEDIDO', nome: 'Ativo' }
                      },
                      servico: servicoAtualizado,
                      produtos: null
                  });
                  
                  console.log(`✅ Etapa do pedido atualizada para: ${novaEtapa}`);
              }
          } catch (error) {
              console.error('⚠️ Erro ao atualizar etapa do pedido:', error);
              // Não bloqueia o fluxo se falhar a atualização da etapa
          }
      }
      
      setIsSuccess(true);
      onSave?.(result.data);
      setTimeout(() => { onClose(); }, 1500);
    } catch (error) {
      console.error("Submit Error:", error);
      setErrors({ submit: "Erro ao salvar agendamento. Verifique os dados." });
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateStep(step)) return;
    
    const tipoValue = formData?.tipoAgendamento?.value || formData?.tipoAgendamento;
    const isOrcamento = tipoValue === "ORCAMENTO";
    
    // Se estiver no step 2 e for orçamento, já finaliza
    if (step === 2 && isOrcamento) {
      await submitToBackend();
      return;
    }
    
    // Se for prestação de serviço, continua para step 3 (produtos)
    if (step === 2) { 
      setLoading(true); 
      await fetchProdutos(); 
      setLoading(false); 
      setStep(3); 
      return; 
    }
    
    if (step < 3) { setStep((s) => s + 1); return; }
    await submitToBackend();
  };

  const handleBack = () => { setErrors({}); setStep((s) => Math.max(1, s - 1)); };

  if (!isOpen) return null;

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white border border-gray-200 rounded-xl p-10 m-3 w-full max-w-md shadow-2xl flex flex-col items-center justify-center text-center transform transition-all scale-100" onClick={(e) => e?.stopPropagation()}>
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce"><CheckCircle className="w-12 h-12 text-green-600" /></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Agendamento {formData.id ? "Atualizado" : "Criado"}!</h2>
          <p className="text-gray-500 mb-8">O agendamento foi salvo com sucesso.</p>
          <div className="w-full"><Button variant="success" size="lg" className="w-full justify-center" onClick={onClose}>Concluir</Button></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="flex flex-col gap-6 bg-white border border-gray-200 rounded-xl p-5 m-3 w-full max-w-4xl shadow-2xl overflow-hidden" onClick={(e) => e?.stopPropagation()}>
        <div className="flex flex-row items-center justify-between border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{formData.id ? "Editar Agendamento" : "Novo Agendamento"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="cursor-pointer"><X size={20} /></Button>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${step >= 1 ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600"}`}>1</div>
            <span className={`text-xs font-medium transition-colors ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}>Agendamento</span>
          </div>
          <div className={`h-1 w-12 rounded ${step >= 2 ? "bg-blue-600" : "bg-gray-200"} -mt-5`}></div>
          <div className="flex flex-col items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>2</div>
            <span className={`text-xs font-medium transition-colors ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}>Endereço</span>
          </div>
          {(formData?.tipoAgendamento?.value === "SERVICO" || formData?.tipoAgendamento === "SERVICO") && (
            <>
              <div className={`h-1 w-12 rounded ${step >= 3 ? "bg-blue-600" : "bg-gray-200"} -mt-5`}></div>
              <div className="flex flex-col items-center gap-2">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>3</div>
                <span className={`text-xs font-medium transition-colors ${step >= 3 ? "text-blue-600" : "text-gray-400"}`}>Produtos</span>
              </div>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6 overflow-y-auto px-2 pb-6">
          {errors?.submit && (<div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm flex items-center"><X size={16} className="mr-2" />{errors.submit}</div>)}

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de agendamento <span className="text-red-500">*</span></label>
                  <Select value={formData?.tipoAgendamento} onChange={handleTypeChange} options={categoryOptions} placeholder="Selecione o tipo" />
                  {errors?.tipoAgendamento && <span className="text-red-500 text-xs mt-1">{errors.tipoAgendamento}</span>}
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex justify-between"><span>Pedido Vinculado <span className="text-red-500">*</span></span>{loadingOptions && <span className="text-xs text-blue-600 animate-pulse">Carregando...</span>}</label>
                  <Select value={formData?.pedido} onChange={handlePedidoChange} options={pedidoOptions} placeholder={loadingOptions ? "Buscando pedidos..." : "Selecione o pedido"} disabled={!formData?.tipoAgendamento || loadingOptions} />
                  {errors?.pedido && <span className="text-red-500 text-xs mt-1">{errors.pedido}</span>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Funcionários responsáveis</label>
                <MultipleSelectCheckmarks placeholder="Selecione os funcionários" options={funcionariosOptions} value={selectedFuncionarios} onChange={setSelectedFuncionarios} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="flex flex-col items-center">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Data do evento <span className="text-red-500">*</span></label>
                  <Input type="date" value={formData?.eventDate} onChange={(e) => handleInputChange("eventDate", e?.target?.value)} error={errors?.eventDate} className="!w-[160px] text-center [&::-webkit-calendar-picker-indicator]:hidden appearance-none" />
                </div>
                <div className="flex flex-col items-center">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Horário (Início e Fim) <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-3">
                    <Input type="time" value={formData?.startTime} onChange={(e) => handleInputChange("startTime", e?.target?.value)} error={errors?.startTime} className="!w-[100px] text-center [&::-webkit-calendar-picker-indicator]:hidden appearance-none" />
                    <span className="text-gray-500 font-medium pb-1">até</span>
                    <Input type="time" value={formData?.endTime} onChange={(e) => handleInputChange("endTime", e?.target?.value)} error={errors?.endTime} className="!w-[100px] text-center [&::-webkit-calendar-picker-indicator]:hidden appearance-none" />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="flex text-sm font-semibold text-gray-700 mb-2 justify-between"><span>CEP <span className="text-red-500">*</span></span>{loadingCep && <span className="text-xs text-blue-600 animate-pulse">Buscando...</span>}</label><Input type="text" value={formData?.cep} onChange={(e) => handleCepChange(e?.target?.value)} placeholder="00000-000" error={errors?.cep} maxLength={9} /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Rua <span className="text-red-500">*</span></label><Input type="text" value={formData?.rua} onChange={(e) => handleInputChange("rua", e?.target?.value)} placeholder="Nome da rua" error={errors?.rua} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                 <div><label className="block text-sm font-semibold text-gray-700 mb-2">Número</label><Input type="text" value={formData?.numero} onChange={(e) => handleInputChange("numero", e?.target?.value)} placeholder="Nº" /></div>
                 <div><label className="block text-sm font-semibold text-gray-700 mb-2">Complemento</label><Input type="text" value={formData?.complemento} onChange={(e) => handleInputChange("complemento", e?.target?.value)} placeholder="Apto, Bloco..." /></div>
                 <div><label className="block text-sm font-semibold text-gray-700 mb-2">Bairro</label><Input type="text" value={formData?.bairro} onChange={(e) => handleInputChange("bairro", e?.target?.value)} placeholder="Bairro" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                 <div><label className="block text-sm font-semibold text-gray-700 mb-2">Cidade</label><Input type="text" value={formData?.cidade} onChange={(e) => handleInputChange("cidade", e?.target?.value)} placeholder="Cidade" /></div>
                 <div><label className="block text-sm font-semibold text-gray-700 mb-2">UF</label><Input type="text" value={formData?.uf} onChange={(e) => handleInputChange("uf", e?.target?.value)} placeholder="UF" maxLength={2} /></div>
                 <div><label className="block text-sm font-semibold text-gray-700 mb-2">País</label><Input type="text" value={formData?.pais} onChange={(e) => handleInputChange("pais", e?.target?.value)} placeholder="Brasil" /></div>
              </div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Observação</label><Input type="text" value={formData?.observacao} onChange={(e) => handleInputChange("observacao", e?.target?.value)} placeholder="Observação" /></div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="flex flex-col gap-4 h-full">
              <div>
                <div className="flex items-center justify-between mb-2"><label className="block text-sm font-semibold text-gray-700">Adicionar Produtos (Opcional)</label><span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{formData.produtos.length} itens selecionados</span></div>
                <MultipleSelectCheckmarks options={produtosOptions} value={formData.produtos.map(p => p.id)} onChange={handleProdutosSelectChange} placeholder="Pesquise e selecione produtos..." className="mb-4" />
              </div>
              <div className="flex-1 border border-gray-200 rounded-md overflow-hidden flex flex-col">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider"><div className="col-span-7 text-left flex items-center gap-2"><Package size={14} /> Produto</div><div className="col-span-4 text-center">Qtd. Reserva</div><div className="col-span-1 text-center">Ação</div></div>
                <div className="overflow-y-auto flex-1 bg-gray-50/30">
                  {formData.produtos.length === 0 ? (<div className="h-full flex flex-col items-center justify-center text-gray-400 p-8"><Package size={40} className="mb-2 opacity-20" /><p className="text-sm">Nenhum produto selecionado.</p><p className="text-xs mt-1">Clique em "Finalizar" para pular esta etapa.</p></div>) : (
                    <div className="divide-y divide-gray-100">
                      {formData.produtos.map((prod) => (
                        <div key={prod.id} className="grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-white transition-colors bg-white">
                          <div className="col-span-7 text-sm font-medium text-gray-900 text-left truncate" title={prod.nome}>{prod.nome}</div>
                          <div className="col-span-4"><button type="button" className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-full transition-colors" onClick={() => handleRemoveProduto(prod.id)}><Trash2 size={16} /></button></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
            <div>{step > 1 && (<Button variant="outline" onClick={handleBack}>Voltar</Button>)}</div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" iconPosition="left" size="md" variant="btn-primary" disabled={loading}>
                {loading ? "Salvando..." : (
                  step === 2 && (formData?.tipoAgendamento?.value === "ORCAMENTO" || formData?.tipoAgendamento === "ORCAMENTO") ? "Finalizar" :
                  step < 3 ? "Próximo" : "Finalizar"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCreateModal;