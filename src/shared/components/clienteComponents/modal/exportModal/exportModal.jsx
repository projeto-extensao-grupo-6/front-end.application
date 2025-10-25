import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExport, faCloudArrowUp, faDownload, faXmark } from "@fortawesome/free-solid-svg-icons";

function ExportModal({ isOpen, onClose, onExport }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExport = () => {
    if (selectedFile) {
      onExport(selectedFile);
      setSelectedFile(null);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-[1000] opacity-100" onClick={handleClose}>
      <div className="w-[459px] h-auto max-h-[90vh] overflow-y-auto bg-white rounded-lg border border-gray-200 p-6 box-border opacity-100 shadow-[0_10px_25px_rgba(0,0,0,0.2)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-6">
          <FontAwesomeIcon icon={faDownload} className="w-10 h-10 text-blue-500" />
        </div>

        <div className="flex flex-col text-left gap-4">
          <h2 className="font-roboto font-bold text-lg text-gray-800">Exportar Planilha</h2>
 
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
          />

          <div 
            className={`w-full min-h-[200px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-3 p-6 box-border transition-all cursor-pointer ${
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleButtonClick}
          >
            {selectedFile ? (
              <div className="w-full p-3 bg-blue-50 border border-blue-500 rounded-md flex items-center justify-between font-roboto text-sm text-gray-800">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faDownload} className="text-blue-500" />
                  <span>{selectedFile.name}</span>
                </div>
                <button 
                  type="button"
                  className="bg-transparent border-none text-red-500 cursor-pointer p-1 transition-colors hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            ) : (
              <>
                <FontAwesomeIcon icon={faCloudArrowUp} className="w-12 h-12 text-gray-400" />
                <p className="font-roboto text-sm text-gray-500 text-center">
                  Arraste e solte o arquivo aqui ou <strong className="text-blue-500">clique para selecionar</strong>
                </p>
                <p className="font-roboto text-xs text-gray-500 text-center">
                  Formatos aceitos: .xlsx, .xls, .csv
                </p>
              </>
            )}
          </div>
            
          <div className="flex gap-3 mt-6 justify-end">
            <button 
              type="button" 
              className="px-6 py-2.5 border-none rounded-md font-roboto font-semibold text-sm cursor-pointer transition-colors bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              onClick={handleExport}
              disabled={!selectedFile}
            >
              Exportar Planilha
            </button>
            
            <button 
              type="button" 
              className="px-6 py-2.5 border border-gray-200 rounded-md font-roboto font-semibold text-sm cursor-pointer transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200" 
              onClick={handleClose}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExportModal;