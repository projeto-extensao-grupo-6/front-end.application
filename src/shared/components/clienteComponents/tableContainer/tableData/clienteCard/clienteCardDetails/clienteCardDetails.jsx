import React from "react";

function ClienteCardDetails({ cliente }) {
  return (
    <>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <span className="font-roboto font-semibold text-xs text-gray-500">Endereço</span>
          <span className="font-roboto font-normal text-sm text-gray-800">{cliente.endereco || "Não informado"}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-roboto font-semibold text-xs text-gray-500">Cidade</span>
          <span className="font-roboto font-normal text-sm text-gray-800">{cliente.cidade || "Não informado"}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-roboto font-semibold text-xs text-gray-500">UF</span>
          <span className="font-roboto font-normal text-sm text-gray-800">{cliente.uf || "Não informado"}</span>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-roboto font-semibold text-sm text-gray-800 mb-3">Histórico de Serviços</h4>
        <div className="max-h-[200px] overflow-y-auto border border-gray-200 rounded-md p-2">
          {cliente.historicoServicos && cliente.historicoServicos.length > 0 ? (
            cliente.historicoServicos.map((servico, index) => (
              <div key={index} className="p-3 border-b border-gray-200 mb-2 bg-white rounded last:border-b-0 last:mb-0">
                <div className="grid grid-cols-4 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="font-roboto font-semibold text-[11px] text-gray-500">Serviço</span>
                    <span className="font-roboto font-normal text-[13px] text-gray-800">{servico.servico}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-roboto font-semibold text-[11px] text-gray-500">Data Orçamento</span>
                    <span className="font-roboto font-normal text-[13px] text-gray-800">{servico.dataOrcamento}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-roboto font-semibold text-[11px] text-gray-500">Data Serviço</span>
                    <span className="font-roboto font-normal text-[13px] text-gray-800">{servico.dataServico}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-roboto font-semibold text-[11px] text-gray-500">Valor</span>
                    <span className="font-roboto font-normal text-[13px] text-gray-800">R$ {servico.valor}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-roboto font-semibold text-[11px] text-gray-500">Pagamento</span>
                    <span className="font-roboto font-normal text-[13px] text-gray-800">{servico.formaPagamento}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-roboto font-semibold text-[11px] text-gray-500">Funcionário</span>
                    <span className="font-roboto font-normal text-[13px] text-gray-800">{servico.funcionario}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-roboto font-semibold text-[11px] text-gray-500">Desconto</span>
                    <span className="font-roboto font-normal text-[13px] text-gray-800">{servico.desconto}%</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="p-3 text-center text-gray-400 font-roboto text-sm">Nenhum serviço realizado</p>
          )}
        </div>
      </div>
    </>
  );
}

export default ClienteCardDetails;