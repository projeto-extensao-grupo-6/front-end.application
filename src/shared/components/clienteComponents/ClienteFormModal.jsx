import React, { useState, useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  Home,
  MapPin,
  Building2,
  X,
  Save,
  CreditCard,
} from "lucide-react";

import { IMaskInput } from "react-imask";
import PropTypes from "prop-types";
import api from "../../../axios/Api";

const getClienteInicial = () => ({
  nome: "",
  contato: "",
  email: "",
  endereco: "",
  status: "Inativo",
  historicoServicos: [],
  cidade: "",
  uf: "",
});


export default function ClienteFormModal({
  open,
  onClose,
  onSubmit,
  modoEdicao,
  clienteInicial,
}) {
  const [clienteData, setClienteData] = useState(getClienteInicial());
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState("");

useEffect(() => {
  if (modoEdicao && clienteInicial) {

    const endereco = clienteInicial.enderecos?.[0] || {};

    setClienteData({
      ...getClienteInicial(),

      nome: clienteInicial.nome,
      contato: clienteInicial.telefone,
      email: clienteInicial.email,
      cpf: clienteInicial.cpf,
      status: clienteInicial.status,
      rua: endereco.rua,
      complemento: endereco.complemento,
      cep: endereco.cep,
      bairro: endereco.bairro,
      cidade: endereco.cidade,
      uf: endereco.uf,
      endereco: endereco.rua,
    });


  } else {
    setClienteData(getClienteInicial());
  }
}, [open, modoEdicao, clienteInicial]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setClienteData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e) => {
    setClienteData((prev) => ({
      ...prev,
      status: e.target.checked ? "Ativo" : "Inativo",
    }));
  };

  const buscarCep = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, "");
    
    if (cepLimpo.length !== 8) {
      setCepError("CEP deve conter 8 dígitos");
      return;
    }

    setLoadingCep(true);
    setCepError("");

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        setCepError("CEP não encontrado");
        setLoadingCep(false);
        return;
      }

      setClienteData((prev) => ({
        ...prev,
        rua: data.logradouro || prev.rua,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        uf: data.uf || prev.uf,
        endereco: data.logradouro || prev.endereco,
      }));

      setCepError("");
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      setCepError("Erro ao buscar CEP");
    } finally {
      setLoadingCep(false);
    }
  };

  const handleCepChange = (value) => {
    handleChange({ target: { name: 'cep', value } });
    
    const cepLimpo = value.replace(/\D/g, "");
    if (cepLimpo.length === 8) {
      buscarCep(value);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const dadosCompletos = {
      nome: clienteData.nome,
      cpf: clienteData.cpf ? clienteData.cpf.replace(/\D/g, "") : undefined,
      email: clienteData.email,
      telefone: clienteData.contato ? clienteData.contato.replace(/\D/g, "") : undefined,
      status: clienteData.status,
      enderecos: [
        {
          rua: clienteData.rua,
          complemento: clienteData.complemento || "",
          cep: clienteData.cep ? clienteData.cep.replace(/\D/g, "") : "",
          cidade: clienteData.cidade,
          bairro: clienteData.bairro,
          uf: clienteData.uf,
          pais: "Brasil",
          numero: clienteData.numero || undefined,
        },
      ],
    };

    let createdCliente = null;
    try {
      const maybePromise = onSubmit(dadosCompletos);
      if (maybePromise && typeof maybePromise.then === "function") {
        createdCliente = await maybePromise;
      } else {
        createdCliente = maybePromise || clienteInicial || null;
      }
    } catch (err) {
      createdCliente = clienteInicial || null;
    }

    if (typeof createdCliente === "string") {
      console.warn("onSubmit returned a string (possible token). Ignoring as createdCliente:", createdCliente);
      createdCliente = clienteInicial || null;
    }

  }

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setClienteData(getClienteInicial());
    }, 300);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-start px-10 py-20 overflow-y-auto z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[130vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-[#eeeeee] p-2.5 rounded-lg">
              <User className="w-6 h-6 text-[#828282]" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {modoEdicao ? "Editar Cliente" : "Adicionar novo cliente"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex flex-col gap-9 px-6 py-4 space-y-6 flex-1 overflow-y-auto">
            {/* Informações Básicas */}
            <div className="flex flex-col gap-5 space-y-4">
              <h3 className="flex items-start text-lg font-bold text-gray-700">Informações Básicas</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="flex items-start block text-sm font-medium text-gray-700">
                    Nome: <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    name="nome"
                    placeholder="Ex: Tiago Mendes"
                    value={clienteData.nome}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="flex items-start block text-sm font-medium text-gray-700">
                    CPF: <span className="text-red-500">*</span>
                  </label>
                  <IMaskInput
                    required
                    mask="000.000.000-00"
                    name="cpf"
                    placeholder="Ex: 123.456.789-00"
                    value={clienteData.cpf || ""}
                    onAccept={(value) => handleChange({ target: { name: 'cpf', value } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="flex items-start block text-sm font-medium text-gray-700">
                    Telefone: <span className="text-red-500">*</span>
                  </label>
                  <IMaskInput
                    required
                    mask="(00) 00000-0000"
                    name="contato"
                    placeholder="Ex: (11) 91234-5678"
                    value={clienteData.contato}
                    onAccept={(value) => handleChange({ target: { name: 'contato', value } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="flex items-start block text-sm font-medium text-gray-700">
                    Email: <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    placeholder="Ex: tiago.mendes@email.com"
                    value={clienteData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7]"
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="flex flex-col gap-4 space-y-4">
              <h3 className="flex items-start text-lg font-bold text-gray-700">Endereço</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="flex items-start block text-sm font-medium text-gray-700">
                    CEP: <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IMaskInput
                      required
                      mask="00000-000"
                      name="cep"
                      placeholder="Ex: 80035-010"
                      value={clienteData.cep || ""}
                      onAccept={handleCepChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7]"
                    />
                    {loadingCep && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-[#007EA7] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  {cepError && (
                    <p className="text-xs text-red-500 mt-1">{cepError}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="flex items-start block text-sm font-medium text-gray-700">
                    Rua: <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    name="rua"
                    placeholder="Ex: Rua das Flores"
                    value={clienteData.rua || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="flex items-start block text-sm font-medium text-gray-700">
                    Bairro: <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    name="bairro"
                    placeholder="Ex: Centro"
                    value={clienteData.bairro || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="flex items-start block text-sm font-medium text-gray-700">
                    Complemento:
                  </label>
                  <input
                    type="text"
                    name="complemento"
                    placeholder="Ex: Bloco B, apto 13"
                    value={clienteData.complemento || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="flex items-start block text-sm font-medium text-gray-700">
                    Cidade: <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    name="cidade"
                    placeholder="Ex: São Paulo"
                    value={clienteData.cidade}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="flex items-start block text-sm font-medium text-gray-700">
                    UF: <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    name="uf"
                    placeholder="Ex: SP"
                    maxLength={2}
                    value={clienteData.uf}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7] uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-3 space-y-4">
              <h3 className="flex items-start text-md font-semibold text-gray-700">Status</h3>
              
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clienteData.status === "Ativo"}
                    onChange={handleSwitchChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#007EA7]"></div>
                </label>
                <span className="text-sm font-medium text-gray-700">
                  Possui serviço em andamento (Status: {clienteData.status})
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-between">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 border border-gray-300 rounded-md text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#007EA7] text-white rounded-md cursor-pointer hover:bg-[#006891] transition-colors flex items-center gap-2 font-semibold"
            >
              <Save className="w-4 h-4" />
              {modoEdicao ? "Salvar Alterações" : "Criar Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}