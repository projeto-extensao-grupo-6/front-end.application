import React from "react";
import "./btnNovoCliente.css";

function BtnNovoCliente({ onClick }) {
  return (
    <button className="btn-novo-cliente" onClick={onClick}>
      Novo Cliente
    </button>
  );
}

export default BtnNovoCliente;