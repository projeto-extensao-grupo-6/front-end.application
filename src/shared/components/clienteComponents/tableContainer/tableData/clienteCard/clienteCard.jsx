import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import ClienteCardDetails from "./clienteCardDetails/clienteCardDetails";

function ClienteCard({ cliente, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(cliente.id);
  };

  return (
    <div className={`w-[calc(100%-32px)] min-h-[52px] mx-4 my-2 rounded-lg border border-gray-200 opacity-100 bg-white box-border transition-all duration-300 cursor-pointer hover:border-blue-500 hover:shadow-md ${
      isExpanded ? 'min-h-[120px] bg-[#9AD1D4] cursor-default' : ''
    }`}>
      <div className="w-full h-[52px] flex items-center px-4 box-border" onClick={toggleExpand}>
        <span className="flex-1 font-roboto font-normal text-sm leading-5 text-gray-800 overflow-hidden text-ellipsis whitespace-nowrap">
          {cliente.nome}
        </span>
        <span className="flex-1 font-roboto font-normal text-sm leading-5 text-gray-800 overflow-hidden text-ellipsis whitespace-nowrap">
          {cliente.contato}
        </span>
        <span className="flex-1 font-roboto font-normal text-sm leading-5 text-gray-800 overflow-hidden text-ellipsis whitespace-nowrap">
          {cliente.email}
        </span>
        <span className="flex-1 font-roboto font-normal text-sm leading-5 text-gray-800 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
            cliente.status === 'Ativo' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {cliente.status || 'Ativo'}
          </span>
        </span>
        <div className="flex-1 flex gap-3 justify-center">
          <FontAwesomeIcon
            icon={faPenToSquare}
            className="w-5 h-5 text-gray-500 cursor-pointer transition-colors hover:text-blue-500"
            onClick={handleEdit}
            title="Editar"
          />
        </div>
      </div>

      <div className={`overflow-hidden transition-all duration-300 px-4 ${
        isExpanded 
          ? 'max-h-[500px] py-4 border-t border-gray-200' 
          : 'max-h-0 p-0'
      }`}>
        <ClienteCardDetails cliente={cliente} />
      </div>
    </div>
  );
}

export default ClienteCard;