import React, { useState } from "react";
import TaskCreateModal from "../../shared/components/Ui/TaskCreateModal";
import MiniCalendar from "./components/MiniCalendar";
import SharedCalendarList from "./components/SharedCalendar";
import CalendarView from "./components/CalendarView";
import UpcomingEvents from "./components/UpcomingEvents";
import Icon from "../../shared/components/AppIcon";
import Button from "../../shared/components/buttons/button.component";
import Header from "../../shared/components/header/header";
import Sidebar from "../../shared/components/sidebar/sidebar";
import { color } from "framer-motion";

const CalendarDashboard = () => {
  // Função para carregar tarefas do sessionStorage
  const loadTasks = () => {
    return JSON.parse(sessionStorage.getItem("tasks") || "[]");
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [modalInitialData, setModalInitialData] = useState({});
  const [tasks, setTasks] = useState(() => {
    return loadTasks();
  });

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleCalendarToggle = (calendarId) => {
    console.log("Calendar toggled:", calendarId);
  };

  const handleEventCreate = (eventData = {}) => {
    setModalInitialData({
      eventDate:
        eventData?.eventDate ||
        eventData?.date ||
        selectedDate?.toISOString()?.split("T")?.[0],
      eventTime: eventData?.eventTime || eventData?.time || "",
      ...eventData,
    });
    setShowTaskModal(true);
  };
  const addMinutesToTime = (time, minutes) => {
    const [hour, minute] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute + minutes);
    return date.toTimeString().slice(0, 5);
  };

  const handleTaskSave = (taskData) => {
    const newTask = {
      id: Date.now(),
      ...taskData,
      date: taskData.eventDate, // PADRONIZADO
      startTime: taskData.eventTime,
      endTime: addMinutesToTime(
        taskData.eventTime,
        parseInt(taskData.duration || "60")
      ),
      createdAt: new Date().toISOString(),
      color: taskData.color,
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    sessionStorage.setItem("tasks", JSON.stringify(updatedTasks));
  };

  return (
    <>
      <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="min-h-screen bg-background">
        <div className="h-screen flex">
          {/* Left Sidebar */}
          <div
            className={`${
              sidebarCollapsed ? "w-16" : "w-80"
            } transition-all duration-300 border-r border-hairline bg-surface flex flex-col`}
          >
            <div className="p-6 border-b border-hairline">
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
                {/* Quick Actions */}
                <div className="space-y-3 pb-2 w-full">
                  <Button
                    iconName="Plus"
                    size="md"
                    className='btn-primary'
                    onClick={() =>
                      handleEventCreate({
                        date: selectedDate?.toISOString()?.split("T")?.[0],
                      })
                    }
                  >
                    Criar Tarefa
                  </Button>
                </div>

                {/* Mini Calendar */}
                <MiniCalendar
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                />

                {/* Shared Calendars */}
                <SharedCalendarList onCalendarToggle={handleCalendarToggle} />
              </div>
            )}

            {sidebarCollapsed && (
              <div className="flex-1 p-2 space-y-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    handleEventCreate({
                      date: selectedDate?.toISOString()?.split("T")?.[0],
                    })
                  }
                  title="Criar Tarefa"
                >
                  <Icon name="Plus" size={20} />
                </Button>
                <Button variant="ghost" size="icon" title="Calendário">
                  <Icon name="Calendar" size={20} />
                </Button>
              </div>
            )}
          </div>

          {/* Main Calendar View */}
          <div className="flex-1 flex flex-col">
            {/* Calendar Toolbar */}
            <div className="border-b border-hairline bg-surface p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-semibold text-text-primary">
                    Painel do Calendário
                  </h1>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Quick Create Button */}
                  <Button
                    variant="default"
                    size="sm"
                    iconName="Plus"
                    iconPosition="left"
                    onClick={() => handleEventCreate()}
                  >
                    Adição Rápida
                  </Button>
                </div>
              </div>
            </div>

            {/* Calendar Content */}
            <div className="flex-1 p-4">
              <CalendarView
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                onEventCreate={handleEventCreate}
                events={tasks}
              />
            </div>
          </div>

          {/* Right Panel */}
          <div
            className={`${
              rightPanelCollapsed ? "w-16" : "w-80"
            } transition-all duration-300 border-l border-hairline bg-surface flex flex-col`}
          >
            <div className="p-4 border-b border-hairline">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
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
                {/* Upcoming Events */}
                <UpcomingEvents />

                {/* Meeting Room Availability */}
              </div>
            )}

            {rightPanelCollapsed && (
              <div className="flex-1 p-2 space-y-4">
                <Button variant="ghost" size="icon" title="Próximos Eventos">
                  <Icon name="Clock" size={20} />
                </Button>
                <Button variant="ghost" size="icon" title="Salas de Reunião">
                  <Icon name="Home" size={20} />
                </Button>
                <Button variant="ghost" size="icon" title="Notificações">
                  <Icon name="Bell" size={20} />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Keyboard Shortcuts Indicator */}
        <div className="fixed bottom-4 left-4 bg-popover border border-hairline rounded-modern p-2 text-xs text-text-secondary shadow-soft">
          <div className="flex items-center space-x-2">
            <kbd className="px-1 py-0.5 bg-muted rounded text-xs">N</kbd>
            <span>Nova Tarefa</span>
            <kbd className="px-1 py-0.5 bg-muted rounded text-xs">←→</kbd>
            <span>Navegar</span>
          </div>
        </div>

        {/* Task Creation Modal */}
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
