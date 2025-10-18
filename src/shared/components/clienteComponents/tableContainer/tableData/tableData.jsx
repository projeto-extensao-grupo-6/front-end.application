import React from "react";
import "./tableData.css";

function TableData({ data, onEdit, onDelete }) {
  return (
    <div className="table-data">
      {data.length === 0 ? (
        <p style={{ padding: '20px', textAlign: 'center', color: '#9CA3AF' }}>
          Nenhum registro encontrado.
        </p>
      ) : (
        data.map((item) => (
          <div key={item.id} className="table-row">
            <span className="table-cell">{item.nome}</span>
            <span className="table-cell">{item.contato}</span>
            <span className="table-cell">{item.email}</span>
            <span className="table-cell">{item.servico}</span>
            <span className="table-cell">
              <button 
                className="table-action-btn edit"
                onClick={() => onEdit(item.id)}
              >
                Editar
              </button>
              <button 
                className="table-action-btn delete"
                onClick={() => onDelete(item.id)}
              >
                Excluir
              </button>
            </span>
          </div>
        ))
      )}
    </div>
  );
}

export default TableData;