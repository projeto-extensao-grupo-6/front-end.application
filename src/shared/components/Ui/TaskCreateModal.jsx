import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import Icon from "../AppIcon";
import Button from "../buttons/button.component";
import Input from "./Input";
import Select from "./Select";
import MultipleSelectCheckmarks from "./MultipleSelectCheckmarks";

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
  const [selectedFuncionarios, setSelectedFuncionarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [funcionariosOptions, setFuncionariosOptions] = useState([]);
  const [loadingFuncionarios, setLoadingFuncionarios] = useState(false);
  const [pedidoOptions, setPedidoOptions] = useState(serviceOptions);
  const [loadingPedidos, setLoadingPedidos] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fetchFuncionarios = useCallback(async () => {
    setLoadingFuncionarios(true);
    try {
      const resp = await fetch("http://localhost:3000/api/funcionarios");
      if (!resp.ok) throw new Error("Falha ao buscar funcionários");
      const data = await resp.json();
      // Espera array de objetos com id / nome
      const mapped = data.map((f) => ({
        value: f.id,
        label: f.nome || f.nomeCompleto || `Funcionario #${f.id}`,
      }));
      setFuncionariosOptions(mapped);
    } catch (e) {
      console.error("Erro ao carregar funcionários:", e);
      // fallback estático
      setFuncionariosOptions([
        { value: "JOAO", label: "João" },
        { value: "MARIA", label: "Maria" },
        { value: "VINICIUS", label: "Vinicius" },
      ]);
    } finally {
      setLoadingFuncionarios(false);
    }
  }, []);

  const fetchOpcoesPedido = useCallback(async (tipoValue) => {
    if (!tipoValue) return;
    setLoadingPedidos(true);
    try {
      const etapa = tipoValue === "ORCAMENTO" ? "PENDENTE" : "ORÇAMENTO APROVADO";
      const resp = await fetch(`http://localhost:3000/api/pedidos/findAllBy?etapa=${encodeURIComponent(etapa)}`);
      if (!resp.ok) throw new Error("Falha ao buscar pedidos");
      const data = await resp.json();
      const mapped = data.map((p) => ({
        value: p.id,
        label: p.descricao || p.nome || `Pedido #${p.id}`,
        originalData: p,
      }));
      setPedidoOptions(mapped);
    } catch (e) {
      console.warn("Usando fallback de pedidos.");
      setPedidoOptions(serviceOptions);
    } finally {
      setLoadingPedidos(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchFuncionarios();
    }
  }, [isOpen, fetchFuncionarios]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        tipoAgendamento: initialData?.tipoAgendamento || "",
        pedido: initialData?.pedido || null,
        funcionarios: initialData?.funcionarios || [],
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
      setSelectedFuncionarios([]);
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    // When initialData already contains a tipoAgendamento, fetch related options
    if (initialData?.tipoAgendamento) {
      const tipoValue =
        initialData.tipoAgendamento.value || initialData.tipoAgendamento;
      if (typeof fetchFuncionarios === "function") {
        fetchFuncionarios(tipoValue);
      }
      if (typeof fetchOpcoesPedido === "function") {
        fetchOpcoesPedido(tipoValue);
      }
    }
  }, [isOpen, initialData, fetchFuncionarios, fetchOpcoesPedido]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.tipoAgendamento) newErrors.tipoAgendamento = "* Obrigatório";
    if (!formData.eventDate) newErrors.eventDate = "* Obrigatório";
    if (!formData.startTime) newErrors.startTime = "* Obrigatório";
    if (!formData.endTime) newErrors.endTime = "* Obrigatório";
    if (!formData.rua) newErrors.rua = "* Obrigatório";
    if (!formData.cep) newErrors.cep = "* Obrigatório";
    if (!formData.numero) newErrors.numero = "* Obrigatório";
    if (!formData.bairro) newErrors.bairro = "* Obrigatório";
    if (!formData.cidade) newErrors.cidade = "* Obrigatório";
    if (!formData.uf) newErrors.uf = "* Obrigatório";
    if (!formData.pais) newErrors.pais = "* Obrigatório";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatTimeToHHmmss = (timeStr) => {
    // timeStr esperado: "HH:mm"
    if (!timeStr) return "00:00:00";
    const [hour = 0, minute = 0] = timeStr.split(":").map((t) => Number(t));
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(hour)}:${pad(minute)}:00`;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const funcionariosPayload = selectedFuncionarios.map((id) => ({ id, nome: id }));
      const payload = {
        tipoAgendamento: formData.tipoAgendamento,
        dataAgendamento: formData.eventDate,
        inicioAgendamento: formatTimeToHHmmss(formData.startTime),
        fimAgendamento: formatTimeToHHmmss(formData.endTime),
        statusAgendamento: { tipo: "AGENDAMENTO", nome: "PENDENTE" },
        observacao: formData.observacao || "",
        pedido: formData.pedido?.originalData || formData.pedido || null,
        endereco: {
          rua: formData.rua,
          complemento: formData.complemento || "",
          cep: formData.cep,
          cidade: formData.cidade,
          bairro: formData.bairro,
          uf: formData.uf,
          pais: formData.pais,
          numero: formData.numero,
        },
        funcionarios: funcionariosPayload,
        produtos: [],
      };
      const resp = await fetch("http://localhost:3000/api/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error("Erro ao salvar");
      const result = await resp.json();
      onSave?.(result);
      onClose?.();
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white border border-gray-200 rounded-xl p-10 m-3 min-h-[650px] min-w-[750px] shadow-2xl flex flex-col"
        onClick={(e) => e?.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5">
          <h2 className="text-2xl font-bold text-gray-900">Novo Agendamento</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={24} />
          </Button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col gap-6 overflow-y-auto "
        >
          {errors?.submit && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.submit}
            </div>
          )}

          {/* Row 1: Tipo de Agendamento & Pedido */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 pb-2 text-left">
                Tipo de agendamento *
              </label>
              <Select
                value={formData?.tipoAgendamento}
                onChange={(value) =>
                  handleInputChange("tipoAgendamento", value)
                }
                options={categoryOptions}
              />
              {errors?.tipoAgendamento && (
                <span className="text-red-500 text-sm">
                  {errors.tipoAgendamento}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 pb-2 text-left">
                Pedido
              </label>
              <Select
                value={formData?.pedido}
                onChange={(value) => handleInputChange("pedido", value)}
                options={pedidoOptions}
                loading={loadingPedidos}
              />
            </div>
          </div>

          {/* Row 2: Funcionários */}
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-medium text-gray-700 text-left col-span-2">
              Selecione os funcionários responsáveis
            </label>
            <MultipleSelectCheckmarks
              className="col-span-2"
              placeholder="Escolha uma ou mais opções"
              options={funcionariosOptions}
              loading={loadingFuncionarios}
              value={selectedFuncionarios}
              onChange={setSelectedFuncionarios}
              searchable
              clearable
            />
          </div>

          {/* Row 3: Data & Horário */}
          <div className="grid grid-cols-11 gap-4">
            <div className="col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Data do evento *
              </label>
              <Input
                type="text"
                value={formData?.eventDate}
                onChange={(e) =>
                  handleInputChange("eventDate", e?.target?.value)
                }
                placeholder="DD/MM/AAAA"
                error={errors?.eventDate}
                maxLength={10}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Horário início *
              </label>
              <Input
                type="time"
                value={formData?.startTime}
                onChange={(e) =>
                  handleInputChange("startTime", e?.target?.value)
                }
                error={errors?.startTime}
                className="w-30"
              />
            </div>
            <div className="col-span-1 flex justify-center items-center text-gray-700">
              até
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Horário fim *
              </label>
              <Input
                type="time"
                value={formData?.endTime}
                onChange={(e) => handleInputChange("endTime", e?.target?.value)}
                error={errors?.endTime}
                className="w-30"
              />
            </div>
          </div>

          {/* Row 4: Rua & CEP */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Rua *
              </label>
              <Input
                type="text"
                value={formData?.rua}
                onChange={(e) => handleInputChange("rua", e?.target?.value)}
                placeholder="Digite o nome da rua"
                error={errors?.rua}
              />
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
                {loading ? "Salvando..." : "Próximo"}
              </Button>
            </div>
          </div>

          {/* Row 5: Número & Complemento */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Número *
              </label>
              <Input
                type="text"
                value={formData?.numero}
                onChange={(e) => handleInputChange("numero", e?.target?.value)}
                placeholder="Número"
                error={errors?.numero}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Complemento
              </label>
              <Input
                type="text"
                value={formData?.complemento}
                onChange={(e) =>
                  handleInputChange("complemento", e?.target?.value)
                }
                placeholder="Complemento (opcional)"
              />
            </div>
          </div>

          {/* Row 6: Bairro & Cidade */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Bairro *
              </label>
              <Input
                type="text"
                value={formData?.bairro}
                onChange={(e) => handleInputChange("bairro", e?.target?.value)}
                placeholder="Digite o bairro"
                error={errors?.bairro}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Cidade *
              </label>
              <Input
                type="text"
                value={formData?.cidade}
                onChange={(e) => handleInputChange("cidade", e?.target?.value)}
                placeholder="Digite a cidade"
                error={errors?.cidade}
              />
            </div>
          </div>

          {/* Row 7: UF & País */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                UF *
              </label>
              <Input
                type="text"
                value={formData?.uf}
                onChange={(e) => handleInputChange("uf", e?.target?.value)}
                placeholder="Digite a UF"
                error={errors?.uf}
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                País *
              </label>
              <Input
                type="text"
                value={formData?.pais}
                onChange={(e) => handleInputChange("pais", e?.target?.value)}
                placeholder="Digite o país"
                error={errors?.pais}
              />
            </div>
          </div>

          {/* Row 8: Observação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Observação
            </label>
            <Input
              type="text"
              value={formData?.observacao}
              onChange={(e) => handleInputChange("observacao", e?.target?.value)}
              placeholder="Adicione uma observação (opcional)"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end align-items-center pt-4 border-gray-200 gap-1">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              iconName="Plus"
              iconPosition="left"
              size="md"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Criar Agendamento"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCreateModal;