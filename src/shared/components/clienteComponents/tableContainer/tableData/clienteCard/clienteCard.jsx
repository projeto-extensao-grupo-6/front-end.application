import React, { useState } from "react";
import "./clienteCard.css";
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
    <div className={`cliente-card ${isExpanded ? "expanded" : ""}`}>
      <div className="cliente-card-header" onClick={toggleExpand}>
        <span className="cliente-card-field">{cliente.nome}</span>
        <span className="cliente-card-field">{cliente.contato}</span>
        <span className="cliente-card-field">{cliente.email}</span>
        <span className="cliente-card-field">{cliente.servico}</span>
        <div className="cliente-card-actions">
          <FontAwesomeIcon
            icon={faPenToSquare}
            className="card-action-icon edit"
            onClick={handleEdit}
            title="Editar"
          />
          
        </div>
      </div>

      <div className="cliente-card-details">
        <ClienteCardDetails cliente={cliente} />
      </div>
    </div>
  );
}

export default ClienteCard;