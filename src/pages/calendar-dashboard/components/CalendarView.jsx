import React, { useState, useEffect, useMemo } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  isToday,
  startOfMonth,
  endOfMonth,
  addMonths,
  isSameMonth,
  eachDayOfInterval,
  parseISO,
} from "date-fns";
import { de, ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  X,
  MapPin,
  Calendar as CalendarIcon,
  Calendar,
  User,
  Briefcase,
  FileText,
  Users,
  Loader2,
  AlertTriangle, // Adicionado para o modal de exclusão
} from "lucide-react";
import agendamentosService from "../../../services/agendamentosService";

// --- COMPONENTE DE CONFIRMAÇÃO DE EXCLUSÃO (NOVO) ---
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all scale-100 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-100 rounded-full shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Excluir Agendamento?</h3>
          </div>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Você tem certeza que deseja remover este item? <br/>
            <span className="text-red-500 font-medium text-sm">Esta ação é irreversível e os dados serão perdidos permanentemente.</span>
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                 <>
                   <Loader2 className="w-4 h-4 animate-spin" />
                   Excluindo...
                 </>
              ) : (
                "Sim, excluir"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const CalendarView = ({
  selectedDate,
  onDateSelect,
  onEventCreate,
  events = [],
  onEventDeleted,
}) => {
  const [viewType, setViewType] = useState("month");
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());

  // Estado para controlar o modal de detalhes do evento
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (selectedDate) setCurrentDate(selectedDate);
  }, [selectedDate]);

  // Navegação
  const handlePrev = () => {
    if (viewType === "day") setCurrentDate(addDays(currentDate, -1));
    else if (viewType === "week") setCurrentDate(addDays(currentDate, -7));
    else if (viewType === "month") setCurrentDate(addMonths(currentDate, -1));
  };

  const handleNext = () => {
    if (viewType === "day") setCurrentDate(addDays(currentDate, 1));
    else if (viewType === "week") setCurrentDate(addDays(currentDate, 7));
    else if (viewType === "month") setCurrentDate(addMonths(currentDate, 1));
  };

  const handleTodayClick = () => {
    const today = new Date();
    setCurrentDate(today);
    onDateSelect?.(today);
  };

  const handleViewChange = (newViewType) => {
    setViewType(newViewType);
  };

  // Filtros de eventos
  const getEventsForDay = (day) => {
    const dayString = format(day, "yyyy-MM-dd");
    return events.filter((event) => event.date === dayString);
  };

  // Handlers de interação
  const handleTimeSlotClick = (day, time) => {
    onEventCreate?.({
      eventDate: format(day, "yyyy-MM-dd"),
      startTime: time,
    });
  };

  const handleDayClick = (day) => {
    setCurrentDate(day);
    onDateSelect?.(day);
    setViewType("day");

    // ✅ Abrir modal já com a data do dia clicado
    onEventCreate?.({
      eventDate: format(day, "yyyy-MM-dd"),
      startTime: "",
      endTime: "",
    });
  };

  // Abre o modal com as informações do agendamento
  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  // Fecha o modal
  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  // Ação do botão de Geolocalização
  const handleGeoLocationClick = (addressData) => {
    const { rua, numero, cidade, uf, cep } = addressData || {};
    const fullAddress = `${rua}, ${numero} - ${cidade}, ${uf}`;
    // Aqui você poderia abrir o Google Maps em nova aba
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`, '_blank');
  };

  const renderHeaderTitle = () => {
    if (viewType === "day") return format(currentDate, "PPP", { locale: ptBR });
    if (viewType === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = addDays(start, 6);
      if (format(start, "MMMM") === format(end, "MMMM")) {
        return `${format(start, "d")} - ${format(end, "d MMMM yyyy", {
          locale: ptBR,
        })}`;
      }
      return `${format(start, "d MMM", { locale: ptBR })} - ${format(
        end,
        "d MMM yyyy",
        { locale: ptBR }
      )}`;
    }
    if (viewType === "month")
      return format(currentDate, "MMMM yyyy", { locale: ptBR });
    return "";
  };

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
    }
    return slots;
  }, []);

  return (
    <div className="h-full flex flex-col bg-white shadow-sm border border-gray-200 font-sans relative overflow-hidden">
      {/* Header da Toolbar */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
            <button
              onClick={handlePrev}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-gray-600 transition-all duration-200"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-gray-600 transition-all duration-200"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900 capitalize tracking-tight">
              {renderHeaderTitle()}
            </h2>
            <button
              onClick={handleTodayClick}
              className="px-4 py-1.5 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-full transition-colors"
            >
              Hoje
            </button>
          </div>
        </div>

        <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-100">
          {["day", "week", "month"].map((type) => (
            <button
              key={type}
              onClick={() => handleViewChange(type)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                viewType === type
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
              }`}
            >
              {{ day: "Dia", week: "Semana", month: "Mês" }[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Área de Conteúdo */}
      <div className="flex-1 overflow-hidden relative bg-white">
        {viewType === "day" && (
          <DayView
            currentDay={currentDate}
            timeSlots={timeSlots}
            getEventsForDay={getEventsForDay}
            handleTimeSlotClick={handleTimeSlotClick}
            onEventClick={handleEventClick}
          />
        )}
        {viewType === "week" && (
          <WeekView
            currentDate={currentDate}
            timeSlots={timeSlots}
            getEventsForDay={getEventsForDay}
            handleTimeSlotClick={handleTimeSlotClick}
            handleDateClick={handleDayClick}
            onEventClick={handleEventClick}
          />
        )}
        {viewType === "month" && (
          <MonthView
            currentMonth={currentDate}
            events={events}
            onDateClick={handleDayClick}
            onEventCreate={onEventCreate}
            onEventClick={handleEventClick}
          />
        )}
      </div>

      {/* MODAL DE DETALHES DO EVENTO */}
      {selectedEvent && (
        <EventDetailsModal
          initialEvent={selectedEvent}
          onClose={handleCloseModal}
          onGeoLocationClick={handleGeoLocationClick}
          onEventDeleted={onEventDeleted}
        />
      )}
    </div>
  );
};

