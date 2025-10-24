import React, { useState } from 'react';
import { Package, X, ChevronDown } from 'lucide-react';

/**
 * Componente Modal para criação de um Novo Produto
 * Implementa os campos: Nome, Unidade de Medida, Preço e Descrição.
 * @param {object} props
 * @param {boolean} props.isOpen - Estado para controlar se o modal está aberto.
 * @param {function} props.onClose - Função para fechar o modal.
 */
const NovoProdutoModal = ({ isOpen, onClose }) => {
    // Estado para os dados do formulário (simulação)
    const [formData, setFormData] = useState({
        nome: '',
        unidade: 'Unidade',
        preco: 'R$ 0,00',
        descricao: ''
    });

    if (!isOpen) return null;

    // Função de exemplo para simular o salvamento
    const handleSave = () => {
        console.log("Salvando novo produto:", formData);
        onClose(); 
    };

    // Previne que o modal feche se o usuário clicar dentro do conteúdo
    const handleModalContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        // Overlay com Backdrop Blur (Desfoque de Fundo) e fundo quase transparente
        // O desfoque faz o trabalho de ofuscar o conteúdo por trás, dando ênfase ao modal.
        <div 
            // backdrop-blur-sm aplica o desfoque. bg-black/5 é quase transparente, mas ajuda a sutilmente escurecer.
            className="fixed inset-0 bg-black/5 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose} 
        >
            {/* Conteúdo do Modal (com sombra forte para dar ênfase) */}
            <div 
                className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-auto"
                onClick={handleModalContentClick}
            >
                
                {/* Cabeçalho do Modal */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <Package className="w-6 h-6 text-[#003d6b]" />
                        <h2 className="text-xl font-bold text-gray-900">Novo produto</h2>
                    </div>
                    {/* Botão Fechar (X) */}
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full"
                        aria-label="Fechar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Corpo do Formulário */}
                <div className="p-6 space-y-5">
                    
                    {/* Linha 1: Nome do produto */}
                    <div>
                        <label htmlFor="nomeProduto" className="block text-sm font-medium text-gray-700 mb-1">
                            Nome do produto
                        </label>
                        <input
                            type="text"
                            id="nomeProduto"
                            placeholder="Nome do produto"
                            className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-[#003d6b] focus:border-[#003d6b] text-sm"
                            onChange={(e) => setFormData({...formData, nome: e.target.value})}
                        />
                    </div>

                    {/* Linha 2: Unidade de medida e Preço do produto */}
                    <div className="flex space-x-4">
                        {/* Unidade de medida */}
                        <div className="flex-1">
                            <label htmlFor="unidadeMedida" className="block text-sm font-medium text-gray-700 mb-1">
                                Unidade de medida
                            </label>
                            <div className="relative">
                                <select 
                                    id="unidadeMedida"
                                    className="w-full border border-gray-300 rounded-md shadow-sm p-3 appearance-none focus:ring-[#003d6b] focus:border-[#003d6b] text-sm bg-white"
                                    defaultValue="Unidade"
                                    onChange={(e) => setFormData({...formData, unidade: e.target.value})}
                                >
                                    <option>Unidade</option>
                                    <option>Metro</option>
                                    <option>Kg</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        
                        {/* Preço do produto */}
                        <div className="flex-1">
                            <label htmlFor="precoProduto" className="block text-sm font-medium text-gray-700 mb-1">
                                Preço do produto
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="precoProduto"
                                    placeholder="0,00"
                                    defaultValue="R$ 0,00"
                                    className="w-full border border-gray-300 rounded-md shadow-sm pl-8 pr-3 py-3 focus:ring-[#003d6b] focus:border-[#003d6b] text-sm"
                                    onChange={(e) => setFormData({...formData, preco: e.target.value})}
                                />
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
                            </div>
                        </div>
                    </div>

                    {/* Linha 3: Descrição do produto */}
                    <div>
                        <label htmlFor="descricaoProduto" className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição do produto
                        </label>
                        <textarea
                            id="descricaoProduto"
                            rows="2"
                            placeholder="Adicione sua descrição"
                            className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-[#003d6b] focus:border-[#003d6b] text-sm resize-none"
                            onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                        />
                    </div>
                    
                    {/* Adicionar mais especificações */}
                    <button className="flex items-center gap-2 text-[#007EA7] hover:text-[#003d6b] font-semibold text-sm transition-colors">
                        <span className="text-xl leading-none">+</span> Adicionar mais especificações
                    </button>

                </div>

                {/* Rodapé do Modal (Botões de Ação) */}
                <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-semibold text-sm"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-4 py-2 bg-[#007EA7] text-white rounded-md hover:bg-[#003d6b] transition-colors font-semibold text-sm"
                    >
                        Salvar Produto
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NovoProdutoModal;