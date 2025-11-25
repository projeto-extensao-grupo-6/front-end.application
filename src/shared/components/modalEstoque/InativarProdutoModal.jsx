import React from "react";
import { AlertTriangle } from "lucide-react";

const InativarProdutoModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm mx-auto text-center"
        onClick={handleModalClick}
      >
        <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-4" />

        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Inativar Produto
        </h3>
        <br />
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          Esta ação não irá deletar o produto.  
          Ele apenas será marcado como <strong>inativo</strong> para fins de histórico
          e não aparecerá mais nas operações ativas.
        </p>
        <br />
        <div className="flex items-center justify-between mt-4 gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
          >
            Inativar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InativarProdutoModal;