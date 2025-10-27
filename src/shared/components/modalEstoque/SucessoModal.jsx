import React from "react";
import { CheckCircle } from "lucide-react";

const SucessoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl p-4 w-full max-w-sm mx-auto text-center"
        onClick={handleModalContentClick}
      >
        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-4" />

        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Produto salvo com sucesso
        </h3>

        <p className="text-sm text-gray-500">
          O produto foi atualizado no sistema
        </p>
      </div>
    </div>
  );
};

export default SucessoModal;