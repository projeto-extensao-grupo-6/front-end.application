import React from "react";
import ClienteCard from "./clienteCard/clienteCard";

function TableData({ data, onEdit, onDelete }) {
  return (
    <div className="w-full h-[calc(100%-50px)] flex-1 overflow-y-auto box-border">
      {data.length === 0 ? (
        <p className="p-5 text-center text-gray-400">
          Nenhum registro encontrado.
        </p>
      ) : (
        data.map((cliente) => (
          <ClienteCard
            key={cliente.id}
            cliente={cliente}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
}

export default TableData;