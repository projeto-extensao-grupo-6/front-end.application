import React from "react";
import { Download } from "lucide-react";

const ExportarModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleExportar = () => {
    console.log("Exportando planilha...");
    onClose();
  };

  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto"
        onClick={handleModalContentClick}
      >
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 p-2 rounded">
              <Download className="w-5 h-5 text-gray-700" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Exportar planilha
            </h2>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-700">
            Você está prestes a exportar a visualização atual do estoque.
            Confirme para iniciar o download.
          </p>
        </div>

        <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleExportar}
            className="px-4 py-2 bg-[#007EA7] text-white rounded-md hover:bg-[#006891] transition-colors font-medium text-sm"
          >
            Exportar Planilha
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportarModal;