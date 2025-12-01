import React, { useState, useEffect } from "react";
import TaskCreateModal from "../../shared/components/Ui/TaskCreateModal";
import MiniCalendar from "./components/MiniCalendar";
import SharedCalendarList from "./components/SharedCalendar";
import CalendarView from "./components/CalendarView";
import UpcomingEvents from "./components/UpcomingEvents";
import Icon from "../../shared/components/AppIcon";
import Button from "../../shared/components/buttons/button.component";
import Header from "../../shared/components/header/header";
import Sidebar from "../../shared/components/sidebar/sidebar";

const API_BASE_URL = "http://localhost:3000/api";

const CalendarDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [modalInitialData, setModalInitialData] = useState({});
  const [tasks, setTasks] = useState([]);

  const getToken = () => {
    return (
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      (localStorage.getItem("user") && JSON.parse(localStorage.getItem("user")).token)
    );
  };

  const fetchAgendamentos = async () => {
    try {
      const token = getToken();
      
      const response = await fetch(`${API_BASE_URL}/agendamentos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // ...(token && { Authorization: `Bearer ${token}` }), // ✅ Adiciona token se existir
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const transformedTasks = data.map((agendamento) => {
        let dataFormatada = agendamento.dataAgendamento;
        if (agendamento.dataAgendamento && agendamento.dataAgendamento.includes("/")) {
          const [dia, mes, ano] = agendamento.dataAgendamento.split("/");
          dataFormatada = `${ano}-${mes}-${dia}`;
        }

        const startTime = agendamento.inicioAgendamento?.substring(0, 5) || "00:00";
        const endTime = agendamento.fimAgendamento?.substring(0, 5) || "00:00";

        let backgroundColor = "#3B82F6";
        if (agendamento.tipoAgendamento === "SERVICO") {
          backgroundColor = "#3B82F6";
        } else if (agendamento.tipoAgendamento === "ORCAMENTO") {
          backgroundColor = "#FBBF24";
        }

        return {
          id: agendamento.id,
          title: agendamento.tipoAgendamento || "Agendamento",
          date: dataFormatada,
          startTime: startTime,
          endTime: endTime,
          backgroundColor: backgroundColor,
          observacao: agendamento.observacao,
          endereco: agendamento.endereco,
          funcionarios: agendamento.funcionarios,
          pedido: agendamento.pedido,
          statusAgendamento: agendamento.statusAgendamento,
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
    // opcional: sincronizar novamente
    setTimeout(fetchAgendamentos, 400);
  };

  const handleEventCreate = (data = {}) => {
    // eventData.eventDate vem do CalendarView quando você clica num dia/slot
    let formattedDate =
      data?.eventDate ||
      data?.date ||
      selectedDate?.toISOString()?.split("T")?.[0];

    // Garantir formato yyyy-MM-dd
    if (formattedDate && formattedDate.includes("/")) {
      const [dia, mes, ano] = formattedDate.split("/");
      formattedDate = `${ano}-${mes}-${dia}`;
    }

    setModalInitialData({
      eventDate: formattedDate,           // ✅ pré-preenche a data
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
      title: taskData?.category || "Agendamento", // adiciona título
      date: taskData.eventDate,
      startTime: taskData.startTime,
      endTime: taskData.endTime,
      createdAt: new Date().toISOString(),
      backgroundColor: taskData.backgroundColor || "#3B82F6", // corrige aqui
      color: taskData.backgroundColor, // se precisar também em color
    };
    console.log("Nova tarefa criada:", newTask); // debug
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  };

  // ✅ Adicionado: handler da seleção de data
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  // ✅ Adicionado: evita erro em SharedCalendarList
  const handleCalendarToggle = (calendarId) => {
    console.log("Toggle calendário:", calendarId);
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
      </div>
    </>
  );
};

export default CalendarDashboard;