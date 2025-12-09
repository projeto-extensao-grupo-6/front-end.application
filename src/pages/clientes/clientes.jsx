import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import Header from "../../shared/components/header/header";
import Sidebar from "../../shared/components/sidebar/sidebar";
import {
  Search,
  Download,
  Edit,
  Eye,
  UserPlus,
} from "lucide-react";
import ClienteFormModal from "../../shared/components/clienteComponents/ClienteFormModal";
import ClienteDetailsModal from "../../shared/components/clienteComponents/ClienteDetailsModal";
import Api from "../../axios/Api";

const formatCurrency = (value) => {
  if (value == null || isNaN(value)) return "R$ 0,00";
  return `R$ ${parseFloat(value).toFixed(2).replace(".", ",")}`;
};

const formatPhone = (phoneStr) => {
  if (!phoneStr) return "N/A";
  const cleaned = phoneStr.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(
      2,
      7
    )}-${cleaned.substring(7, 11)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(
      2,
      6
    )}-${cleaned.substring(6, 10)}`;
  }
  return phoneStr;
};

const getPrimaryAddress = (cliente) => {
  if (!cliente.enderecos || !Array.isArray(cliente.enderecos) || cliente.enderecos.length === 0) {
    return { rua: "N/A", cidade: "N/A", uf: "N/A" };
  }
  return cliente.enderecos[0];
};

const InfoItem = ({ label, value }) => (
  <div className="text-left">
    <span className="block text-gray-500 font-medium uppercase text-xs mb-1">
      {label}
    </span>
    <span className="text-gray-900 font-medium text-sm">{value || "N/A"}</span>
  </div>
);

const HistoryCard = ({ hist }) => (
  <div className="w-full p-6 border border-gray-200 rounded-2xl bg-white">
    <div className="flex flex-col md:flex-row justify-between mb-4">
      <div className="max-w-[65%]">
        <span className="text-gray-500 uppercase text-xs tracking-wide">Serviço</span>
        <h3 className="text-gray-900 font-semibold text-lg leading-snug">{hist.servico}</h3>
      </div>
      <div className="text-right min-w-[100px]">
        <span className="text-gray-500 uppercase text-xs tracking-wide">Valor</span>
        <h3 className="text-green-700 font-semibold text-lg">{formatCurrency(hist.valor)}</h3>
      </div>
    </div>

    <Divider className="mb-6" />

    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 pt-4">
      <InfoItem label="Data Orçamento" value={hist.dataOrcamento} />
      <InfoItem label="Data Serviço" value={hist.dataServico} />
      <InfoItem label="Pagamento" value={hist.formaPagamento} />
      <InfoItem label="Desconto" value={`${hist.desconto}%`} />
      <InfoItem label="Funcionário" value={hist.funcionario} />
    </div>
  </div>
);

export default function Clientes() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const limitePorPagina = 5;

  const [situacao, setSituacao] = useState("Todos");
  const [ordenar, setOrdenar] = useState("recentes");

  const [openForm, setOpenForm] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  const [selecionados, setSelecionados] = useState([]);
  const [openDetails, setOpenDetails] = useState(false);
  const [clienteDetalhes, setClienteDetalhes] = useState(null);

  const [pedidos, setPedidos] = useState([]);

  const fetchClientes = async () => {
    try {
      const response = await Api.get("/clientes");
      const data = Array.isArray(response.data) ? response.data : [];
      setClientes(data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      setClientes([]);
    }
  };

  const fetchPedidos = async () => {
    try {
      const response = await Api.get("/pedidos");
      const data = Array.isArray(response.data) ? response.data : [];
      setPedidos(data);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      setPedidos([]);
    }
  };

  useEffect(() => {
    fetchClientes();
    fetchPedidos();
  }, []);

  const clientesFiltrados = useMemo(() => {
    const clientesArray = Array.isArray(clientes) ? clientes : [];
    
    let filtered = clientesArray.filter((c) => {
      return c.nome && c.nome.toLowerCase().includes(busca.toLowerCase());
    });
    if (situacao !== "Todos") filtered = filtered.filter((c) => c.status === situacao);

    return filtered.sort((a, b) => {
      if (ordenar === "recentes") return b.id - a.id;
      if (ordenar === "antigos") return a.id - b.id;
      if (ordenar === "az") return a.nome && b.nome ? a.nome.localeCompare(b.nome) : 0;
      if (ordenar === "za") return a.nome && b.nome ? b.nome.localeCompare(a.nome) : 0;
      return 0;
    });
  }, [clientes, busca, situacao, ordenar]);

  const indexUltimo = pagina * limitePorPagina;
  const indexPrimeiro = indexUltimo - limitePorPagina;
  const clientesPagina = clientesFiltrados.slice(indexPrimeiro, indexUltimo);
  const totalPaginas = Math.ceil(clientesFiltrados.length / limitePorPagina);

  const abrirModalCriar = () => {
    setModoEdicao(false);
    setClienteSelecionado(null);
    setOpenForm(true);
  };

  const abrirModalEditar = (cliente) => {
    setModoEdicao(true);
    setClienteSelecionado(cliente);
    setOpenForm(true);
  };

  const atualizarClientes = async (dadosCliente) => {
    if (modoEdicao && clienteSelecionado) {
      try {
        const clienteAtualizado = { ...clienteSelecionado, ...dadosCliente };

        const response = await Api.put(`/clientes/${clienteSelecionado.id}`, clienteAtualizado);

        // Usar os dados retornados pela API
        const clienteRetornado = response.data;

        setClientes((prev) =>
          prev.map((c) =>
            c.id === clienteSelecionado.id ? clienteRetornado : c
          )
        );

      } catch (error) {
        console.error("Erro ao editar cliente (PUT):", error);
      }
    } else {
      try {

        const novoClienteComId = { ...dadosCliente};

        const response = await Api.post("/clientes", novoClienteComId);

        const novoCliente = response.data;
        setClientes((prev) => [novoCliente, ...prev]);

      } catch (error) {
        console.error("Erro ao criar cliente (POST):", error);
      }
    }
    setOpenForm(false);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const todosIdsFiltrados = clientesFiltrados.map((c) => c.id);
      setSelecionados(todosIdsFiltrados);
    } else {
      setSelecionados([]);
    }
  };

  const handleSelectClick = (event, id) => {
    setSelecionados((prev) =>
      prev.includes(id)
        ? prev.filter((selId) => selId !== id)
        : [...prev, id]
    );
  };

  const isSelected = (id) => selecionados.includes(id);

  const handleExportar = () => {
    if (selecionados.length === 0) {
      alert("Nenhum cliente selecionado para exportar.");
      return;
    }

    const dataToExport = clientes.filter((c) => selecionados.includes(c.id));
    const nomeArquivo = `clientes_selecionados_${selecionados.length}.xlsx`;

    const simplifiedData = dataToExport.map((c) => {
      const enderecoPrimario = getPrimaryAddress(c);
      const qtdPedidos = pedidos.filter((p) => p.cliente?.id === c.id).length;
      return {
        Nome: c.nome,
        Telefone: c.telefone,
        Email: c.email,
        Status: c.status,
        Endereco: enderecoPrimario.rua,
        Cidade: enderecoPrimario.cidade,
        UF: enderecoPrimario.uf,
        Serviços_Registrados: qtdPedidos,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(simplifiedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
    XLSX.writeFile(workbook, nomeArquivo);
  };

  const abrirModalVisualizar = (cliente) => {
    setClienteDetalhes(cliente);
    setOpenDetails(true);
  };
  

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <div className="pt-20 lg:pt-80px" />

        <main className="flex-1 item-center p-4 md:p-8">
          {/* Cabeçalho */}
          <div className="text-center mb-8 px-2 w-full max-w-[1600px]">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 mb-2 flex items-center justify-center gap-2">
              Clientes
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Visualize e gerencie todos os clientes de sua empresa
            </p>
          </div>

          <div className="flex max-w-[1800px] mx-auto pt-10 flex-col gap-6">
            {/* Tabela de Clientes */}
            <div className="flex flex-col gap-6 bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
              {/* Barra de ações */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
                <div className="flex gap-2 w-full md:w-auto">
                  <button
                    onClick={abrirModalCriar}
                    className="bg-[#007EA7] text-white font-semibold py-3 px-5 rounded-md hover:bg-[#006891] transition-colors flex items-center justify-center whitespace-nowrap gap-2 cursor-pointer"
                  >
                    Novo Cliente
                  </button>
                </div>

                <div className="flex items-center gap-3 w-full justify-end">
                  {/* Busca */}
                  <div className="relative w-full max-w-lg">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Busque por nome..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#007EA7] focus:border-[#007EA7] text-sm"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Filtros */}
                  <div className="flex gap-2 w-auto whitespace-nowrap">
                    {/* Ordenar */}
                    <select
                      value={ordenar}
                      onChange={(e) => setOrdenar(e.target.value)}
                      className="border border-gray-300 py-2.5 px-4 rounded-md text-md text-gray-700 font-medium cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <option value="recentes">Recentes</option>
                      <option value="antigos">Antigos</option>
                      <option value="az">A-Z</option>
                      <option value="za">Z-A</option>
                    </select>

                    {/* Situação */}
                    <select
                      value={situacao}
                      onChange={(e) => setSituacao(e.target.value)}
                      className="border border-gray-300 py-2.5 px-4 rounded-md text-md text-gray-700 font-medium cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <option value="Todos">Todos</option>
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                      <option value="Finalizado">Finalizado</option>
                    </select>

                    {/* Exportar */}
                    <button
                      onClick={handleExportar}
                      disabled={selecionados.length === 0}
                      className="flex items-center gap-2 border border-gray-300 py-2.5 px-4 rounded-md text-md text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4" />
                      Exportar {selecionados.length > 0 && `(${selecionados.length})`}
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabela */}
              <div className="overflow-x-auto">
                {/* Cabeçalho da tabela */}
                <div className="flex items-center bg-gray-50 border-b border-gray-200 mb-2 min-h-48px rounded-t-md text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <div className="py-3 w-[5%] pl-4 pr-1">
                    <input
                      type="checkbox"
                      checked={
                        clientesFiltrados.length > 0 &&
                        selecionados.length === clientesFiltrados.length
                      }
                      onChange={handleSelectAllClick}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="py-3 w-[25%] pl-2 pr-1">Nome</div>
                  <div className="py-3 w-[15%] px-4">Contato</div>
                  <div className="py-3 w-[20%] px-4">Email</div>
                  <div className="py-3 w-[15%] text-center">Status</div>
                  <div className="py-3 w-[10%] text-center">Serviços</div>
                  <div className="py-3 w-[10%] text-right pr-8">Ações</div>
                </div>

                {/* Linhas da tabela */}
                <div>
                  {clientesPagina.length === 0 ? (
                    <div className="text-center p-8 text-gray-500">
                      <p>
                        {busca
                          ? "Nenhum resultado encontrado."
                          : "Nenhum cliente cadastrado."}
                      </p>
                      {busca && (
                        <button
                          onClick={() => setBusca("")}
                          className="mt-2 text-[#007EA7] hover:underline"
                        >
                          Limpar busca
                        </button>
                      )}
                    </div>
                  ) : (
                    clientesPagina.map((c) => {
                      const isItemSelected = isSelected(c.id);
                      const qtdPedidos = pedidos.filter((p) => p.cliente?.id === c.id).length;

                      return (
                        <React.Fragment key={c.id}>
                          <div
                            className={`flex items-center border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                              isItemSelected ? "bg-blue-50" : ""
                            }`}
                          >
                            <div className="py-3 w-[5%] pl-4 pr-1">
                              <input
                                type="checkbox"
                                checked={isItemSelected}
                                onChange={(event) => handleSelectClick(event, c.id)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                            </div>
                            <div className="py-3 w-[25%] pl-2 pr-1 text-sm text-gray-900 truncate">
                              {c.nome}
                            </div>
                            <div className="py-3 w-[15%] px-4 text-sm text-gray-600 truncate">
                              {formatPhone(c.telefone)}
                            </div>
                            <div className="py-3 w-[20%] px-4 text-sm text-gray-600 truncate">
                              {c.email}
                            </div>
                            <div className="py-3 w-[15%] text-center">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                                  c.status === "Ativo"
                                    ? "bg-green-100 text-green-800"
                                    : c.status === "Inativo"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {c.status}
                              </span>
                            </div>
                            <div className="py-3 w-[10%] text-center text-sm text-gray-900">
                              {qtdPedidos}
                            </div>
                            <div className="py-3 w-[10%] text-right pr-8">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    abrirModalEditar(c);
                                  }}
                                  className="p-1.5 text-gray-600 hover:text-[#007EA7] hover:bg-gray-100 rounded transition-colors cursor-pointer"
                                  title="Editar"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setClienteDetalhes(c);
                                    setOpenDetails(true);
                                  }}
                                  className="p-1.5 text-gray-600 hover:text-[#007EA7] hover:bg-gray-100 rounded transition-colors cursor-pointer"
                                  title="Visualizar detalhes"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Paginação */}
              {clientesFiltrados.length > 0 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
                  <p className="text-sm text-gray-600">
                    Mostrando{" "}
                    <span className="font-medium">
                      {clientesFiltrados.length > 0 ? indexPrimeiro + 1 : 0}-{Math.min(indexUltimo, clientesFiltrados.length)}
                    </span>{" "}
                    de <span className="font-medium">{clientesFiltrados.length}</span>{" "}
                    resultados
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPagina((prev) => Math.max(prev - 1, 1))}
                      disabled={pagina === 1}
                      className="flex items-center gap-1 border border-gray-300 py-2 px-4 rounded-md text-sm text-gray-700 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setPagina((prev) => Math.min(prev + 1, totalPaginas))}
                      disabled={pagina === totalPaginas}
                      className="flex items-center gap-1 border border-gray-300 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modais */}
      <ClienteFormModal
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={atualizarClientes}
        modoEdicao={modoEdicao}
        clienteInicial={clienteSelecionado}
      />
      
      <ClienteDetailsModal
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        cliente={clienteDetalhes}
        servicos={Array.isArray(pedidos) ? pedidos : []}
      />
    </div>
  );
}