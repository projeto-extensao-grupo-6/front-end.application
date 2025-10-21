import { useEffect, useState } from "react";
import MainBox from "../../shared/components/clienteComponents/mainBox/mainBox";
import ButtonsContainer from "../../shared/components/clienteComponents/buttonsContainer/buttonsContainer";
import BtnNovoCliente from "../../shared/components/clienteComponents/buttonsContainer/buttons/btnNovoCliente/btnNovoCliente";
import BtnExport from "../../shared/components/clienteComponents/buttonsContainer/buttons/btnExport/btnExport";
import SearchBar from "../../shared/components/clienteComponents/buttonsContainer/searchBar/searchBar";
import FilterDropdown from "../../shared/components/clienteComponents/buttonsContainer/filterDropdown/filterDropdown";
import TableContainer from "../../shared/components/clienteComponents/tableContainer/tableContainer";
import PaginationContainer from "../../shared/components/clienteComponents/paginationContainer/paginationContainer";
import BtnSwitchPages from "../../shared/components/clienteComponents/buttonsContainer/buttons/btnSwitchPages/btnSwitchPages";
import ClienteModal from "../../shared/components/clienteComponents/modal/clienteModal";
import ExportModal from "../../shared/components/clienteComponents/modal/exportModal/exportModal";
import CalendarModal from "../../shared/components/clienteComponents/modal/calendarModal/calendarModal";
import Sidebar from "../../shared/components/sidebar/sidebar";
import Header from "../../shared/components/header/header";
import SuccessModal from "../../shared/components/clienteComponents/modal/successModal/successModal"; 
import "./historico-clientes.css";

const mockData = [
  {
    id: 1,
    nome: "João Silva",
    contato: "(11) 98765-4321",
    email: "joao.silva@email.com",
    status: "Ativo",
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
        desconto: "10"
      },
      {
        servico: "Troca de Disjuntores",
        dataOrcamento: "05/03/2024",
        dataServico: "08/03/2024",
        valor: "450.00",
        formaPagamento: "Cartão",
        funcionario: "Maria Santos",
        desconto: "5"
      }
    ]
  },
  {
    id: 2,
    nome: "Maria Oliveira",
    contato: "(11) 97654-3210",
    email: "maria.oliveira@email.com",
    status: "Finalizado",
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
        desconto: "0"
      }
    ]
  },
  {
    id: 3,
    nome: "Carlos Santos",
    contato: "(11) 96543-2109",
    email: "carlos.santos@email.com",
    status: "Ativo",
    endereco: "Rua Augusta, 500",
    cidade: "São Paulo",
    uf: "SP",
    historicoServicos: []
  },
  {
    id: 4,
    nome: "Ana Paula",
    contato: "(11) 95432-1098",
    email: "ana.paula@email.com",
    status: "Finalizado",
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
        desconto: "15"
      },
      {
        servico: "Pintura de Paredes",
        dataOrcamento: "15/04/2024",
        dataServico: "20/04/2024",
        valor: "1200.00",
        formaPagamento: "Pix",
        funcionario: "Carlos Oliveira",
        desconto: "10"
      },
      {
        servico: "Troca de Piso",
        dataOrcamento: "25/04/2024",
        dataServico: "05/05/2024",
        valor: "2800.00",
        formaPagamento: "Cartão",
        funcionario: "Maria Santos",
        desconto: "8"
      }
    ]
  },
  {
    id: 5,
    nome: "Roberto Lima",
    contato: "(11) 94321-0987",
    email: "roberto.lima@email.com",
    status: "Ativo",
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
        desconto: "5"
      }
    ]
  },
  {
    id: 6,
    nome: "Fernanda Costa",
    contato: "(11) 93210-9876",
    email: "fernanda.costa@email.com",
    status: "Finalizado",
    endereco: "Av. Rebouças, 1500",
    cidade: "São Paulo",
    uf: "SP",
    historicoServicos: []
  },
  {
    id: 7,
    nome: "Lucas Pereira",
    contato: "(11) 92109-8765",
    email: "lucas.pereira@email.com",
    status: "Ativo",
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
        desconto: "0"
      }
    ]
  },
  {
    id: 8,
    nome: "Juliana Alves",
    contato: "(11) 91098-7654",
    email: "juliana.alves@email.com",
    status: "Finalizado",
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
        desconto: "12"
      },
      {
        servico: "Manutenção Mensal",
        dataOrcamento: "01/08/2024",
        dataServico: "03/08/2024",
        valor: "280.00",
        formaPagamento: "Pix",
        funcionario: "Carlos Oliveira",
        desconto: "12"
      }
    ]
  }
]

