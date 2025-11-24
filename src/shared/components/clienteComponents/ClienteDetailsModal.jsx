import { Modal } from "@mui/material";

export default function ClienteDetailsModal({ open, onClose, cliente }) {
  if (!cliente) return null;

  const endereco = cliente?.enderecos?.[0] || {};

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
              value={cliente.nome}
              readOnly
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Telefone</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md p-3 w-full font-normal"
              value={cliente.telefone || "N/A"}
              readOnly
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Email</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md p-3 w-full font-normal"
              value={cliente.email || "N/A"}
              readOnly
            />
          </div>
        </div>

        <div className="pt-4 pb-6">
          <label className="block font-bold mb-2">Endereço</label>
          <input
            type="text"
            className="border border-gray-300 rounded-md p-3 w-full font-normal"
            value={`${endereco.rua || ""}, ${endereco.bairro || ""}, ${endereco.cep || ""}` || "N/A"}
            readOnly
          />
        </div>

        {/* Histórico de Serviços */}
        <h3 className="text-lg font-bold mb-3">Histórico de Serviço</h3>
        <div className="border-4 border-[#007EA7] rounded-lg p-6 w-full max-h-[42vh] overflow-y-auto bg-[#e8f6fb] space-y-4">
          {cliente.historicoServicos?.length > 0 ? (
            cliente.historicoServicos.map((hist, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-lg p-5"
              >
                <div>
                  <label className="block font-bold mb-2">Serviço</label>
                  <input type="text" value={hist.servico} readOnly className="border border-gray-300 rounded-md p-3 w-full" />
                </div>
                <div>
                  <label className="block font-bold mb-2">Valor</label>
                  <input type="text" value={`R$ ${hist.valor}`} readOnly className="border border-gray-300 rounded-md p-3 w-full" />
                </div>
                <div>
                  <label className="block font-bold mb-2">Desconto</label>
                  <input type="text" value={`${hist.desconto}%`} readOnly className="border border-gray-300 rounded-md p-3 w-full" />
                </div>
                <div>
                  <label className="block font-bold mb-2">Forma de Pagamento</label>
                  <input type="text" value={hist.formaPagamento} readOnly className="border border-gray-300 rounded-md p-3 w-full" />
                </div>
                <div>
                  <label className="block font-bold mb-2">Data Orçamento</label>
                  <input type="text" value={hist.dataOrcamento} readOnly className="border border-gray-300 rounded-md p-3 w-full" />
                </div>
                <div>
                  <label className="block font-bold mb-2">Data Pagamento</label>
                  <input type="text" value={hist.dataServico} readOnly className="border border-gray-300 rounded-md p-3 w-full" />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-bold mb-2">Funcionário</label>
                  <input type="text" value={hist.funcionario} readOnly className="border border-gray-300 rounded-md p-3 w-full" />
                </div>
              </div>
            ))
          ) : (
            <p>Nenhum histórico encontrado.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