// COMPONENTE MODAL DE DETALHES (ATUALIZADO - PROFISSIONAL)
const EventDetailsModal = ({ initialEvent, onClose, onGeoLocationClick, onEventDeleted }) => {
  const [details, setDetails] = useState(initialEvent);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (initialEvent.endereco && initialEvent.funcionarios) {
        setDetails(initialEvent);
        return;
      }

      setLoading(true);
      try {
        const eventId = initialEvent.id;
        if (!eventId) throw new Error("ID do evento não fornecido");

        const response = await fetch(
          `http://localhost:3000/api/agendamentos/${eventId}`
        );

        if (!response.ok) {
          console.warn("API não respondeu, usando dados locais.");
          setDetails(initialEvent);
        } else {
          const data = await response.json();
          setDetails(data);
        }
      } catch (err) {
        console.error("Erro ao buscar detalhes:", err);
        setDetails(initialEvent);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [initialEvent]);

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      console.log("🗑️ Deletando agendamento ID:", details.id);
      await agendamentosService.delete(details.id);
      console.log("✅ Agendamento deletado com sucesso!");

      if (onEventDeleted) {
        console.log("📢 Chamando callback onEventDeleted com ID:", details.id);
        onEventDeleted(details.id);
      }

      setTimeout(() => {
        setIsDeleteModalOpen(false);
        onClose();
      }, 300);
    } catch (err) {
      console.error("❌ Erro ao deletar agendamento:", err);
      setError("Erro ao deletar agendamento. Tente novamente mais tarde.");
    } finally {
      setDeleting(false);
    }
  };

  if (!details) return null;

  const getBadgeColor = (type) => {
    if (type === "SERVICO" || type?.value === "SERVICO")
      return "bg-blue-50 text-blue-700 border-blue-200";
    if (type === "ORCAMENTO" || type?.value === "ORCAMENTO")
      return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  const formatAddress = (end) => {
    if (!end) return "Endereço não informado";
    return `${end.rua || ""}, ${end.numero || ""} ${
      end.complemento ? `- ${end.complemento}` : ""
    } - ${end.bairro || ""}, ${end.cidade || ""}/${end.uf || ""}`;
  };

  const getPedidoLabel = (pedido) => {
    if (!pedido) return "Nenhum pedido vinculado";
    if (typeof pedido === "string") return pedido;
    if (pedido.label) return pedido.label;
    if (pedido.descricao) return pedido.descricao;
    if (pedido.nome) return pedido.nome;
    if (pedido.id) return `Pedido #${pedido.id}`;
    return "Pedido desconhecido";
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-200/50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cabeçalho Limpo */}
          <div className="relative bg-white px-8 py-6 border-b border-gray-100">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
            >
              <X size={20} />
            </button>

            <div className="pr-10">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                Agendamento
              </p>
              <h2 className="text-2xl font-bold text-gray-900">
                {details.title || "Sem título"}
              </h2>

              <div className="flex flex-wrap gap-2 mt-4">
                <span
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${getBadgeColor(
                    details.tipoAgendamento
                  )}`}
                >
                  {details.tipoAgendamento?.label ||
                    details.tipoAgendamento ||
                    "Agendamento"}
                </span>
                {details.statusAgendamento && (
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full border bg-green-50 text-green-700 border-green-200">
                    ✓ {details.statusAgendamento.nome || details.statusAgendamento}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Corpo com Scroll */}
          <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar bg-white">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 size={40} className="animate-spin mb-3 text-gray-400" />
                <span className="text-gray-500 text-sm font-medium">
                  Carregando...
                </span>
              </div>
            ) : (
              <>
                {error && (
                  <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-lg text-sm font-medium">
                    ⚠️ {error}
                  </div>
                )}

                {/* Informações em 2 Colunas */}
                <div className="grid grid-cols-2 gap-8 w-full">
                  {/* Data */}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Data
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {details.date
                        ? format(
                            parseISO(
                              details.date.includes("T")
                                ? details.date
                                : `${details.date}T00:00:00`
                            ),
                            "dd 'de' MMMM 'de' yyyy",
                            { locale: ptBR }
                          )
                        : "-"}
                    </p>
                  </div>

                  {/* Horário */}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Horário
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {details.startTime} - {details.endTime}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100"></div>

                {/* Pedido */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <FileText size={14} />
                    Pedido Vinculado
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {getPedidoLabel(details.pedido)}
                  </p>
                </div>

                {/* Localização */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <MapPin size={14} />
                    Localização
                  </p>
                  <p className="text-sm font-medium text-gray-900 leading-relaxed">
                    {details.endereco
                      ? formatAddress(details.endereco)
                      : "Endereço não disponível"}
                  </p>
                  {details.endereco?.cep && (
                    <p className="text-xs text-gray-500 mt-2.5">
                      CEP: {details.endereco.cep}
                    </p>
                  )}
                </div>

                {/* Funcionários */}
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Users size={14} />
                    Equipe Responsável
                  </p>
                  {details.funcionarios && details.funcionarios.length > 0 ? (
                    <div className="flex flex-wrap gap-2.5">
                      {details.funcionarios.map((func, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-full px-3.5 py-1.5 text-sm font-medium text-gray-700"
                        >
                          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                            {(func.label || func.nome || func || "?").charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate">{func.label || func.nome || func}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Nenhum funcionário atribuído
                    </p>
                  )}
                </div>

                {/* Observações */}
                {details.observacao && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Observações
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-3.5 rounded-lg border border-gray-100">
                      {details.observacao}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Rodapé com Ações */}
          <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
            <button
              onClick={handleDeleteClick}
              disabled={loading || deleting}
              className="px-5 py-2.5 rounded-lg font-medium text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Excluir
            </button>

            <button
              onClick={() => onGeoLocationClick(details.endereco)}
              disabled={!details.endereco || loading}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition-all text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <MapPin size={16} />
              Ver no Mapa
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleting}
      />
    </>
  );
};

// --- 1. MONTH VIEW (Mantido igual) ---

const MonthView = ({
  currentMonth,
  events,
  onDateClick,
  onEventCreate,
  onEventClick,
}) => {
  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach((evt) => {
      const dateKey = evt.date;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(evt);
    });
    return map;
  }, [events]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  const weekDaysHeader = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="grid grid-cols-7 border-b border-gray-200 bg-white">
        {weekDaysHeader.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-widest"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1 auto-rows-fr gap-px border-b border-gray-200 overflow-y-auto bg-gray-200">
        {calendarDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDate[dateKey] || [];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);

          return (
            <div
              key={dateKey}
              className={`bg-white relative flex flex-col p-2 min-h-[120px] group transition-colors hover:bg-gray-50 border border-gray-200${
                !isCurrentMonth ? "bg-gray-50/30" : ""
              }`}
              onClick={() => onDateClick(day)}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`text-sm font-semibold w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                    isTodayDate
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : !isCurrentMonth
                      ? "text-gray-300"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {format(day, "d")}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventCreate?.({ eventDate: dateKey, startTime: "09:00" });
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full p-1.5 transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="flex-1 space-y-1.5 overflow-hidden">
                {dayEvents.slice(0, 3).map((evt) => (
                  <div
                    key={evt.id}
                    className="text-xs px-2 py-1 rounded-md truncate cursor-pointer hover:opacity-90 transition-all border-l-4 shadow-sm hover:shadow-md hover:-translate-y-px"
                    style={{
                      backgroundColor: `${evt.backgroundColor || "#3b82f6"}15`,
                      borderLeftColor: evt.backgroundColor || "#3b82f6",
                      color: "#1f2937",
                    }}
                    title={evt.title}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(evt);
                    }}
                  >
                    <span className="font-bold mr-1.5 opacity-75">
                      {evt.startTime}
                    </span>
                    <span className="font-medium">{evt.title}</span>
                  </div>
                ))}

                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-gray-500 font-semibold pl-2 pt-0.5">
                    + {dayEvents.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- 2. WEEK VIEW (Mantido igual) ---

const WeekView = ({
  currentDate,
  timeSlots,
  getEventsForDay,
  handleTimeSlotClick,
  handleDateClick,
  onEventClick,
}) => {
  const currentWeekStart = startOfWeek(currentDate, { weekStartsOn: 0 });

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(currentWeekStart, i));
    }
    return days;
  }, [currentWeekStart]);

  const SLOT_HEIGHT = 70;

  const getEventStyle = (event) => {
    const startMin =
      parseInt(event.startTime.split(":")[0]) * 60 +
      parseInt(event.startTime.split(":")[1]);
    const endMin =
      parseInt(event.endTime.split(":")[0]) * 60 +
      parseInt(event.endTime.split(":")[1]);
    const duration = endMin - startMin;
    const startOffset = startMin - 6 * 60;

    return {
      top: `${(startOffset / 60) * SLOT_HEIGHT}px`,
      height: `${Math.max((duration / 60) * SLOT_HEIGHT, 40)}px`,
      backgroundColor: event.backgroundColor,
    };
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="grid grid-cols-8 border-b border-gray-200 bg-white shadow-sm z-10">
        <div className="w-20 border-r border-gray-100"></div>
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={`py-3 text-center border-r border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors group ${
              isToday(day) ? "bg-blue-50/30" : ""
            }`}
            onClick={() => handleDateClick(day)}
          >
            <div
              className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                isToday(day)
                  ? "text-blue-600"
                  : "text-gray-400 group-hover:text-gray-600"
              }`}
            >
              {format(day, "EEE", { locale: ptBR })}
            </div>
            <div
              className={`text-2xl font-bold w-10 h-10 mx-auto flex items-center justify-center rounded-full transition-all ${
                isToday(day)
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-gray-900 group-hover:bg-gray-100"
              }`}
            >
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-8 relative min-h-[1120px]">
          <div className="w-20 flex flex-col border-r border-gray-100 bg-white sticky left-0 z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
            {timeSlots.map((time) => (
              <div
                key={time}
                className={`h-[70px] border-b border-gray-50 text-xs text-gray-400 font-medium text-right pr-4 pt-2 relative`}
              >
                <span className="top-3 relative bg-white pl-1">{time}</span>
              </div>
            ))}
          </div>

          {weekDays.map((day) => {
            const dayEvents = getEventsForDay(day);
            return (
              <div
                key={day.toISOString()}
                className="relative border-r border-gray-100 bg-white"
              >
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    className="h-[70px] border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer relative"
                    onClick={() => handleTimeSlotClick(day, time)}
                  >
                    <div className="absolute top-1/2 w-full border-t border-dotted border-gray-100/50 pointer-events-none"></div>
                  </div>
                ))}

                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="absolute left-1 right-1 rounded-lg px-3 py-2 text-xs shadow-sm overflow-hidden hover:z-20 hover:shadow-lg transition-all cursor-pointer border-l-[3px] border-black/10 group"
                    style={getEventStyle(event)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                  >
                    <div className="font-bold text-gray-900 truncate text-sm mb-0.5">
                      {event.title}
                    </div>
                    <div className="text-gray-700 truncate opacity-80 group-hover:opacity-100">
                      {event.startTime} - {event.endTime}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- 3. DAY VIEW (Mantido igual) ---

const DayView = ({
  currentDay,
  timeSlots,
  getEventsForDay,
  handleTimeSlotClick,
  onEventClick,
}) => {
  const dayEvents = getEventsForDay(currentDay);
  const SLOT_HEIGHT = 80;

  const getEventStyle = (event) => {
    const startMin =
      parseInt(event.startTime.split(":")[0]) * 60 +
      parseInt(event.startTime.split(":")[1]);
    const endMin =
      parseInt(event.endTime.split(":")[0]) * 60 +
      parseInt(event.endTime.split(":")[1]);
    const duration = endMin - startMin;
    const startOffset = startMin - 6 * 60;

    return {
      top: `${(startOffset / 60) * SLOT_HEIGHT}px`,
      height: `${Math.max((duration / 60) * SLOT_HEIGHT, 50)}px`,
      backgroundColor: event.backgroundColor,
    };
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="grid grid-cols-[100px_1fr] border-b border-gray-200 bg-white shadow-sm z-10 py-4">
        <div className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest pt-2">
          Horário
        </div>
        <div className="pl-6">
          <div className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-1">
            {format(currentDay, "EEEE", { locale: ptBR })}
          </div>
          <div className="text-2xl font-normal text-gray-900">
            {format(currentDay, "d 'de' MMMM", { locale: ptBR })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-[100px_1fr] relative">
          <div className="border-r border-gray-100 bg-white">
            {timeSlots.map((time) => (
              <div
                key={time}
                className="h-[80px] border-b border-gray-50 text-sm text-gray-500 font-medium text-center pt-3"
              >
                {time}
              </div>
            ))}
          </div>

          <div className="relative bg-white">
            {timeSlots.map((time) => (
              <div
                key={time}
                className="h-[80px] border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer relative"
                onClick={() => handleTimeSlotClick(currentDay, time)}
              >
                <div className="absolute top-1/2 w-full border-t border-dotted border-gray-100 pointer-events-none"></div>
              </div>
            ))}

            {dayEvents.map((event) => (
              <div
                key={event.id}
                className="absolute left-4 right-4 rounded-xl px-4 py-1 shadow-sm border-l-4 border-black/10 hover:shadow-lg cursor-pointer transition-all hover:-translate-y-0.5"
                style={getEventStyle(event)}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick?.(event);
                }}
              >
                <div className="font-bold text-gray-900 text-lg mb-1">
                  {event.title}
                </div>
                <div className="text-gray-800font-medium flex items-center justify-center gap-2 opacity-80">
                  <Clock size={16} />
                  {event.startTime} - {event.endTime}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;