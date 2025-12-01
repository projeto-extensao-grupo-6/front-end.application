import React from 'react';
import { Check } from 'lucide-react';

export default function ModalConfirmacao({ 
  aberto, 
  tipo = 'aprovar', 
  titulo,
  mensagem,
  textoBotaoConfirmar,
  textoBotaoCancelar = 'Cancelar',
  onConfirmar,
  onCancelar 
}) {
  if (!aberto) return null;

  const estilos = {
    aprovar: {
      iconeBg: 'bg-green-100',
      iconeCor: 'text-green-600',
      botao: 'bg-[#007EA7] hover:bg-[#006b8f]'
    },
    recusar: {
      iconeBg: 'bg-yellow-100',
      iconeCor: 'text-yellow-600',
      botao: 'bg-[#007EA7] hover:bg-[#006b8f]'
    }
  };

  const estilo = estilos[tipo];

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full ${estilo.iconeBg} flex items-center justify-center`}>
            {tipo === 'aprovar' ? (
              <Check className={`w-6 h-6 ${estilo.iconeCor}`} />
            ) : (
              <svg className={`w-6 h-6 ${estilo.iconeCor}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {titulo}
            </h3>
            <p className="text-sm text-gray-600">
              {mensagem}
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onCancelar}
            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {textoBotaoCancelar}
          </button>
          <button
            onClick={onConfirmar}
            className={`px-6 py-2 rounded-md text-sm font-medium text-white transition-colors ${estilo.botao}`}
          >
            {textoBotaoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}