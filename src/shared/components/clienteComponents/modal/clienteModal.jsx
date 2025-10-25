import React, { useState, useEffect } from "react";
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
    <div className="fixed inset-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-[1000] opacity-100" onClick={onClose}>
      <div className="w-[459px] h-auto max-h-[90vh] overflow-y-auto bg-white rounded-lg border border-gray-200 p-6 box-border opacity-100 shadow-[0_10px_25px_rgba(0,0,0,0.2)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-6">
          <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-blue-500" />
          <h2 className="font-roboto font-bold text-lg text-gray-800">{modalTitle}</h2>
        </div>
    
        <form className="flex flex-col text-left gap-5 p-[5px]">
          <div className="flex gap-3">
            <div className="flex flex-col gap-2 flex-1">
              <label className="font-roboto font-semibold text-sm text-gray-800">Nome Cliente</label>
              <input
                type="text"
                name="nome"
                className="w-full h-10 px-3 py-2.5 border border-gray-200 rounded-md font-roboto text-sm text-gray-800 box-border transition-colors focus:outline-none focus:border-blue-500 placeholder:text-gray-400"
                placeholder="Digite o nome"
                value={formData.nome}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label className="font-roboto font-semibold text-sm text-gray-800">Telefone</label>
              <input
                type="tel"
                name="telefone"
                className="w-full h-10 px-3 py-2.5 border border-gray-200 rounded-md font-roboto text-sm text-gray-800 box-border transition-colors focus:outline-none focus:border-blue-500 placeholder:text-gray-400"
                placeholder="(00) 00000-0000"
                value={formData.telefone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <label className="font-roboto font-semibold text-sm text-gray-800">Email</label>
            <input
              type="email"
              name="email"
              className="w-full h-10 px-3 py-2.5 border border-gray-200 rounded-md font-roboto text-sm text-gray-800 box-border transition-colors focus:outline-none focus:border-blue-500 placeholder:text-gray-400"
              placeholder="email@exemplo.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <label className="font-roboto font-semibold text-sm text-gray-800">Endereço</label>
            <input
              type="text"
              name="endereco"
              className="w-full h-10 px-3 py-2.5 border border-gray-200 rounded-md font-roboto text-sm text-gray-800 box-border transition-colors focus:outline-none focus:border-blue-500 placeholder:text-gray-400"
              placeholder="Digite o endereço completo"
              value={formData.endereco}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col gap-2 flex-1">
              <label className="font-roboto font-semibold text-sm text-gray-800">CEP</label>
              <input
                type="text"
                name="cep"
                className="w-full h-10 px-3 py-2.5 border border-gray-200 rounded-md font-roboto text-sm text-gray-800 box-border transition-colors focus:outline-none focus:border-blue-500 placeholder:text-gray-400"
                placeholder="Digite o CEP"
                value={formData.cep}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label className="font-roboto font-semibold text-sm text-gray-800">Numero</label>
              <input
                type="text"
                name="numero"
                className="w-full h-10 px-3 py-2.5 border border-gray-200 rounded-md font-roboto text-sm text-gray-800 box-border transition-colors focus:outline-none focus:border-blue-500 placeholder:text-gray-400"
                placeholder="Digite o número"
                value={formData.numero}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div
              className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors ${formData.possuiServico ? "bg-blue-500" : "bg-gray-200"}`}
              onClick={toggleServico}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${formData.possuiServico ? "translate-x-6" : ""}`}></div>
            </div>
            <span className="font-roboto font-normal text-sm text-gray-800">Possui serviço em andamento</span>
          </div>

          {!formData.possuiServico && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-roboto font-bold text-sm text-gray-800 mb-3">Histórico de serviços prestados</h3>
              
              {servicosPrestados.map((servico, index) => (
                <div key={index} className="flex items-start gap-2 mb-2">
                  <div className="flex flex-col gap-2 flex-1">
                    <input
                      type="text"
                      className="w-full h-10 px-3 py-2.5 border border-gray-200 rounded-md font-roboto text-sm text-gray-800 box-border transition-colors focus:outline-none focus:border-blue-500 placeholder:text-gray-400"
                      placeholder="Digite o serviço prestado"
                      value={servico}
                      onChange={(e) => handleServicoChange(index, e.target.value)}
                    />
                  </div>
                  {servicosPrestados.length > 1 && (
                    <button
                      type="button"
                      className="min-w-8 h-10 p-0 bg-red-100 text-red-600 border border-red-300 rounded-md flex items-center justify-center cursor-pointer transition-all hover:bg-red-200 hover:text-red-800"
                      onClick={() => removerServico(index)}
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                  )}
                </div>
              ))}
              
              <button 
                type="button" 
                className="mt-2 px-4 py-2 bg-gray-100 text-gray-800 border border-gray-200 rounded-md font-roboto font-medium text-sm cursor-pointer transition-colors hover:bg-gray-200"
                onClick={adicionarServico}
              >
                + Adicionar serviço
              </button>
            </div>
          )}

          <div className="flex gap-3 mt-6 justify-end">
            <button type="button" className="px-6 py-2.5 border-none rounded-md font-roboto font-semibold text-sm cursor-pointer transition-colors bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="px-6 py-2.5 border-none rounded-md font-roboto font-semibold text-sm cursor-pointer transition-colors bg-blue-500 text-white hover:bg-blue-600" onClick={handleSubmit}>
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClienteModal;