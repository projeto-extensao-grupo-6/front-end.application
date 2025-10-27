import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, CalendarDays, User, FileText, Hash, ChevronDown } from 'lucide-react'; // ChevronDown adicionado aqui

const EntradaSaidaEstoque = ({ isOpen, onClose, onSave, itemIds, estoque, funcionarios }) => {
    const today = new Date().toISOString().split('T')[0];

    const [tipoMovimento, setTipoMovimento] = useState('Entrada');
    const [dataMovimento, setDataMovimento] = useState(today);
    const [quantidade, setQuantidade] = useState(1);
    const [observacao, setObservacao] = useState('');
    const [funcionarioResponsavel, setFuncionarioResponsavel] = useState('');
    const [itemsInfo, setItemsInfo] = useState([]);

    useEffect(() => {
        if (isOpen && itemIds.length > 0) {
            const info = itemIds
                .map(id => estoque.find(item => item.id === id))
                .filter(item => item)
                .map(item => ({ id: item.id, nome: item.nome, unidade: item.detalhes?.unidadeMedida || 'Unidade' }));
            setItemsInfo(info);

            setTipoMovimento('Entrada');
            setDataMovimento(today);
            setQuantidade(1);
            setObservacao('');
            setFuncionarioResponsavel(funcionarios.length > 0 ? funcionarios[0].nome : '');
        } else if (!isOpen) {
             setItemsInfo([]);
        }
    }, [isOpen, itemIds, estoque, funcionarios, today]);


    const handleSaveClick = () => {
        const movementData = {
            tipo: tipoMovimento,
            data: dataMovimento,
            quantidade: parseInt(quantidade, 10) || 0,
            observacao: observacao,
            funcionario: funcionarioResponsavel
        };
        onSave(itemIds, movementData);
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

                <div className="p-5 space-y-4 overflow-y-auto">
                    <div className='mb-4 p-3 bg-gray-50 border rounded-md text-sm'>
                       <p className='font-medium text-gray-700 mb-1'>Itens Selecionados:</p>
                       <ul className='list-disc list-inside text-gray-600'>
                            {itemsInfo.map(info => <li key={info.id}>{info.nome}</li>)}
                       </ul>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1.5">Tipo de Movimento</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="tipoMovimento"
                                    value="Entrada"
                                    checked={tipoMovimento === 'Entrada'}
                                    onChange={(e) => setTipoMovimento(e.target.value)}
                                    className="w-4 h-4 text-[#007EA7] focus:ring-[#007EA7] border-gray-300"
                                />
                                <span className="text-sm text-gray-700">Entrada</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="tipoMovimento"
                                    value="Saída"
                                    checked={tipoMovimento === 'Saída'}
                                    onChange={(e) => setTipoMovimento(e.target.value)}
                                    className="w-4 h-4 text-[#007EA7] focus:ring-[#007EA7] border-gray-300"
                                />
                                <span className="text-sm text-gray-700">Saída</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="dataMovimento" className="block text-sm font-medium text-gray-900 mb-1.5">Data</label>
                            <div className='relative'>
                                <input
                                    type="date"
                                    id="dataMovimento"
                                    className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7] text-sm placeholder:text-gray-400"
                                    value={dataMovimento}
                                    onChange={(e) => setDataMovimento(e.target.value)}
                                />
                                <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                         <div>
                            <label htmlFor="quantidade" className="block text-sm font-medium text-gray-900 mb-1.5">
                                Quantidade ({unidadeMedida})
                             </label>
                             <div className='relative'>
                                <input
                                    type="number"
                                    id="quantidade"
                                    min="1"
                                    className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7] text-sm placeholder:text-gray-400"
                                    value={quantidade}
                                    onChange={(e) => setQuantidade(e.target.value)}
                                />
                                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="funcionarioResponsavel" className="block text-sm font-medium text-gray-900 mb-1.5">Funcionário Responsável</label>
                         <div className='relative'>
                            <select
                                id="funcionarioResponsavel"
                                className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2.5 appearance-none focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7] text-sm bg-white"
                                value={funcionarioResponsavel}
                                onChange={(e) => setFuncionarioResponsavel(e.target.value)}
                            >
                                {funcionarios.length === 0 && <option disabled>Carregando...</option>}
                                {funcionarios.map(func => (
                                    <option key={func.id} value={func.nome}>{func.nome}</option>
                                ))}
                            </select>
                             <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                             <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="observacao" className="block text-sm font-medium text-gray-900 mb-1.5">Observação</label>
                         <div className='relative'>
                            <textarea
                                id="observacao"
                                rows="3"
                                placeholder="Adicione uma observação (opcional)"
                                className="w-full border border-gray-300 rounded-md pl-10 px-3 py-2.5 focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7] text-sm resize-none placeholder:text-gray-400"
                                value={observacao}
                                onChange={(e) => setObservacao(e.target.value)}
                            />
                            <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
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
                        onClick={handleSaveClick}
                        disabled={!funcionarioResponsavel || quantidade <= 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Salvar Movimento
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EntradaSaidaEstoque;