import React from "react";
import "./columnsBox.css";

function ColumnsBox() {
  return (
    <div className="columns-box">
      <span className="column-header">Nome</span>
      <span className="column-header">Contato</span>
      <span className="column-header">Email</span>
      <span className="column-header">Prestação de Serviço</span>
      <span className="column-header">Ações</span>
    </div>
  );
}

export default ColumnsBox;