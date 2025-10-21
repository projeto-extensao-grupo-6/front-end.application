import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";

function SuccessModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]"
      onClick={onClose}
    >
      <div 
        className="w-[553px] h-[204px] bg-white rounded-lg border
         border-gray-200 shadow-2xl p-6 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end gap-4 text-start p-2" >
          <FontAwesomeIcon 
            icon={faCircleCheck} 
            className="text-green-500 text-5xl"
          />
          <div className="flex flex-col ">
            <h2 className="text-xl font-bold text-gray-800 mb-1">
                 Cliente cadastrado com sucesso!
            </h2>
            <p className="text-sm text-gray-600">
              {message || "Ação realizada com sucesso."}
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button 
            type="button" 
            className="px-6 py-2 bg-gray-100 text-gray-800 border
            border-gray-300 rounded-md font-semibold text-sm hover:bg-gray-200 transition-colors"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            type="button" 
            className="px-6 py-2 bg-blue-500 text-white rounded-md font-semibold
            text-sm hover:bg-blue-600 transition-colors"
            onClick={onConfirm}
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessModal;