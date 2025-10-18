import React from "react";
import "./btnExport.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExport } from "@fortawesome/free-solid-svg-icons";

function BtnExport({ onClick }) {
  return (
    <button className="btn-export" onClick={onClick}>
      <span className="btn-export-icon">
        <FontAwesomeIcon icon={faFileExport} />
      </span>
      Exportar
    </button>
  );
}

export default BtnExport;