import React, { useState, useEffect } from "react";
import TaskCreateModal from "../../shared/components/Ui/TaskCreateModal";
import AgendamentoNotification from "../../shared/components/Ui/AgendamentoNotification";
import MiniCalendar from "./components/MiniCalendar";
import SharedCalendarList from "./components/SharedCalendar";
import CalendarView from "./components/CalendarView";
import UpcomingEvents from "./components/UpcomingEvents";
import Icon from "../../shared/components/AppIcon";
import Button from "../../shared/components/buttons/button.component";
import Header from "../../shared/components/header/header";
import Sidebar from "../../shared/components/sidebar/sidebar";
import Api from "../../axios/Api";
import { useAgendamentoNotifications } from "./hooks/useAgendamentoNotifications";
import EditarAgendamentoSimples from "../../shared/components/pedidosServicosComponents/EditarAgendamentoSimples";
import agendamentosService from "../../services/agendamentosService";

const CalendarDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [modalInitialData, setModalInitialData] = useState({});
  const [tasks, setTasks] = useState([]);
  const [showReagendarModal, setShowReagendarModal] = useState(false);
  const [agendamentoToReagendar, setAgendamentoToReagendar] = useState(null);

  // Hook de notificações
  const { currentNotification, dismissNotification, resetNotifications } = useAgendamentoNotifications(tasks);

  const fetchAgendamentos = async () => {
    try {
      const response = await Api.get("/agendamentos");
      const data = response.data;

      const transformedTasks = data.map((agendamento) => {
        // Usar a data original da API (formato YYYY-MM-DD)
        const dataFormatada = agendamento.dataAgendamento;

        // Usar os horários originais da API (formato HH:mm:ss -> HH:mm)
        const startTime = agendamento.inicioAgendamento?.substring(0, 5) || "00:00";
        const endTime = agendamento.fimAgendamento?.substring(0, 5) || "00:00";

        // Criar título completo para o modal usando código + nome do serviço
        let fullTitle = "Agendamento";
        let calendarTitle = `#${String(agendamento.id).padStart(3, '0')}`; // Título curto para o calendário
        
        if (agendamento.servico) {
          const codigo = agendamento.servico.codigo || "";
          const nome = agendamento.servico.nome || "";
          fullTitle = `${codigo} ${nome}`.trim() || agendamento.tipoAgendamento || "Agendamento";
          // Se tem código de serviço, usar no calendário
          if (codigo) {
            calendarTitle = codigo;
          }
        } else {
          fullTitle = agendamento.tipoAgendamento || "Agendamento";
        }

        let backgroundColor = "#3B82F6";
        if (agendamento.tipoAgendamento === "SERVICO") {
          backgroundColor = "#3B82F6";
        } else if (agendamento.tipoAgendamento === "ORCAMENTO") {
          backgroundColor = "#FBBF24";
        }

        return {
          id: agendamento.id,
          title: calendarTitle, // Mostra apenas o código/número no calendário
          fullTitle: fullTitle, // Para o modal de detalhes
          date: dataFormatada,
          startTime: startTime,
          endTime: endTime,
          backgroundColor: backgroundColor,
          // Manter todos os dados originais da API
          ...agendamento,
        };
      });

      setTasks(transformedTasks);
      localStorage.setItem("tasks", JSON.stringify(transformedTasks));
    } catch (error) {
      console.error("❌ Erro ao carregar agendamentos:", error);
    }
  };

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  const handleEventDeleted = (eventId) => {
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== eventId);
      localStorage.setItem("tasks", JSON.stringify(next));
      return next;
    });
    setTimeout(fetchAgendamentos, 400);
  };

  const handleEventCreate = (data = {}) => {
    let formattedDate =
      data?.eventDate ||
      data?.date ||
      selectedDate?.toISOString()?.split("T")?.[0];
    if (formattedDate && formattedDate.includes("/")) {
      const [dia, mes, ano] = formattedDate.split("/");
      formattedDate = `${ano}-${mes}-${dia}`;
    }

    setModalInitialData({
      eventDate: formattedDate,           
      startTime: data?.startTime || "",
      endTime: data?.endTime || "",
      tipoAgendamento: data?.tipoAgendamento || "",
      pedido: null,
      funcionarios: [],
    });

    setShowTaskModal(true);
  };

  const handleTaskSave = (taskData) => {
    const newTask = {
      id: Date.now(),
      ...taskData,
      title: taskData?.category || "Agendamento", 
      date: taskData.eventDate,
      startTime: taskData.startTime,
      endTime: taskData.endTime,
      createdAt: new Date().toISOString(),
      backgroundColor: taskData.backgroundColor || "#3B82F6", 
      color: taskData.backgroundColor, 
    };
    console.log("Nova tarefa criada:", newTask); 
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleCalendarToggle = (calendarId) => {
    console.log("Toggle calendário:", calendarId);
  };

  // Handlers para notificações de agendamento
  const handleReagendarFromNotification = async (agendamento) => {
    dismissNotification();
    setAgendamentoToReagendar(agendamento);
    setShowReagendarModal(true);
  };

  const handleCancelarFromNotification = async (agendamento) => {
    try {
      const confirmar = window.confirm(
        `Tem certeza que deseja cancelar o agendamento #${String(agendamento.id).padStart(3, '0')}?`
      );
      
      if (!confirmar) return;

      await agendamentosService.delete(agendamento.id);
      dismissNotification();
      fetchAgendamentos();
      
      alert('Agendamento cancelado com sucesso!');
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      alert('Erro ao cancelar agendamento. Tente novamente.');
    }
  };

  const handleIniciarFromNotification = async (agendamento) => {
    try {
      const agendamentoData = {
        tipoAgendamento: agendamento.tipoAgendamento,
        dataAgendamento: agendamento.dataAgendamento,
        inicioAgendamento: agendamento.inicioAgendamento,
        fimAgendamento: agendamento.fimAgendamento,
        statusAgendamento: {
          tipo: "AGENDAMENTO",
          nome: "EM ANDAMENTO"
        },
        observacao: agendamento.observacao || ""
      };

      await agendamentosService.update(agendamento.id, agendamentoData);
      dismissNotification();
      fetchAgendamentos();
      
      alert('Agendamento marcado como "Em Andamento"!');
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      alert('Erro ao atualizar agendamento. Tente novamente.');
    }
  };

  const handleReagendarSuccess = () => {
    setShowReagendarModal(false);
    setAgendamentoToReagendar(null);
    fetchAgendamentos();
  };

  return (
    <>
      <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="bg-background h-full pt-15">
        <div className="h-[calc(100vh-80px)] flex">
          {/* Left Sidebar */}
          <div
            className={`${
              sidebarCollapsed ? "w-16" : "w-80"
            } transition-all duration-300 border-r border-hairline bg-surface flex flex-col`}
          >
            <div className="p-5 border-b border-hairline">
              <div className="flex items-center justify-between">
                {!sidebarCollapsed && (
                  <h2 className="font-semibold text-text-primary">
                    Navegação do Calendário
                  </h2>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="cursor-pointer"
                >
                  <Icon
                    name={sidebarCollapsed ? "ChevronRight" : "ChevronLeft"}
                    size={20}
                  />
                </Button>
              </div>
            </div>

            {!sidebarCollapsed && (
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <MiniCalendar
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                />

                {/* <SharedCalendarList onCalendarToggle={handleCalendarToggle} /> */}
              </div>
            )}
          </div>

          {/* Main Calendar View */}
          <div className="flex-1 flex flex-col">
            <div className="border-b border-hairline bg-surface p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-semibold text-text-primary">
                    Agenda de Atendimentos
                  </h1>
                </div>
              </div>
            </div>

          <div className="flex-1 overflow-hidden">
            <CalendarView
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onEventCreate={handleEventCreate}
              events={tasks}
              onEventDeleted={handleEventDeleted}
            />
          </div>
          </div>

          {/* Right Panel */}
          <div
            className={`${
              rightPanelCollapsed ? "w-16" : "w-80"
            } transition-all duration-300 border-l border-hairline bg-surface flex flex-col`}
          >
            <div className="p-5 border-b border-hairline">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                  className="cursor-pointer"
                >
                  <Icon
                    name={rightPanelCollapsed ? "ChevronLeft" : "ChevronRight"}
                    size={20}
                  />
                </Button>
                {!rightPanelCollapsed && (
                  <h2 className="font-semibold text-text-primary">
                    Próximos Eventos
                  </h2>
                )}
              </div>
            </div>

            {!rightPanelCollapsed && (
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <UpcomingEvents events={tasks} />
              </div>
            )}
          </div>
        </div>

      

        {/* Modal */}
        <TaskCreateModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          onSave={handleTaskSave}
          initialData={modalInitialData}
        />

        {/* Modal de Reagendamento */}
        <EditarAgendamentoSimples
          isOpen={showReagendarModal}
          onClose={() => {
            setShowReagendarModal(false);
            setAgendamentoToReagendar(null);
          }}
          agendamento={agendamentoToReagendar}
          onSuccess={handleReagendarSuccess}
        />

        {/* Notificação de Agendamento Próximo */}
        {currentNotification && (
          <AgendamentoNotification
            agendamento={currentNotification}
            onReagendar={handleReagendarFromNotification}
            onCancelar={handleCancelarFromNotification}
            onIniciar={handleIniciarFromNotification}
            onClose={dismissNotification}
          />
        )}
      </div>
    </>
  );
};

export default CalendarDashboard;