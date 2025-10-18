import React from "react";
import "./clienteCardDetails.css";

function ClienteCardDetails({ cliente }) {
  return (
    <>
      <div className="cliente-info-section">
        <div className="cliente-info-item">
          <span className="cliente-info-label">Endereço</span>
          <span className="cliente-info-value">{cliente.endereco || "Não informado"}</span>
        </div>
        <div className="cliente-info-item">
          <span className="cliente-info-label">Cidade</span>
          <span className="cliente-info-value">{cliente.cidade || "Não informado"}</span>
        </div>
        <div className="cliente-info-item">
          <span className="cliente-info-label">UF</span>
          <span className="cliente-info-value">{cliente.uf || "Não informado"}</span>
        </div>
      </div>

      <div className="historico-servicos">
        <h4 className="historico-servicos-title">Histórico de Serviços</h4>
        <div className="historico-servicos-container">
          {cliente.historicoServicos && cliente.historicoServicos.length > 0 ? (
            cliente.historicoServicos.map((servico, index) => (
              <div key={index} className="historico-servico-item">
                <div className="historico-servico-grid">
                  <div className="historico-servico-field">
                    <span className="historico-servico-label">Serviço</span>
                    <span className="historico-servico-value">{servico.servico}</span>
                  </div>
                  <div className="historico-servico-field">
                    <span className="historico-servico-label">Data Orçamento</span>
                    <span className="historico-servico-value">{servico.dataOrcamento}</span>
                  </div>
                  <div className="historico-servico-field">
                    <span className="historico-servico-label">Data Serviço</span>
                    <span className="historico-servico-value">{servico.dataServico}</span>
                  </div>
                  <div className="historico-servico-field">
                    <span className="historico-servico-label">Valor</span>
                    <span className="historico-servico-value">R$ {servico.valor}</span>
                  </div>
                  <div className="historico-servico-field">
                    <span className="historico-servico-label">Pagamento</span>
                    <span className="historico-servico-value">{servico.formaPagamento}</span>
                  </div>
                  <div className="historico-servico-field">
                    <span className="historico-servico-label">Funcionário</span>
                    <span className="historico-servico-value">{servico.funcionario}</span>
                  </div>
                  <div className="historico-servico-field">
                    <span className="historico-servico-label">Desconto</span>
                    <span className="historico-servico-value">{servico.desconto}%</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="historico-empty">Nenhum serviço realizado</p>
          )}
        </div>
      </div>
    </>
  );
}

export default ClienteCardDetails;