function HistoricoClientes() {
  const [historico, setHistorico] = useState(mockData);
  const [erro, setErro] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const itemsPerPage = 7;
  const totalItems = historico.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = historico.slice(indexOfFirstItem, indexOfLastItem);

  const handleNovoCliente = () => {
    setModalMode("create");
    setSelectedCliente(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCliente(null);
  };

  const handleSubmitCliente = (clienteData) => {
    if (modalMode === "edit") {
      setHistorico(prev => 
        prev.map(c => c.id === clienteData.id ? { ...c, ...clienteData } : c)
      );
      console.log("Cliente atualizado:", clienteData);
    } else {
      const novoCliente = {
        ...clienteData,
        id: historico.length + 1,
        historicoServicos: []
      };
      setHistorico(prev => [...prev, novoCliente]);
      console.log("Novo cliente adicionado:", novoCliente);

      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
    }
  };

  const handleFiltrar = (option) => {
    console.log("Filtrar por:", option);
  };

  const handleEdit = (id) => {
    const cliente = historico.find(c => c.id === id);
    if (cliente) {
      setSelectedCliente(cliente);
      setModalMode("edit");
      setIsModalOpen(true);
    }
  };

  const handleDelete = (id) => {
    console.log("Excluir cliente:", id);
    setHistorico(prev => prev.filter(c => c.id !== id));
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handleExportar = () => {
    setIsExportModalOpen(true);
  };

  const handleExportSubmit = (file) => {
    console.log("Exportar arquivo:", file);
  };

  const handleOrdenar = (option) => {
    console.log("Ordenar por:", option);
    if (option === "Data") {
      setIsCalendarModalOpen(true);
    }
  };

  const handleSelectDate = (date) => {
    console.log("Data selecionada:", date);
  };

  const handleSuccessConfirm = () => {
    setIsSuccessModalOpen(false);
    window.location.href = "./agendamentos";
    console.log("Usuário aceitou avançar");
  };

  return (
    <>
      <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <MainBox> 
        <ButtonsContainer>
          <BtnNovoCliente onClick={handleNovoCliente} />
          <SearchBar
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <FilterDropdown
            label="Ordenar"
            options={["Nome A-Z", "Nome Z-A", "Status Ativo", "Status Finalizado", "Data"]}
            onSelect={handleOrdenar}
          />
          <FilterDropdown
            label="Situação"
            options={["Todos", "Ativos", "Finalizados"]}
            onSelect={handleFiltrar}
          />
          <BtnExport onClick={handleExportar} />
        </ButtonsContainer>

        <TableContainer
          data={currentItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <PaginationContainer
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
        >
          <BtnSwitchPages 
            direction="prev" 
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          />
          <BtnSwitchPages 
            direction="next" 
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          />
        </PaginationContainer>
      </MainBox>

      <ClienteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitCliente}
        cliente={selectedCliente}
        mode={modalMode}
      />
      
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportSubmit}
      />
      
      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        onSelectDate={handleSelectDate}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onConfirm={handleSuccessConfirm}
        message="Deseja avançar?"
      />
    </>
  );
}

export default HistoricoClientes;