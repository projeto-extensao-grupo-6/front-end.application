import React, { useState, useEffect } from "react";
import "./clienteModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faXmark } from "@fortawesome/free-solid-svg-icons";

function ClienteModal({ isOpen, onClose, onSubmit, cliente = null, mode = "create" }) {
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    endereco: "",
    cidade: "",
    uf: "",
    cep: "",
    numero: "",
    possuiServico: false,
    status: "Ativo"
  });

  const [servicosPrestados, setServicosPrestados] = useState([""]);

  useEffect(() => {
    if (cliente && mode === "edit") {
      setFormData({
        nome: cliente.nome || "",
        telefone: cliente.contato || "",
        email: cliente.email || "",
        endereco: cliente.endereco || "",
        cidade: cliente.cidade || "",
        uf: cliente.uf || "",
        cep: cliente.cep || "",
        numero: cliente.numero || "",
        possuiServico: cliente.status === "Ativo",
        status: cliente.status || "Ativo"
      });
      
      if (cliente.historicoServicos && cliente.historicoServicos.length > 0) {
        setServicosPrestados(cliente.historicoServicos.map(s => s.servico));
      } else {
        setServicosPrestados([""]);
      }
    } else {
      setFormData({
        nome: "",
        telefone: "",
        email: "",
        endereco: "",
        cidade: "",
        uf: "",
        cep: "",
        numero: "",
        possuiServico: false,
        status: "Ativo"
      });
      setServicosPrestados([""]);
    }
  }, [cliente, mode, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleServico = () => {
    setFormData(prev => ({
      ...prev,
      possuiServico: !prev.possuiServico,
      status: !prev.possuiServico ? "Ativo" : "Finalizado"
    }));
  };

  const handleServicoChange = (index, value) => {
    const newServicos = [...servicosPrestados];
    newServicos[index] = value;
    setServicosPrestados(newServicos);
  };

  const adicionarServico = () => {

    const ultimoServico = servicosPrestados[servicosPrestados.length - 1];
    if (ultimoServico.trim() === "") {
      alert("Preencha o serviço atual antes de adicionar um novo");
      return;
    }
    
    setServicosPrestados([...servicosPrestados, ""]);
  };

  const removerServico = (index) => {
    if (servicosPrestados.length > 1) {
      const newServicos = servicosPrestados.filter((_, i) => i !== index);
      setServicosPrestados(newServicos);
    }
  };

  const handleSubmit = () => {
    const servicosFiltrados = servicosPrestados.filter(s => s.trim() !== "");
    
    const dataToSubmit = {
      ...formData,
      contato: formData.telefone,
      servicosPrestados: servicosFiltrados
    };
    
    if (mode === "edit" && cliente) {
      onSubmit({ ...dataToSubmit, id: cliente.id });
    } else {
      onSubmit(dataToSubmit);
    }
    onClose();
  };

  if (!isOpen) return null;

  const modalTitle = mode === "edit" ? "Editar informações do cliente" : "Adicionar novo cliente";
  const submitButtonText = mode === "edit" ? "Salvar" : "Criar";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="cliente-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <FontAwesomeIcon icon={faUser} className="modal-icon" />
          <h2 className="modal-title">{modalTitle}</h2>
        </div>
    
        <form className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nome Cliente</label>
              <input
                type="text"
                name="nome"
                className="form-input"
                placeholder="Digite o nome"
                value={formData.nome}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input
                type="tel"
                name="telefone"
                className="form-input"
                placeholder="(00) 00000-0000"
                value={formData.telefone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="email@exemplo.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Endereço</label>
            <input
              type="text"
              name="endereco"
              className="form-input"
              placeholder="Digite o endereço completo"
              value={formData.endereco}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">CEP</label>
              <input
                type="text"
                name="cep"
                className="form-input"
                placeholder="Digite o CEP"
                value={formData.cep}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Numero</label>
              <input
                type="text"
                name="numero"
                className="form-input"
                placeholder="Digite o número"
                value={formData.numero}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="toggle-container">
            <div
              className={`toggle-switch ${formData.possuiServico ? "active" : ""}`}
              onClick={toggleServico}
            >
              <div className="toggle-slider"></div>
            </div>
            <span className="toggle-label">Possui serviço em andamento</span>
          </div>

          {!formData.possuiServico && (
            <div className="historico-section">
              <h3 className="historico-title">Histórico de serviços prestados</h3>
              
              {servicosPrestados.map((servico, index) => (
                <div key={index} className="servico-item">
                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Digite o serviço prestado"
                      value={servico}
                      onChange={(e) => handleServicoChange(index, e.target.value)}
                    />
                  </div>
                  {servicosPrestados.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove-servico"
                      onClick={() => removerServico(index)}
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                  )}
                </div>
              ))}
              
              <button 
                type="button" 
                className="btn-add-servico" 
                onClick={adicionarServico}
              >
                + Adicionar serviço
              </button>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="modal-btn cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="modal-btn create" onClick={handleSubmit}>
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClienteModal;