import React, { useState, useRef } from "react";
import "./exportModal.css";
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
    <div className="modal-overlay" onClick={handleClose}>
      <div className="export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <FontAwesomeIcon icon={faDownload} className="modal-icon" />
       
        </div>

        <div className="export-content">
               <h2 className="modal-title">Exportar Planilha</h2>
 
          <input
            ref={fileInputRef}
            type="file"
            className="file-input-hidden"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
          />

          <div 
            className={`drag-drop-area ${isDragging ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleButtonClick}
          >
            {selectedFile ? (
              <div className="selected-file">
                <div className="file-name">
                  <FontAwesomeIcon icon={faDownload} className="file-icon" />
                  <span>{selectedFile.name}</span>
                </div>
                <button 
                  type="button"
                  className="btn-remove-file"
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
                <FontAwesomeIcon icon={faCloudArrowUp} className="drag-drop-icon" />
                <p className="drag-drop-text">
                  Arraste e solte o arquivo aqui ou <strong>clique para selecionar</strong>
                </p>
                <p className="drag-drop-text" style={{ fontSize: '12px' }}>
                  Formatos aceitos: .xlsx, .xls, .csv
                </p>
              </>
            )}
          </div>
            
          <div className="modal-actions">
             <button 
              type="button" 
              className="modal-btn export" 
              onClick={handleExport}
              disabled={!selectedFile}
            >
              Exportar Planilha
            </button>
            
            <button type="button" className="modal-btn cancel" onClick={handleClose}>
              Cancelar
            </button>
           
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExportModal;