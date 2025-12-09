import React, { useEffect, useState } from "react";
import { Modal } from "@mui/material";
import api from "../../../axios/Api";

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
                      w-11/12 max-h-[90vh] bg-white rounded-xl shadow-xs p-8 overflow-hidden space-y-8">

        <div className="flex justify-between items-center mb-6 ">
          <h2 className="text-2xl font-bold">Detalhes do Cliente</h2>
          <button
            onClick={onClose}
            className="bg-white text-black px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          <div className="flex flex-col gap-1">
            <label className="block font-bold mb-2">Nome</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md p-3 w-full font-normal"
              value={cliente.nome || (cliente?.cliente?.nome) || "N/A"}
              readOnly
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="block font-bold mb-2">Telefone</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md p-3 w-full font-normal"
              value={cliente.telefone || cliente?.cliente?.telefone || "N/A"}
              readOnly
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="block font-bold mb-2">Email</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md p-3 w-full font-normal"
              value={cliente.email || cliente?.cliente?.email || "N/A"}
              readOnly
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 pt-4 pb-6">
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

        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold mb-4">Histórico de Serviços</h3>
          <div className="border border-gray-200 rounded-md w-full max-h-[42vh] overflow-auto bg-white shadow-sm">
            {servicos && servicos.length > 0 ? (
              <table className="w-full border-collapse">
                <thead className="bg-[#007EA7] text-white sticky top-0">
                  <tr>
                    <th className="p-3 text-left font-semibold">Serviço</th>
                    <th className="p-3 text-left font-semibold">Valor Total</th>
                    <th className="p-3 text-left font-semibold">Status</th>
                    <th className="p-3 text-left font-semibold">Forma de Pagamento</th>
                    <th className="p-3 text-left font-semibold">Observação</th>
                    <th className="p-3 text-left font-semibold">Etapa / Tipo</th>
                    <th className="p-3 text-left font-semibold">Descrição do Serviço</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {servicos.map((pedido, index) => {
                    const serv = pedido.servico || {};
                    const statusNome = pedido.status?.nome || pedido.status || (pedido.ativo ? "ATIVO" : "INATIVO");

                    return (
                      <tr key={pedido.id ?? index} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 text-gray-900">
                          {serv.nome || serv.codigo || pedido.observacao || "N/A"}
                        </td>
                        <td className="p-3 text-gray-900">
                          {formatCurrency(pedido.valorTotal ?? pedido.valor ?? serv.precoBase)}
                        </td>
                        <td className="p-3 text-gray-900">
                          {statusNome}
                        </td>
                        <td className="p-3 text-gray-900">
                          {pedido.formaPagamento || "N/A"}
                        </td>
                        <td className="p-3 text-gray-900">
                          {pedido.observacao || "N/A"}
                        </td>
                        <td className="p-3 text-gray-900">
                          {serv.etapa?.nome || pedido.status?.tipo || pedido.tipoPedido || "N/A"}
                        </td>
                        <td className="p-3 text-gray-900">
                          {serv.descricao || pedido.descricao || "N/A"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="p-6">Nenhum histórico encontrado.</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}