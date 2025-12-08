import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import Header from "../../shared/components/header/header";
import Sidebar from "../../shared/components/sidebar/sidebar";
import {
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  MenuItem,
  Divider,
  Checkbox,
} from "@mui/material";
import {
  Edit,
  FileDownloadOutlined,
  KeyboardArrowDown,
  VisibilityOutlined,
} from "@mui/icons-material";
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
  const [openRowId, setOpenRowId] = useState(null);

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
    
    let filtered = clientesArray.filter((c) =>
      c.nome && c.nome.toLowerCase().includes(busca.toLowerCase())
    );
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

        await Api.put(`/clientes/${clienteSelecionado.id}`, clienteAtualizado);

        setClientes((prev) =>
          prev.map((c) =>
            c.id === clienteSelecionado.id ? clienteAtualizado : c
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
    <div className={`w-full min-h-screen bg-[#F9FAFB] flex ${sidebarOpen ? '' : ''}`}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={`flex-1 flex flex-col min-h-screen overflow-hidden ${sidebarOpen ? 'md:ml-[280px]' : ''}`}>
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <div className="h-[80px]" />

        {/* Page title container (replicates .page-title-container) */}
        <div className={`w-full bg-white border-b border-gray-200 box-border sticky top-0 z-10 px-8 pt-6 pb-4 ${sidebarOpen ? 'md:ml-[280px]' : ''}`}>
          <div className="mb-0 text-center">
            <h1 className="font-sans font-bold text-[24px] text-[#1F2937] m-0">Clientes</h1>
            <p className="text-[#6B7280] text-lg mt-1">Visualize todos os clientes de sua empresa</p>
          </div>
        </div>

        <main className="flex-1 px-8 pt-8 pb-12 overflow-hidden">
          <div className="max-w-[1800px] mx-auto h-full flex flex-col">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col flex-1 overflow-hidden">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <Button
                  variant="contained"
                  className="bg-[#007EA7] font-bold py-2 px-5 rounded-md hover:bg-[#006891] text-white"
                  onClick={abrirModalCriar}
                >
                  Novo Cliente
                </Button>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                  <TextField
                    size="small"
                    placeholder="Busque por nome..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full sm:w-48"
                  />

                  <TextField
                    select
                    size="small"
                    label="Ordenar"
                    value={ordenar}
                    onChange={(e) => setOrdenar(e.target.value)}
                    className="w-full sm:w-32"
                  >
                    <MenuItem value="recentes">Recentes</MenuItem>
                    <MenuItem value="antigos">Antigos</MenuItem>
                    <MenuItem value="az">A-Z</MenuItem>
                    <MenuItem value="za">Z-A</MenuItem>
                  </TextField>

                  <TextField
                    select
                    size="small"
                    label="Situação"
                    value={situacao}
                    onChange={(e) => setSituacao(e.target.value)}
                    className="w-full sm:w-32"
                  >
                    <MenuItem value="Todos">Todos</MenuItem>
                    <MenuItem value="Ativo">Ativo</MenuItem>
                    <MenuItem value="Inativo">Inativo</MenuItem>
                    <MenuItem value="Finalizado">Finalizado</MenuItem>
                  </TextField>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FileDownloadOutlined />}
                    className="w-full sm:w-auto text-xs"
                    onClick={handleExportar}
                    disabled={selecionados.length === 0}
                  >
                    {`Exportar ${selecionados.length}`}
                  </Button>
                </div>
              </div>

            <div className="flex-1 overflow-y-auto">
              <TableContainer component={Paper} elevation={0} className="min-w-[1300px]">
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          indeterminate={
                            selecionados.length > 0 &&
                            selecionados.length < clientesFiltrados.length
                          }
                          checked={
                            clientesFiltrados.length > 0 &&
                            selecionados.length === clientesFiltrados.length
                          }
                          onChange={handleSelectAllClick}
                          inputProps={{
                            "aria-label": "select all filtered clients",
                          }}
                        />
                      </TableCell>
                      <TableCell>Nome</TableCell>
                      <TableCell>Contato</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>­­­Prestação de serviço</TableCell>
                      <TableCell>ㅤ­­­­­­­­­­­­Ações</TableCell>
                    </TableRow>­­
                  </TableHead>

                    <TableBody>
                      {clientesPagina.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Typography p={2} color="textSecondary">
                              {busca
                                ? "Nenhum resultado encontrado."
                                : "Nenhum cliente cadastrado."}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        clientesPagina.map((c) => {
                          const isItemSelected = isSelected(c.id);

                          return (
                            <React.Fragment key={c.id}>
                              <TableRow
                                className="border-b"
                                hover
                                onClick={(event) => handleSelectClick(event, c.id)}
                                role="checkbox"
                                aria-checked={isItemSelected}
                                tabIndex={-1}
                                selected={isItemSelected}
                              >
                                <TableCell padding="checkbox" sx={{ py: 0 }}>
                                  <Checkbox
                                    color="primary"
                                    checked={isItemSelected}
                                    inputProps={{
                                      "aria-labelledby": `client-checkbox-${c.id}`,
                                    }}
                                  />
                                </TableCell>
                                <TableCell
                                  id={`client-checkbox-${c.id}`}
                                  sx={{ color: '#424242', py: 1 }}
                                  className="truncate"
                                >
                                  {c.nome}
                                </TableCell>
                                <TableCell sx={{ color: '#424242', py: 1 }} className="truncate">
                                  {formatPhone(c.telefone)}
                                </TableCell>
                                <TableCell sx={{ color: '#424242', py: 1 }} className="truncate hidden sm:table-cell">
                                  {c.email}
                                </TableCell>
                                <TableCell sx={{ py: 1 }}>
                                  <div className="flex flex-col xl:flex-row items-start xl:items-center gap-2">
                                    <Chip
                                      label={c.status}
                                      color={
                                        c.status === "Ativo"
                                          ? "success"
                                          : c.status === "Inativo"
                                          ? "error"
                                          : "default"
                                      }
                                      variant="outlined"
                                      size="small"
                                    />
                                    <Button
                                      size="small"
                                      startIcon={<VisibilityOutlined />}
                                      sx={{
                                        color: '#424242',
                                        textTransform: 'none',
                                        fontSize: '0.75rem',
                                        minWidth: 'auto',
                                        padding: '2px 8px',
                                        '&:hover': {
                                          backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                        }
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <span className="hidden lg:inline">Visualizar</span>
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell sx={{ py: 1 }}>
                                  <div className="flex items-center gap-1">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        abrirModalEditar(c);
                                      }}
                                    >
                                      <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setClienteDetalhes(c);
                                        setOpenDetails(true);
                                      }}
                                    >
                                      <KeyboardArrowDown />
                                    </IconButton>
                                  </div>
                                </TableCell>
                              </TableRow>

                             </React.Fragment>
                           );
                         })
                       )}
                     </TableBody>
                   </Table>
                 </TableContainer>
               </div>
 
               {clientesFiltrados.length > 0 && (
                 <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-gray-200 gap-3">
                   <span className="text-sm text-gray-600">
                     Mostrando {indexPrimeiro + 1} a{" "}
                     {Math.min(indexUltimo, clientesFiltrados.length)} de{" "}
                     {clientesFiltrados.length} resultados
                   </span>
                   <div className="flex gap-2">
                     <Button
                       variant="outlined"
                       size="small"
                       onClick={() => setPagina((prev) => Math.max(prev - 1, 1))}
                       disabled={pagina === 1}
                       className="text-xs"
                     >
                       Anterior
                     </Button>
                     <Button
                       variant="outlined"
                       size="small"
                       onClick={() =>
                         setPagina((prev) => Math.min(prev + 1, totalPaginas))
                       }
                       disabled={pagina === totalPaginas}
                       className="text-xs"
                     >
                       Próximo
                     </Button>
                   </div>
                 </div>
               )}
             </div>
           </div>
         </main>

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
     </div>
   );
 }