import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

function BtnExport({ onClick }) {
  return (
    <button 
      className="min-w-[106px] h-[38px] relative rounded border border-gray-800 opacity-100 px-3 py-2 gap-2 flex items-center justify-center cursor-pointer box-border bg-gray-800 text-white font-roboto font-semibold text-sm leading-5 whitespace-nowrap transition-colors hover:bg-gray-900 hover:border-gray-900 active:bg-black active:border-black"
      onClick={onClick}
    >
      <span className="w-4 h-4 flex items-center justify-center">
        <FontAwesomeIcon icon={faDownload} />
      </span>
      Exportar
    </button>
  );
}

export default BtnExport;