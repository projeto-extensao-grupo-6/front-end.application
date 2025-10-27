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
  Collapse,
  Divider,
  Checkbox,
} from "@mui/material";
import {
  Edit,
  FileDownloadOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  VisibilityOutlined,
} from "@mui/icons-material";
import ClienteFormModal from "../../shared/components/clienteComponents/ClienteFormModal";

const API_URL = "http://localhost:3000/clientes";

const formatCurrency = (value) => {
  if (value == null || isNaN(value)) return "R$ 0,00";
  return `R$ ${parseFloat(value).toFixed(2).replace(".", ",")}`;
};

const formatPhone = (phoneStr) => {
  if (!phoneStr) return "N/A";
  const cleaned = phoneStr.replace(/\D/g, "");
  if (cleaned.length === 11) {
    // Formato (XX) XXXXX-XXXX
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(
      2,
      7
    )}-${cleaned.substring(7, 11)}`;
  }
  if (cleaned.length === 10) {
    // Formato (XX) XXXX-XXXX
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(
      2,
      6
    )}-${cleaned.substring(6, 10)}`;
  }
  return phoneStr;
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

  const fetchClientes = async () => {
    try {
      const response = await fetch(`${API_URL}?_sort=id&_order=desc`);
      if (!response.ok) throw new Error("Erro ao buscar dados da API");
      const data = await response.json();
      setClientes(data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const clientesFiltrados = useMemo(() => {
    let filtered = clientes.filter((c) =>
      c.nome.toLowerCase().includes(busca.toLowerCase())
    );
    if (situacao !== "Todos") filtered = filtered.filter((c) => c.status === situacao);

    return filtered.sort((a, b) => {
      if (ordenar === "recentes") return b.id - a.id;
      if (ordenar === "antigos") return a.id - b.id;
      if (ordenar === "az") return a.nome.localeCompare(b.nome);
      if (ordenar === "za") return b.nome.localeCompare(a.nome);
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

        const response = await fetch(`${API_URL}/${clienteSelecionado.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clienteAtualizado),
        });

        if (!response.ok) throw new Error("Erro ao atualizar cliente");

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
        const maxIdExistente = clientes.reduce(
          (maxId, c) => Math.max(c.id, maxId),
          0
        );
        const novoClienteComId = { ...dadosCliente, id: maxIdExistente + 1 };

        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(novoClienteComId),
        });

        if (!response.ok) throw new Error("Erro ao criar cliente");

        const novoCliente = await response.json();
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

    const simplifiedData = dataToExport.map((c) => ({
      Nome: c.nome,
      Contato: c.contato,
      Email: c.email,
      Status: c.status,
      Endereco: c.endereco,
      Cidade: c.cidade,
      UF: c.uf,
      Serviços_Registrados: c.historicoServicos ? c.historicoServicos.length : 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(simplifiedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
    XLSX.writeFile(workbook, nomeArquivo);
  };


  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <div className="h-20px" />
        <main className="flex-1 p-8">
          <div className="mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
            <p className="text-gray-500 text-lg">
              Visualize todos os clientes de sua empresa
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
              <Button
                variant="contained"
                className="bg-[#007EA7] hover:bg-[#00698A] text-white"
                onClick={abrirModalCriar}
              >
                Novo Cliente
              </Button>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <TextField
                  size="small"
                  placeholder="Busque por nome..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full sm:w-60"
                />

                <TextField
                  select
                  size="small"
                  label="Ordenar"
                  value={ordenar}
                  onChange={(e) => setOrdenar(e.target.value)}
                  className="w-full sm:w-40"
                >
                  <MenuItem value="recentes">Mais Recentes</MenuItem>
                  <MenuItem value="antigos">Mais Antigos</MenuItem>
                  <MenuItem value="az">Nome (A-Z)</MenuItem>
                  <MenuItem value="za">Nome (Z-A)</MenuItem>
                </TextField>

                <TextField
                  select
                  size="small"
                  label="Situação"
                  value={situacao}
                  onChange={(e) => setSituacao(e.target.value)}
                  className="w-full sm:w-40"
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  <MenuItem value="Ativo">Ativo</MenuItem>
                  <MenuItem value="Inativo">Inativo</MenuItem>
                  <MenuItem value="Finalizado">Finalizado</MenuItem>
                </TextField>

                <Button
                  variant="outlined"
                  size="medium"
                  startIcon={<FileDownloadOutlined />}
                  className="w-full sm:w-auto"
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
                      <TableCell>ㅤㅤㅤNome</TableCell>
                      <TableCell>ㅤㅤContato</TableCell>
                      <TableCell>ㅤㅤㅤㅤEmail</TableCell>
                      <TableCell>­­ㅤ­Prestação de serviço</TableCell>
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
                        const hasHistory =
                          c.historicoServicos && c.historicoServicos.length > 0;

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
                              >
                                {c.nome}
                              </TableCell>
                              <TableCell sx={{ color: '#424242', py: 1 }}>
                                {formatPhone(c.contato)}
                              </TableCell>
                              <TableCell sx={{ color: '#424242', py: 1 }}>
                                {c.email}
                              </TableCell>
                              <TableCell sx={{ py: 1 }}>
                                <div className="flex items-center gap-1">
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
                                      '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                      }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Visualizar
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
                                      setOpenRowId(openRowId === c.id ? null : c.id);
                                    }}
                                  >
                                    {openRowId === c.id ? (
                                      <KeyboardArrowUp />
                                    ) : (
                                      <KeyboardArrowDown />
                                    )}
                                  </IconButton>
                                </div>
                              </TableCell>
                            </TableRow>

                            <TableRow>
                              <TableCell colSpan={6} className="p-0">
                                <Collapse
                                  in={openRowId === c.id}
                                  timeout="auto"
                                  unmountOnExit
                                >
                                  <div className="m-4 p-6 bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center gap-6">
                                    <div className="flex flex-col md:flex-row justify-around items-center text-center gap-3 mb-2 flex-wrap w-full">
                                      <span className="font-semibold text-gray-900">
                                        Endereço:{" "}
                                        <span className="font-normal text-gray-600">
                                          {c.endereco || "N/A"}
                                        </span>
                                      </span>
                                      <span className="font-semibold text-gray-900">
                                        Cidade:{" "}
                                        <span className="font-normal text-gray-600">
                                          {c.cidade || "N/A"}
                                        </span>
                                      </span>
                                      <span className="font-semibold text-gray-900">
                                        UF:{" "}
                                        <span className="font-normal text-gray-600">
                                          {c.uf || "N/A"}
                                        </span>
                                      </span>
                                    </div>

                                    <Divider className="w-11/12 mb-4" />

                                    <div className="w-full max-w-[950px] flex flex-col items-center gap-6">
                                      <h3 className="text-center text-lg font-semibold mb-3">
                                        Histórico de Serviços
                                      </h3>

                                      {hasHistory ? (
                                        <div className="w-full flex flex-col items-center gap-6 pr-1">
                                          {c.historicoServicos.map((hist) => (
                                            <HistoryCard
                                              hist={hist}
                                              key={hist.id || Math.random()}
                                            />
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-center w-full">
                                          Nenhum histórico de serviço encontrado.
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </Collapse>
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
              <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
                <span>
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
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>

        <ClienteFormModal
          open={openForm}
          onClose={() => setOpenForm(false)}
          onSubmit={atualizarClientes}
          modoEdicao={modoEdicao}
          clienteInicial={clienteSelecionado}
        />
      </div>
    </div>
  );
}