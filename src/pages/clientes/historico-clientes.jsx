import { useEffect, useState } from "react";
import MainBox from "../../shared/components/clienteComponents/mainBox/mainBox";
import ButtonsContainer from "../../shared/components/clienteComponents/buttonsContainer/buttonsContainer";
import BtnNovoCliente from "../../shared/components/clienteComponents/buttonsContainer/buttons/btnNovoCliente/btnNovoCliente";
import BtnExport from "../../shared/components/clienteComponents/buttonsContainer/buttons/btnExport/btnExport";
import SearchBar from "../../shared/components/clienteComponents/buttonsContainer/searchBar/searchBar";
import FilterDropdown from "../../shared/components/clienteComponents/buttonsContainer/filterDropdown/filterDropdown";
import TableContainer from "../../shared/components/clienteComponents/tableContainer/tableContainer";
import "./historico-clientes.css";

// Dados mockados para teste
const mockData = [
  {
    id: 1,
    nome: "João Silva",
    contato: "(11) 98765-4321",
    email: "joao.silva@email.com",
    servico: "Manutenção Elétrica",
    endereco: "Rua das Flores, 123",
    cidade: "São Paulo",
    uf: "SP",
    historicoServicos: [
      {
        servico: "Instalação de Tomadas",
        dataOrcamento: "10/01/2024",
        dataServico: "15/01/2024",
        valor: "250.00",
        formaPagamento: "Pix",
        funcionario: "Carlos Oliveira",
        desconto: "10",
      },
      {
        servico: "Troca de Disjuntores",
        dataOrcamento: "05/03/2024",
        dataServico: "08/03/2024",
        valor: "450.00",
        formaPagamento: "Cartão",
        funcionario: "Maria Santos",
        desconto: "5",
      },
    ],
  },
  {
    id: 2,
    nome: "Maria Oliveira",
    contato: "(11) 97654-3210",
    email: "maria.oliveira@email.com",
    servico: "Instalação Hidráulica",
    endereco: "Av. Paulista, 1000",
    cidade: "São Paulo",
    uf: "SP",
    historicoServicos: [
      {
        servico: "Reparo de Vazamento",
        dataOrcamento: "20/02/2024",
        dataServico: "22/02/2024",
        valor: "180.00",
        formaPagamento: "Dinheiro",
        funcionario: "Pedro Costa",
        desconto: "0",
      },
    ],
  },
  {
    id: 3,
    nome: "Carlos Santos",
    contato: "(11) 96543-2109",
    email: "carlos.santos@email.com",
    servico: "Pintura Residencial",
    endereco: "Rua Augusta, 500",
    cidade: "São Paulo",
    uf: "SP",
    historicoServicos: [],
  },
  {
    id: 4,
    nome: "Ana Paula",
    contato: "(11) 95432-1098",
    email: "ana.paula@email.com",
    servico: "Reforma Geral",
    endereco: "Rua da Consolação, 250",
    cidade: "São Paulo",
    uf: "SP",
    historicoServicos: [
      {
        servico: "Reforma de Banheiro",
        dataOrcamento: "01/04/2024",
        dataServico: "10/04/2024",
        valor: "3500.00",
        formaPagamento: "Transferência",
        funcionario: "João Almeida",
        desconto: "15",
      },
      {
        servico: "Pintura de Paredes",
        dataOrcamento: "15/04/2024",
        dataServico: "20/04/2024",
        valor: "1200.00",
        formaPagamento: "Pix",
        funcionario: "Carlos Oliveira",
        desconto: "10",
      },
      {
        servico: "Troca de Piso",
        dataOrcamento: "25/04/2024",
        dataServico: "05/05/2024",
        valor: "2800.00",
        formaPagamento: "Cartão",
        funcionario: "Maria Santos",
        desconto: "8",
      },
    ],
  },
  {
    id: 5,
    nome: "Roberto Lima",
    contato: "(11) 94321-0987",
    email: "roberto.lima@email.com",
    servico: "Instalação de Ar Condicionado",
    endereco: "Rua Vergueiro, 800",
    cidade: "São Paulo",
    uf: "SP",
    historicoServicos: [
      {
        servico: "Instalação Split 12000 BTUs",
        dataOrcamento: "12/05/2024",
        dataServico: "15/05/2024",
        valor: "650.00",
        formaPagamento: "Pix",
        funcionario: "Pedro Costa",
        desconto: "5",
      },
    ],
  },
  {
    id: 6,
    nome: "Fernanda Costa",
    contato: "(11) 93210-9876",
    email: "fernanda.costa@email.com",
    servico: "Dedetização",
    endereco: "Av. Rebouças, 1500",
    cidade: "São Paulo",
    uf: "SP",
    historicoServicos: [],
  },
  {
    id: 7,
    nome: "Lucas Pereira",
    contato: "(11) 92109-8765",
    email: "lucas.pereira@email.com",
    servico: "Jardinagem",
    endereco: "Rua Oscar Freire, 300",
    cidade: "São Paulo",
    uf: "SP",
    historicoServicos: [
      {
        servico: "Poda de Árvores",
        dataOrcamento: "18/06/2024",
        dataServico: "20/06/2024",
        valor: "320.00",
        formaPagamento: "Dinheiro",
        funcionario: "João Almeida",
        desconto: "0",
      },
    ],
  },
  {
    id: 8,
    nome: "Juliana Alves",
    contato: "(11) 91098-7654",
    email: "juliana.alves@email.com",
    servico: "Limpeza de Piscina",
    endereco: "Rua dos Pinheiros, 450",
    cidade: "São Paulo",
    uf: "SP",
    historicoServicos: [
      {
        servico: "Limpeza + Tratamento",
        dataOrcamento: "01/07/2024",
        dataServico: "03/07/2024",
        valor: "280.00",
        formaPagamento: "Pix",
        funcionario: "Carlos Oliveira",
        desconto: "12",
      },
      {
        servico: "Manutenção Mensal",
        dataOrcamento: "01/08/2024",
        dataServico: "03/08/2024",
        valor: "280.00",
        formaPagamento: "Pix",
        funcionario: "Carlos Oliveira",
        desconto: "12",
      },
    ],
  },
];

function HistoricoClientes() {
  const [historico, setHistorico] = useState(mockData); // Usando dados mockados
  const [erro, setErro] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Comentado temporariamente para usar dados mockados
  // useEffect(() => {
  //   fetch("http://localhost:5173/historico-clientes")
  //     .then((r) => {
  //       if (!r.ok) throw new Error("Falha ao buscar histórico");
  //       return r.json();
  //     })
  //     .then(setHistorico)
  //     .catch((e) => setErro(e.message));
  // }, []);

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