import React, { useState, useEffect } from "react";
import { Package, ChevronDown, Plus, X } from "lucide-react";

const DEFAULT_FORM_DATA = {
  nome: "",
  descricao: "",
  unidadeMedida: "Unidade",
  preco: 0,
  ativo: true,
  atributos: [],
  nivelMinimo: 0,
  nivelMaximo: 0,
  qtdTotal: 0,
  localizacao: "",
};

const NovoProdutoModal = ({ isOpen, onClose, onSave, item = null }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const isEditing = item !== null;

  const steps = [
    { id: 0, name: "Informações Básicas" },
    { id: 1, name: "Atributos" },
    { id: 2, name: "Métricas" },
    { id: 3, name: "Estoque (Opcional)" },
  ];

  useEffect(() => {
    if (isOpen) {
      setFormData(item ? { ...DEFAULT_FORM_DATA, ...item } : DEFAULT_FORM_DATA);
      setCurrentStep(0);
    }
  }, [item, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddAtributo = () => {
    setFormData((prev) => ({
      ...prev,
      atributos: [...prev.atributos, { tipo: "", valor: "" }],
    }));
  };

  const handleRemoveAtributo = (index) => {
    setFormData((prev) => ({
      ...prev,
      atributos: prev.atributos.filter((_, i) => i !== index),
    }));
  };

  const handleAtributoChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      atributos: prev.atributos.map((attr, i) =>
        i === index ? { ...attr, [field]: value } : attr
      ),
    }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-start z-50 px-10 py-20 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-center px-8 py-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2.5 rounded-lg">
              <Package className="w-6 h-6 text-[#007EA7]" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center">
              {isEditing ? "Editar Produto" : "Novo Produto"}
            </h2>
          </div>
        </div>

        {/* Stepper */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      index <= currentStep
                        ? "bg-[#007EA7] text-white shadow-md"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`text-xs mt-3 text-center ${
                      index <= currentStep ? "text-gray-900 font-semibold" : "text-gray-500"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mb-8 mx-3 rounded-full ${
                      index < currentStep ? "bg-[#007EA7]" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="px-8 py-8 space-y-[6  5px] overflow-y-auto flex-1">

          {/* ------------------------------- */}
          {/* Etapa 1 - Informações Básicas */}
          {/* ------------------------------- */}
          {currentStep === 0 && (
            <div className="space-y-[6  5px]">

              {/* Nome */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">
                  Nome do produto
                </label>
                <input
                  type="text"
                  name="nome"
                  placeholder="Digite o nome do produto"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-left"
                  value={formData.nome}
                  onChange={handleChange}
                />
              </div>

              {/* Unidade + Preço */}
              <div className="grid grid-cols-2 gap-[35px]">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">
                    Unidade de medida
                  </label>
                  <div className="relative">
                    <select
                      name="unidadeMedida"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-left appearance-none"
                      value={formData.unidadeMedida}
                      onChange={handleChange}
                    >
                      <option>Unidade</option>
                      <option>m²</option>
                      <option>Kg</option>
                      <option>Litro</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">
                    Preço do produto
                  </label>
                  <input
                    type="number"
                    name="preco"
                    placeholder="R$ 0,00"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-left"
                    value={formData.preco}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">
                  Descrição do produto
                </label>
                <textarea
                  name="descricao"
                  placeholder="Adicione uma descrição detalhada do produto"
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 resize-none text-left"
                  value={formData.descricao}
                  onChange={handleChange}
                />
              </div>

              {/* Ativo */}
              <div className="flex items-center gap-4 pt-2">
                <input
                  type="checkbox"
                  name="ativo"
                  className="w-5 h-5 text-[#007EA7]"
                  checked={formData.ativo}
                  onChange={handleChange}
                />
                <label className="text-sm text-gray-900">Produto Ativo</label>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-[6  5px]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 text-left">
                    Atributos do Produto
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 text-left">
                    Adicione características específicas
                  </p>
                </div>

                <button
                  onClick={handleAddAtributo}
                  className="px-4 py-2 bg-[#007EA7] text-white rounded-lg shadow hover:bg-[#006891]"
                >
                  <Plus className="inline-block w-4 h-4 mr-2" />
                  Adicionar
                </button>
              </div>

              {formData.atributos.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                  <Plus className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Clique em "Adicionar"</p>
                </div>
              ) : (
                <div className="space-y-[6  5px]">
                  {formData.atributos.map((attr, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg border">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-2 text-left">
                          Tipo
                        </label>
                        <input
                          type="text"
                          placeholder="Cor, Tamanho..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-left"
                          value={attr.tipo}
                          onChange={(e) =>
                            handleAtributoChange(index, "tipo", e.target.value)
                          }
                        />
                      </div>

                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-2 text-left">
                          Valor
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Azul, Grande"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-left"
                          value={attr.valor}
                          onChange={(e) =>
                            handleAtributoChange(index, "valor", e.target.value)
                          }
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveAtributo(index)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-lg mt-6"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-[6  5px]">
              <div className="text-left">
                <h3 className="text-base font-semibold text-gray-900">Métricas de Estoque</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Defina limites de estoque
                </p>
              </div>

              <div className="grid grid-cols-2 gap-[35px]">
                <div className="bg-blue-50 p-4 rounded-lg border">
                  <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">
                    Nível Mínimo
                  </label>
                  <input
                    type="number"
                    name="nivelMinimo"
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-left"
                    value={formData.nivelMinimo}
                    onChange={handleChange}
                  />
                </div>

                <div className="bg-green-50 p-4 rounded-lg border">
                  <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">
                    Nível Máximo
                  </label>
                  <input
                    type="number"
                    name="nivelMaximo"
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-left"
                    value={formData.nivelMaximo}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-[6  5px]">

              <div className="grid grid-cols-2 gap-[35px]">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">
                    Quantidade Total
                  </label>
                  <input
                    type="number"
                    name="qtdTotal"
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-left"
                    value={formData.qtdTotal}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">
                    Localização
                  </label>
                  <input
                    type="text"
                    name="localizacao"
                    placeholder="Ex: Prateleira A3"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-left"
                    value={formData.localizacao}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t bg-gray-50 flex justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700"
          >
            Cancelar
          </button>

          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700"
              >
                Voltar
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-2.5 bg-[#007EA7] text-white rounded-lg"
              >
                Próxima Etapa
              </button>
            ) : (
              <button
                onClick={() => onSave(formData)}
                className="px-6 py-2.5 bg-[#007EA7] text-white rounded-lg"
              >
                {isEditing ? "Salvar Alterações" : "Salvar Produto"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovoProdutoModal;