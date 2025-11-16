import React, { useState, useEffect } from "react";
import Icon from "../AppIcon";
import Button from "../buttons/button.component";
import Input from "./Input";
import Select from "./Select";

const categoryOptions = [
  { value: "SERVICO", label: "Prestação de serviço", color: "#3B82F6" },
  { value: "ORCAMENTO", label: "Orçamento", color: "#FBBF24" },
];

const TaskCreateModal = ({ isOpen, onClose, onSave, initialData = {} }) => {
  const [formData, setFormData] = useState({
    clientName: "",
    category: "SERVICO",
    eventDate: "",
    startTime: "",
    endTime: "",
    local: "",
    streetName: "",
    cep: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        clientName: initialData?.clientName || "",
        category: initialData?.category || "service",
        eventDate: initialData?.eventDate || "",
        startTime: initialData?.startTime || "",
        endTime: initialData?.endTime || "",
        local: initialData?.local || "",
        streetName: initialData?.streetName || "",
        cep: initialData?.cep || "",
        number: initialData?.number || "",
        complement: initialData?.complement || "",
        neighborhood: initialData?.neighborhood || "",
        city: initialData?.city || "",
      });
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors?.[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData?.clientName?.trim())
      newErrors.clientName = (
        <>
          <span className="text-red-500 text-left">
            * Nome do cliente é obrigatório
          </span>
        </>
      );
    if (!formData?.eventDate)
      newErrors.eventDate = (
        <>
          <span className="text-red-500 text-left">
            * Data do evento é obrigatória
          </span>
        </>
      );
    if (!formData?.local?.trim())
      newErrors.local = (
        <>
          <span className="text-red-500 text-left">* Local é obrigatório</span>
        </>
      );
    if (!formData?.streetName?.trim())
      newErrors.streetName = (
        <>
          <span className="text-red-500 text-left">
            * Nome da rua é obrigatório
          </span>
        </>
      );
    if (!formData?.cep?.trim())
      newErrors.cep = (
        <>
          <span className="text-red-500 text-left">* CEP é obrigatório</span>
        </>
      );
    if (!formData?.number?.trim())
      newErrors.number = (
        <>
          <span className="text-red-500 text-left">* Número é obrigatório</span>
        </>
      );
    if (!formData?.neighborhood?.trim())
      newErrors.neighborhood = (
        <>
          <span className="text-red-500 text-left">* Bairro é obrigatório</span>
        </>
      );
    if (!formData?.city?.trim())
      newErrors.city = (
        <>
          <span className="text-red-500 text-left">* Cidade é obrigatória</span>
        </>
      );
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      const selectedCategory = categoryOptions.find(
        (cat) => cat.value === formData.category
      );
      const formDataWithColor = {
        ...formData,
        backgroundColor: selectedCategory?.color || "#3B82F6",
      };
      onSave?.(formDataWithColor);
      onClose?.();
    }
  };

  const handleKeyDown = (e) => {
    if (e?.key === "Escape") onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 bg-opacity-10 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white border border-gray-200 rounded-xl p-10 m-3 min-h-[700px] min-w-[750px] shadow-2xl flex flex-col"
        onClick={(e) => e?.stopPropagation()}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-2xl font-bold text-gray-900">Novo Agendamento</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={22} />
          </Button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col gap-6 overflow-y-auto p-1.5"
        >
          {/* Row 1: Nome do cliente & Tipo de serviço */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Nome do cliente *
              </label>
              <Input
                type="text"
                value={formData?.clientName}
                onChange={(e) =>
                  handleInputChange("clientName", e?.target?.value)
                }
                placeholder="Digite o nome do cliente"
                error={errors?.clientName}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Tipo de serviço *
              </label>
              <Select
                value={formData?.category}
                onChange={(value) => handleInputChange("category", value)}
                options={categoryOptions}
                renderOption={(option) => (
                  <div className="flex items-start">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: option.color }}
                    />
                    <span>{option.label}</span>
                  </div>
                )}
              />
            </div>
          </div>

          {/* Row 2: Data & Horário */}
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
                Horário *
              </label>
              <Input
                type="time"
                value={formData?.startTime}
                onChange={(e) =>
                  handleInputChange("startTime", e?.target?.value)
                }
                placeholder="Horário do evento"
                error={errors?.eventTime}
                className="w-30"
              />
            </div>
            <div className="col-span-1 flex justify-center items-center text-gray-700">
              até
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Horário fim*
              </label>
              <Input
                type="time"
                value={formData?.endTime}
                onChange={(e) =>
                  handleInputChange("endTime", e?.target?.value)
                }
                error={errors?.eventTime}
                className="w-30"
              />
            </div>
          </div>

          {/* Row 3: Local */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Local *
            </label>
            <Input
              type="text"
              value={formData?.local}
              onChange={(e) => handleInputChange("local", e?.target?.value)}
              placeholder="Ex: Salão, residência, empresa..."
              error={errors?.local}
            />
          </div>

          {/* Row 4: Nome da rua & CEP */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Nome da rua *
              </label>
              <Input
                type="text"
                value={formData?.streetName}
                onChange={(e) =>
                  handleInputChange("streetName", e?.target?.value)
                }
                placeholder="Digite o nome da rua"
                error={errors?.streetName}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                CEP *
              </label>
              <Input
                type="text"
                value={formData?.cep}
                onChange={(e) => handleInputChange("cep", e?.target?.value)}
                placeholder="Digite o CEP"
                error={errors?.cep}
                maxLength={9}
              />
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
                value={formData?.number}
                onChange={(e) => handleInputChange("number", e?.target?.value)}
                placeholder="Número"
                error={errors?.number}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Complemento
              </label>
              <Input
                type="text"
                value={formData?.complement}
                onChange={(e) =>
                  handleInputChange("complement", e?.target?.value)
                }
                placeholder="Complemento (opcional)"
                error={errors?.complement}
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
                value={formData?.neighborhood}
                onChange={(e) =>
                  handleInputChange("neighborhood", e?.target?.value)
                }
                placeholder="Digite o bairro"
                error={errors?.neighborhood}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Cidade *
              </label>
              <Input
                type="text"
                value={formData?.city}
                onChange={(e) => handleInputChange("city", e?.target?.value)}
                placeholder="Digite a cidade"
                error={errors?.city}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end align-items-center pt-6 border-t border-gray-200 gap-1">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              iconName="Plus"
              iconPosition="left"
              size="md"
              className="btn-primary"
            >
              Criar Agendamento
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCreateModal;
