import { useEffect, useState } from "react";
import MainBox from "../../shared/components/clienteComponents/mainBox/mainBox";
import ButtonsContainer from "../../shared/components/clienteComponents/buttonsContainer/buttonsContainer";
import BtnNovoCliente from "../../shared/components/clienteComponents/buttonsContainer/buttons/btnNovoCliente/btnNovoCliente";
import BtnExport from "../../shared/components/clienteComponents/buttonsContainer/buttons/btnExport/btnExport";
import SearchBar from "../../shared/components/clienteComponents/buttonsContainer/searchBar/searchBar";
import FilterDropdown from "../../shared/components/clienteComponents/buttonsContainer/filterDropdown/filterDropdown";
import TableContainer from "../../shared/components/clienteComponents/tableContainer/tableContainer";
import "./historico-clientes.css";

function HistoricoClientes() {
  const [historico, setHistorico] = useState([]);
  const [erro, setErro] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("http://localhost:5173/historico-clientes")
      .then((r) => {
        if (!r.ok) throw new Error("Falha ao buscar histórico");
        return r.json();
      })
      .then(setHistorico)
      .catch((e) => setErro(e.message));
  }, []);

  const handleNovoCliente = () => {
    console.log("Novo cliente clicado");
  };

  const handleExportar = () => {
    console.log("Exportar clicado");
  };

  const handleOrdenar = (option) => {
    console.log("Ordenar por:", option);
  };

  const handleFiltrar = (option) => {
    console.log("Filtrar por:", option);
  };

  const handleEdit = (id) => {
    console.log("Editar cliente:", id);
  };

  const handleDelete = (id) => {
    console.log("Excluir cliente:", id);
  };

  return (
    <MainBox>
      <ButtonsContainer>
        <BtnNovoCliente onClick={handleNovoCliente} />
        <SearchBar
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterDropdown
          label="Ordenar Por"
          options={["Data", "Nome", "Email"]}
          onSelect={handleOrdenar}
        />
        <FilterDropdown
          label="Situação"
          options={["Todos", "Ativos", "Inativos"]}
          onSelect={handleFiltrar}
        />
        <BtnExport onClick={handleExportar} />
      </ButtonsContainer>

      <TableContainer
        data={historico}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </MainBox>
  );
}

export default HistoricoClientes;