import React from "react";

function ColumnsBox() {
  return (
    <div className="w-full h-[50px] min-h-[50px] flex items-center justify-between bg-gray-50 border-b border-gray-200 px-4 box-border">
      <span className="flex-1 font-roboto font-semibold text-sm leading-5 text-gray-800 text-center">Nome</span>
      <span className="flex-1 font-roboto font-semibold text-sm leading-5 text-gray-800 text-center">Contato</span>
      <span className="flex-1 font-roboto font-semibold text-sm leading-5 text-gray-800 text-center">Email</span>
      <span className="flex-1 font-roboto font-semibold text-sm leading-5 text-gray-800 text-center">Prestação de Serviço</span>
      <span className="flex-1 font-roboto font-semibold text-sm leading-5 text-gray-800 text-center">Ações</span>
    </div>
  );
}

export default ColumnsBox;