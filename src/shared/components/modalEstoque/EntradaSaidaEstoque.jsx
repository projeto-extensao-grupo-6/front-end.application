import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, ChevronDown, Hash, AlertCircle } from 'lucide-react';
import Api from '../../../axios/Api';
import { useNavigate } from 'react-router-dom';

const EntradaSaidaEstoque = ({ isOpen, onClose, itemIds, estoque }) => {
    const navigate = useNavigate();
    const [tipoMovimento, setTipoMovimento] = useState('entrada');
    const [quantidade, setQuantidade] = useState(1);
    const [itemsInfo, setItemsInfo] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen && itemIds.length > 0) {
            // Pega apenas o primeiro item já que é um registro por vez
            const item = estoque.find(item => item.id === itemIds[0]);
            console.log('EntradaSaidaEstoque: item selecionado', item);
            if (item) {
                setItemsInfo([{ 
                    id: item.id, 
                    nome: item.produto.nome, 
                    unidade: item.detalhes?.unidadeMedida || 'Unidade',
                    localizacao: item.localizacao || 'localizacao_20f384d35f5f'
                }]);
            }

            setTipoMovimento('entrada');
            setQuantidade(1);
            setError('');
            setSuccess(false);
        } else if (!isOpen) {
            setItemsInfo([]);
            setError('');
            setSuccess(false);
        }
    }, [isOpen, itemIds, estoque]);

    const handleSaveClick = async () => {
        setError('');
        setLoading(true);

        try {
            const endpoint = tipoMovimento === 'entrada' ? '/estoques/entrada' : '/estoques/saida';
            
            const item = itemsInfo[0];
            const requestBody = {
                produtoId: item.id,
                localizacao: item.localizacao,
                quantidadeTotal: parseInt(quantidade, 10) || 0
            };

            const response = await Api.post(endpoint, requestBody);
            
            setSuccess(true);
            
            setTimeout(() => {
                onClose();
                navigate(0); 
            }, 1000);

        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Erro ao registrar movimento';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleModalContentClick = (e) => {
        e.stopPropagation();
    };

    if (!isOpen || itemIds.length === 0) return null;

    const unidadeMedida = itemsInfo.length > 0 ? itemsInfo[0].unidade : 'Unidade';

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto max-h-[90vh] flex flex-col"
                onClick={handleModalContentClick}
            >
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded">
                            <ArrowRightLeft className="w-5 h-5 text-blue-700" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Registrar Movimento de Estoque</h2>
                    </div>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto">
                    {/* Produto Selecionado - Design Melhorado */}
                    <div className='p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-lg'>
                       <p className='text-xs font-semibold text-blue-900 uppercase tracking-wide mb-3'>
                            Produto Selecionado
                       </p>
                       <br />
                       <div className='flex items-center gap-3 text-sm bg-white/80 px-4 py-3 rounded-lg shadow-sm'>
                            <div className='w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0'></div>
                            <span className='font-bold text-gray-900 text-base'>{itemsInfo[0]?.nome || 'Carregando...'}</span>
                       </div>
                    </div>

                    {/* Mensagem de Erro */}
                    {error && (
                        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3 shadow-sm">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-red-900 mb-1">Erro ao processar</p>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Mensagem de Sucesso */}
                    {success && (
                        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg shadow-sm">
                            <p className="text-sm font-semibold text-green-900 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                                Movimento registrado com sucesso!
                            </p>
                        </div>
                    )}
                    <br />
                    {/* Tipo de Movimento - Design Melhorado */}
                    <div className="space-y-2">
                        <label htmlFor="tipoMovimento" className="block text-sm font-semibold text-gray-900">
                            Tipo de Movimento
                        </label>
                        <div className='relative group'>
                            <select
                                id="tipoMovimento"
                                className="w-full border-2 border-gray-200 rounded-lg pl-11 pr-10 py-3 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-all hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed font-medium"
                                value={tipoMovimento}
                                onChange={(e) => setTipoMovimento(e.target.value)}
                                disabled={loading}
                            >
                                <option value="entrada"> Entrada</option>
                                <option value="saida">Saída</option>
                                <option value="reserva"> Reserva</option>
                            </select>
                            <ArrowRightLeft className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-600 pointer-events-none" />
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                    </div>
                    <br />
                    {/* Quantidade - Design Melhorado */}
                    <div className="space-y-2">
                        <label htmlFor="quantidade" className="block text-sm font-semibold text-gray-900">
                            Quantidade
                            <span className="ml-2 text-xs font-normal text-gray-500">({unidadeMedida})</span>
                        </label>
                        <div className='relative'>
                            <input
                                type="number"
                                id="quantidade"
                                min="1"
                                className="w-full border-2 border-gray-200 rounded-lg pl-11 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed font-medium"
                                placeholder="Digite a quantidade"
                                value={quantidade}
                                onChange={(e) => setQuantidade(e.target.value)}
                                disabled={loading}
                            />
                            <Hash className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-600 pointer-events-none" />
                        </div>
                        {quantidade > 0 && (
                            <p className="text-xs text-gray-500 flex items-center gap-1.5 ml-1">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                                </svg>
                                Total: {tipoMovimento} de {quantidade} {quantidade > 1 ? unidadeMedida + 's' : unidadeMedida}
                            </p>
                        )}
                    </div>
                </div>

                {/* Botões de Ação - Design Melhorado */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 mt-auto">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-5 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSaveClick}
                        disabled={loading || quantidade <= 0 || success}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Processando...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Salvar Movimento
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EntradaSaidaEstoque;