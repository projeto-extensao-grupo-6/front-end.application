import React from "react";
import ClienteCard from "./clienteCard/clienteCard";
import "./tableData.css";

function TableData({ data, onEdit, onDelete }) {
  return (
    <div className="table-data">
      {data.length === 0 ? (
        <p style={{ padding: "20px", textAlign: "center", color: "#9CA3AF" }}>
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