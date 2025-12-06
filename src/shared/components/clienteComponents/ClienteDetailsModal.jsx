import React, { useEffect, useState } from "react";
import { Modal } from "@mui/material";

 import api from "../../../services/servicosService";


const formatCurrency = (value) => {
  if (value == null || isNaN(value)) return "R$ 0,00";
  return `R$ ${parseFloat(value).toFixed(2).replace(".", ",")}`;
};

export default function ClienteDetailsModal({ open, onClose, cliente, servicos: servicosProp }) {

  if (!cliente) return null;

  const PEDIDOS_URL = "/pedidos";
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(false);

  const endereco =
    cliente?.enderecos?.[0] ||
    servicosProp?.find((p) => p.cliente)?.cliente?.enderecos?.[0] ||
    undefined;

  useEffect(() => {
    let isMounted = true;

    if (Array.isArray(servicosProp) && servicosProp.length > 0) {
      const filtered = servicosProp.filter((p) => p.cliente?.id === cliente.id);
      setServicos(filtered);
      return () => {
        isMounted = false;
      };
    }

    const fetchServicosPorCliente = async () => {
      if (!open || !cliente?.id) {
        setServicos([]);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get(`${PEDIDOS_URL}?clienteId=${cliente.id}`);
        const data = Array.isArray(response.data) ? response.data : [];
        if (isMounted) setServicos(data);
      } catch (err) {
        if (isMounted) setServicos([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchServicosPorCliente();

    return () => {
      isMounted = false;
    };
  }, [open, cliente, servicosProp]);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      w-11/12 max-h-[90vh] bg-white rounded-xl shadow-lg p-8 overflow-hidden space-y-8">

        <div className="flex justify-between items-center mb-6 ">
          <h2 className="text-2xl font-bold">Detalhes do Cliente</h2>
          <button
            onClick={onClose}
            className="bg-[#007aa3] text-white px-5 py-2 rounded-lg hover:bg-[#007EA7]"
          >
            Fechar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div>
            <label className="block font-bold mb-2">Nome</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md p-3 w-full font-normal"
              value={cliente.nome || (cliente?.cliente?.nome) || "N/A"}
              readOnly
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Telefone</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md p-3 w-full font-normal"
              value={cliente.telefone || cliente?.cliente?.telefone || "N/A"}
              readOnly
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Email</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md p-3 w-full font-normal"
              value={cliente.email || cliente?.cliente?.email || "N/A"}
              readOnly
            />
          </div>
        </div>

        <div className="pt-4 pb-6">
          <label className="block font-bold mb-2">Endereço</label>
          <input
            type="text"
            className="border border-gray-300 rounded-md p-3 w-full font-normal"
            value={
              endereco && (endereco.rua || endereco.bairro || endereco.cep || endereco.numero)
                ? `${endereco.rua || ""}${endereco.numero ? ", " + endereco.numero : ""}${endereco.bairro ? " - " + endereco.bairro : ""}${endereco.cidade ? " / " + endereco.cidade : ""}${endereco.uf ? " - " + endereco.uf : ""}`
                : "N/A"
            }
            readOnly
          />
        </div>

        <h3 className="text-lg font-bold mb-3">Histórico de Serviços</h3>
        <div className="border-4 border-[#007EA7] rounded-lg p-6 w-full max-h-[42vh] overflow-y-auto bg-[#e8f6fb] space-y-4">
          {servicos && servicos.length > 0 ? (
            servicos.map((pedido, index) => {

              const serv = pedido.servico || {};
              const statusNome = pedido.status?.nome || pedido.status || (pedido.ativo ? "ATIVO" : "INATIVO");

              return (
                <div
                  key={pedido.id ?? index}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-lg p-5"
                >
                  <div>
                    <label className="block font-bold mb-2">Serviço</label>
                    <input
                      type="text"
                      value={serv.nome || serv.codigo || pedido.observacao || "N/A"}
                      readOnly
                      className="border border-gray-300 rounded-md p-3 w-full"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2">Valor Total</label>
                    <input
                      type="text"
                      value={formatCurrency(pedido.valorTotal ?? pedido.valor ?? serv.precoBase)}
                      readOnly
                      className="border border-gray-300 rounded-md p-3 w-full"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2">Status</label>
                    <input
                      type="text"
                      value={statusNome}
                      readOnly
                      className="border border-gray-300 rounded-md p-3 w-full"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2">Forma de Pagamento</label>
                    <input
                      type="text"
                      value={pedido.formaPagamento || "N/A"}
                      readOnly
                      className="border border-gray-300 rounded-md p-3 w-full"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2">Observação</label>
                    <input
                      type="text"
                      value={pedido.observacao || "N/A"}
                      readOnly
                      className="border border-gray-300 rounded-md p-3 w-full"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2">Etapa / Tipo</label>
                    <input
                      type="text"
                      value={
                        serv.etapa?.nome ||
                        pedido.status?.tipo ||
                        pedido.tipoPedido ||
                        "N/A"
                      }
                      readOnly
                      className="border border-gray-300 rounded-md p-3 w-full"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block font-bold mb-2">Descrição do Serviço</label>
                    <textarea
                      value={serv.descricao || pedido.descricao || ""}
                      readOnly
                      className="border border-gray-300 rounded-md p-3 w-full h-24"
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p>Nenhum histórico encontrado.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
