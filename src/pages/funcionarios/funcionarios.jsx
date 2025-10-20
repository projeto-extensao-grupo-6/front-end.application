import React, { useState, useEffect } from "react";
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
  Checkbox,
  IconButton,
  Chip,
  Box,
  Typography,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

import data from "./funcionariosData.json";
import FuncionarioForm from "../../shared/components/modalFuncionarios/FuncionarioForm";
import DeleteFuncionario from "../../shared/components/modalFuncionarios/DeleteFuncionario";

export default function Funcionarios() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [funcionarios, setFuncionarios] = useState([]);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const limitePorPagina = 6;

  const [openForm, setOpenForm] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);

  const [openDelete, setOpenDelete] = useState(false);
  const [funcionarioParaDeletar, setFuncionarioParaDeletar] = useState(null);

  useEffect(() => {
    setFuncionarios(data);
  }, []);

  const funcionariosFiltrados = funcionarios.filter((f) =>
    f.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const indexUltimo = pagina * limitePorPagina;
  const indexPrimeiro = indexUltimo - limitePorPagina;
  const funcionariosPagina = funcionariosFiltrados.slice(indexPrimeiro, indexUltimo);
  const totalPaginas = Math.ceil(funcionariosFiltrados.length / limitePorPagina);

  const abrirModalCriar = () => {
    setModoEdicao(false);
    setFuncionarioSelecionado(null);
    setOpenForm(true);
  };

  const abrirModalEditar = (funcionario) => {
    setModoEdicao(true);
    setFuncionarioSelecionado(funcionario);
    setOpenForm(true);
  };

  const abrirModalDeletar = (funcionario) => {
    setFuncionarioParaDeletar(funcionario);
    setOpenDelete(true);
  };

  const atualizarFuncionarios = (novoFunc) => {
    if (modoEdicao && funcionarioSelecionado) {
      const atualizados = funcionarios.map((f) =>
        f.id === funcionarioSelecionado.id ? { ...f, ...novoFunc } : f
      );
      setFuncionarios(atualizados);
    } else {
      setFuncionarios((prev) => [
        ...prev,
        { ...novoFunc, id: prev.length + 1 },
      ]);
    }
  };

  const deletarFuncionario = (id) => {
    setFuncionarios((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <div className="h-[80px]" />

        <main className="flex-1 p-8">
          <div className="max-w-[1800px] mx-auto">
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-bold text-gray-800">Controle de funcionário</h1>
              <p className="text-gray-500 text-lg">
                Visualize todos os funcionários de sua empresa
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <Button
                  variant="contained"
                  sx={{ backgroundColor: "#007EA7", "&:hover": { backgroundColor: "#00698A" } }}
                  onClick={abrirModalCriar}
                >
                  Novo Funcionário
                </Button>
                <TextField
                  size="small"
                  placeholder="Busque por nome..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full sm:w-80"
                />
              </div>

              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox />
                      </TableCell>
                      <TableCell>Nome</TableCell>
                      <TableCell>Telefone</TableCell>
                      <TableCell>Função</TableCell>
                      <TableCell>Escala</TableCell>
                      <TableCell>Contrato</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {funcionariosPagina.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell padding="checkbox">
                          <Checkbox />
                        </TableCell>
                        <TableCell>{f.nome}</TableCell>
                        <TableCell>{f.telefone}</TableCell>
                        <TableCell>{f.funcao}</TableCell>
                        <TableCell>{f.escala}</TableCell>
                        <TableCell>{f.contrato}</TableCell>
                        <TableCell>
                          <Chip
                            label={f.status}
                            color={
                              f.status === "Ativo"
                                ? "success"
                                : f.status === "Pausado"
                                ? "error"
                                : "default"
                            }
                            variant="outlined"
                            className="!font-medium"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <IconButton size="small" onClick={() => abrirModalEditar(f)}>
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => abrirModalDeletar(f)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
                <span>
                  Mostrando {indexPrimeiro + 1} a{" "}
                  {Math.min(indexUltimo, funcionariosFiltrados.length)} de{" "}
                  {funcionariosFiltrados.length} resultados
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
                    onClick={() => setPagina((prev) => Math.min(prev + 1, totalPaginas))}
                    disabled={pagina === totalPaginas}
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <FuncionarioForm
        open={openForm}
        setOpen={setOpenForm}
        modoEdicao={modoEdicao}
        funcionario={funcionarioSelecionado}
        salvarFuncionario={atualizarFuncionarios}
      />

      <DeleteFuncionario
        open={openDelete}
        setOpen={setOpenDelete}
        funcionario={funcionarioParaDeletar}
        deletarFuncionario={deletarFuncionario}
      />
    </div>
  );
}