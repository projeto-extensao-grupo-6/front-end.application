import React from "react";

function BtnNovoCliente({ onClick }) {
  return (
    <button 
      className="min-w-[131px] h-[34px] relative rounded opacity-100 px-3 py-2 gap-1.5 flex items-center justify-center border-none cursor-pointer box-border bg-[#007EA7] text-white text-sm font-medium whitespace-nowrap transition-colors hover:bg-gray-300 active:bg-gray-300"
      onClick={onClick}
    >
      Novo Cliente
    </button>
  );
}

export default BtnNovoCliente;