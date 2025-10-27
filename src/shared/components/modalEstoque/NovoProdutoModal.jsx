import React, { useState, useEffect } from "react";
import { Package, ChevronDown } from "lucide-react";

const DEFAULT_FORM_DATA = {
  nome: "",
  descricao: "",
  preco: 0,
  quantidade: 0,
  estoqueMinimo: 0,
  tipo: "Ferragens",
  detalhes: {
    espessura: "",
    unidadeMedida: "Unidade",
    tipoVidro: "",
    cor: "",
    aplicacao: "",
    acabamento: "",
    valorCompra: 0,
    valorVenda: 0,
    movimentos: [],
  },
};

const NovoProdutoModal = ({ isOpen, onClose, onSave, item = null }) => {
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const isEditing = item !== null;

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({
          ...DEFAULT_FORM_DATA, 
          ...item,
          detalhes: item.detalhes ? item.detalhes : DEFAULT_FORM_DATA.detalhes
        });
      } else {
        setFormData(DEFAULT_FORM_DATA);
      }
    }
  }, [item, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      detalhes: {
        ...prev.detalhes,
        [name]: value,
      },
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto max-h-[90vh] flex flex-col"
        onClick={handleModalContentClick}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 p-2 rounded">
              <Package className="w-5 h-5 text-gray-700" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? "Editar Produto" : "Novo Produto"}
            </h2>
          </div>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-900 mb-1.5">
                Nome do produto
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                placeholder="Nome do produto"
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7] text-sm placeholder:text-gray-400"
                value={formData.nome}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-900 mb-1.5">
                Descrição
              </label>
              <input
                type="text"
                id="descricao"
                name="descricao"
                placeholder="Adicione sua descrição"
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7] text-sm placeholder:text-gray-400"
                value={formData.descricao}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="preco" className="block text-sm font-medium text-gray-900 mb-1.5">
                Preço (Venda)
              </label>
              <input
                type="number"
                id="preco"
                name="preco"
                placeholder="R$ 0,00"
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7] text-sm placeholder:text-gray-400"
                value={formData.preco}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="quantidade" className="block text-sm font-medium text-gray-900 mb-1.5">
                Quantidade
              </label>
              <input
                type="number"
                id="quantidade"
                name="quantidade"
                placeholder="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7] text-sm placeholder:text-gray-400"
                value={formData.quantidade}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="estoqueMinimo" className="block text-sm font-medium text-gray-900 mb-1.5">
                Estoque Mínimo
              </label>
              <input
                type="number"
                id="estoqueMinimo"
                name="estoqueMinimo"
                placeholder="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7] text-sm placeholder:text-gray-400"
                value={formData.estoqueMinimo}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="tipo" className="block text-sm font-medium text-gray-900 mb-1.5">
                Tipo de Produto
              </label>
              <div className="relative">
                <select
                  id="tipo"
                  name="tipo"
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 appearance-none focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7] text-sm bg-white"
                  value={formData.tipo}
                  onChange={handleChange}
                >
                  <option>Vidros</option>
                  <option>Ferragens</option>
                  <option>Acessórios</option>
                  <option>Ferramentas</option>
                  <option>EPIS</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <h3 className="text-md font-semibold text-gray-800 pt-2 border-t mt-4">
            Detalhes (Opcional)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="unidadeMedida" className="block text-sm font-medium text-gray-900 mb-1.5">
                Unidade de medida
              </label>
              <div className="relative">
                <select
                  id="unidadeMedida"
                  name="unidadeMedida"
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 appearance-none focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7] text-sm bg-white"
                  value={formData.detalhes.unidadeMedida}
                  onChange={handleDetailsChange}
                >
                  <option>Unidade</option>
                  <option>m²</option>
                  <option>Kg</option>
                  <option>Litro</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label htmlFor="valorCompra" className="block text-sm font-medium text-gray-900 mb-1.5">
                Valor Compra
              </label>
              <input
                type="number"
                id="valorCompra"
                name="valorCompra"
                placeholder="R$ 0,00"
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7] text-sm placeholder:text-gray-400"
                value={formData.detalhes.valorCompra}
                onChange={handleDetailsChange}
              />
            </div>
            <div>
              <label htmlFor="valorVenda" className="block text-sm font-medium text-gray-900 mb-1.5">
                Valor Venda (Detalhe)
              </label>
              <input
                type="number"
                id="valorVenda"
                name="valorVenda"
                placeholder="R$ 0,00"
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7] text-sm placeholder:text-gray-400"
                value={formData.detalhes.valorVenda}
                onChange={handleDetailsChange}
              />
            </div>
            <div>
              <label htmlFor="espessura" className="block text-sm font-medium text-gray-900 mb-1.5">
                Espessura
              </label>
              <input
                type="text"
                id="espessura"
                name="espessura"
                placeholder="ex: 4 mm"
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7] text-sm placeholder:text-gray-400"
                value={formData.detalhes.espessura}
                onChange={handleDetailsChange}
              />
            </div>
            <div>
              <label htmlFor="tipoVidro" className="block text-sm font-medium text-gray-900 mb-1.5">
                Tipo de vidro
              </label>
              <input
                type="text"
                id="tipoVidro"
                name="tipoVidro"
                placeholder="ex: Temperado"
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7] text-sm placeholder:text-gray-400"
                value={formData.detalhes.tipoVidro}
                onChange={handleDetailsChange}
              />
            </div>
            <div>
              <label htmlFor="cor" className="block text-sm font-medium text-gray-900 mb-1.5">
                Cor
              </label>
              <input
                type="text"
                id="cor"
                name="cor"
                placeholder="ex: Incolor"
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7] text-sm placeholder:text-gray-400"
                value={formData.detalhes.cor}
                onChange={handleDetailsChange}
              />
            </div>
            <div className="md:col-span-3">
              <label htmlFor="aplicacao" className="block text-sm font-medium text-gray-900 mb-1.5">
                Aplicação
              </label>
              <input
                type="text"
                id="aplicacao"
                name="aplicacao"
                placeholder="ex: Janelas, portas..."
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7] text-sm placeholder:text-gray-400"
                value={formData.detalhes.aplicacao}
                onChange={handleDetailsChange}
              />
            </div>
            <div className="md:col-span-3">
              <label htmlFor="acabamento" className="block text-sm font-medium text-gray-900 mb-1.5">
                Acabamento
              </label>
              <input
                type="text"
                id="acabamento"
                name="acabamento"
                placeholder="ex: Corte reto"
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7] text-sm placeholder:text-gray-400"
                value={formData.detalhes.acabamento}
                onChange={handleDetailsChange}
              />
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-2 mt-auto">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#007EA7] text-white rounded-md hover:bg-[#006891] transition-colors font-medium text-sm"
          >
            {isEditing ? "Salvar Alterações" : "Salvar Produto"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NovoProdutoModal;