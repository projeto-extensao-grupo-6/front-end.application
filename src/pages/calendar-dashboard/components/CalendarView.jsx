import React, { useState, useMemo, useCallback } from "react";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  isToday,
  startOfMonth,
  endOfMonth,
  addMonths,
  isSameMonth,
  eachDayOfInterval,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Loader2,
  AlertTriangle,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEventDetails, useDeleteAgendamento, useEventsByDate } from "../hooks/useCalendarEvents";
import {
  getBadgeColor,
  formatAddress,
  getPedidoLabel,
  getEventDate,
} from "../utils/eventHelpers";
import {
  EventHeader,
  EventInfo,
  EventTeam,
  EventObservations,
  EventFooter,
  LoadingState,
  ErrorMessage,
} from "./EventModalComponents";

const CreateEventModal = ({ isOpen, onClose, onCreate, initialDate }) => {
  const [formData, setFormData] = useState({
    title: "",
    date: initialDate || "",
    startTime: "",
    endTime: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    pais: "Brasil",
    observacao: "",
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
            <h2 className="text-xl font-bold text-gray-800">Nova Tarefa</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
            <div className="space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selecione os funcionários responsáveis</label>
                <select className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Escolha uma ou mais opções</option>
                  <option>Júlio Cesar</option>
                  <option>Equipe Técnica</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data do evento *</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário início *</label>
                  <input 
                    type="time" 
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário fim *</label>
                  <input 
                    type="time" 
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm" 
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                   Endereço do Cliente
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Rua *</label>
                    <input type="text" placeholder="Nome da rua" className="w-full border border-gray-300 rounded-lg p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Número *</label>
                    <input type="text" placeholder="123" className="w-full border border-gray-300 rounded-lg p-2 text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Bairro *</label>
                    <input type="text" placeholder="Bairro" className="w-full border border-gray-300 rounded-lg p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Complemento</label>
                    <input type="text" placeholder="Apto, Bloco..." className="w-full border border-gray-300 rounded-lg p-2 text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Cidade *</label>
                    <input type="text" placeholder="Cidade" className="w-full border border-gray-300 rounded-lg p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">UF *</label>
                    <input type="text" placeholder="SP" className="w-full border border-gray-300 rounded-lg p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">País *</label>
                    <input type="text" defaultValue="Brasil" className="w-full border border-gray-300 rounded-lg p-2 text-sm" />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
                <textarea 
                  rows={3} 
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="Adicione detalhes extras sobre o serviço..."
                />
              </div>

            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onCreate?.(formData);
                onClose();
              }}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Criar Agendamento
            </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100"
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
                Esta ação é irreversível e removerá o agendamento permanentemente.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-70 transition-colors"
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const EventDetailsModal = ({ initialEvent, onClose, onGeoLocationClick, onEventDeleted }) => {
  const { details, loading, error } = useEventDetails(initialEvent);
  const { deleteAgendamento, deleting } = useDeleteAgendamento((id) => {
    onEventDeleted?.(id);
    onClose?.();
  });
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteClick = () => setIsDeleteModalOpen(true);

  const handleConfirmDelete = async () => {
    const success = await deleteAgendamento(details.id);
    if (success) {
      setIsDeleteModalOpen(false);
    }
  };

  if (!details) return null;

  const badges = [];
  if (details.tipoAgendamento) {
    badges.push({
      label: details.tipoAgendamento?.label || details.tipoAgendamento || "Agendamento",
      className: getBadgeColor(details.tipoAgendamento),
    });
  }
  if (details.statusAgendamento) {
    badges.push({
      label: `✓ ${details.statusAgendamento.nome || details.statusAgendamento}`,
      className: "bg-green-50 text-green-700 border-green-200",
    });
  }

  const formattedDate = details.date
    ? format(
        parseISO(
          details.date.includes("T") ? details.date : `${details.date}T00:00:00`
        ),
        "dd 'de' MMMM 'de' yyyy",
        { locale: ptBR }
      )
    : "—";

  return (
    <>
      <AnimatePresence>
        {details && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <EventHeader
                title={details.title}
                badges={badges}
                onClose={onClose}
              />

              <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                {loading ? (
                  <LoadingState />
                ) : (
                  <>
                    <ErrorMessage message={error} />
                    <EventInfo
                      date={formattedDate}
                      startTime={details.startTime}
                      endTime={details.endTime}
                      pedido={getPedidoLabel(details.pedido)}
                      endereco={formatAddress(details.endereco)}
                      cep={details.endereco?.cep}
                    />
                    <EventTeam funcionarios={details.funcionarios} />
                    <EventObservations observacao={details.observacao} />
                  </>
                )}
              </div>

              <EventFooter
                onDelete={handleDeleteClick}
                onViewMap={() => onGeoLocationClick?.(details.endereco)}
                isDeleting={deleting}
                isLoading={loading}
                hasAddress={!!details.endereco}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleting}
      />
    </>
  );
};

// Visualização mensal do calendário com grid de dias
const MonthView = ({ currentMonth, events, onDateClick, onEventClick }) => {
  const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
  const end = startOfWeek(addDays(endOfMonth(currentMonth), 6), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start, end });
  const { eventsByDate } = useEventsByDate(events);
  const weekDaysNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="grid grid-cols-7 bg-white border-b border-gray-200 shrink-0">
        {weekDaysNames.map((w) => (
          <div key={w} className="py-2 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 auto-rows-fr gap-px bg-gray-200 overflow-hidden">
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDate[dateKey] || [];
          const isCurrent = isSameMonth(day, currentMonth);
          const isCurrentToday = isToday(day);
          const hasEvents = dayEvents.length > 0;
          
          return (
            <div
              key={dateKey}
              className={`bg-white relative flex flex-col p-1.5 group transition-colors hover:bg-gray-50 border-gray-200 overflow-hidden ${
                !isCurrent ? "opacity-60 bg-gray-50/50" : ""
              }`}
              onClick={() => onDateClick?.(day)}
            >
              <div className="flex justify-between items-start mb-1 shrink-0">
                <div className="relative">
                  <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-lg ${isCurrentToday ? "bg-blue-600 text-white shadow-md" : "text-gray-700"}`}>
                    {format(day, "d")}
                  </span>
                  {hasEvents && !isCurrentToday && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                  )}
                </div>
                <button
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full p-1 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDateClick?.(day);
                  }}
                  title="Adicionar evento"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="flex-1 flex flex-col gap-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {dayEvents.slice(0, 4).map((evt, index) => (
                  <motion.div
                    key={evt.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-90 transition border-l-2 shadow-sm"
                    style={{
                      backgroundColor: `${evt.backgroundColor || "#3b82f6"}15`,
                      borderLeftColor: evt.backgroundColor || "#3b82f6",
                      color: "#1f2937",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(evt);
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="font-bold mr-1 opacity-75">{evt.startTime}</span>
                    <span className="font-medium">{evt.title}</span>
                  </motion.div>
                ))}
                {dayEvents.length > 4 && (
                  <div className="text-[9px] text-gray-500 font-bold text-center pt-0.5">
                    + {dayEvents.length - 4} mais
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

// Calcula a posição vertical e altura do evento baseado nos horários de início e fim
const calculateEventStyle = (startTime, endTime, startHour = 0) => {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const startMinutes = (startH - startHour) * 60 + startM;
  const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
  const pixelsPerMinute = 70 / 60;
  return {
    top: `${Math.max(0, startMinutes * pixelsPerMinute)}px`,
    height: `${Math.max(20, durationMinutes * pixelsPerMinute)}px`,
  };
};

// Detecta eventos sobrepostos e calcula a largura e posição de cada um para exibição lado a lado
const calculateEventLayout = (events) => {
  if (!events || events.length === 0) return [];
  const sortedEvents = [...events].sort((a, b) => {
    const [aH, aM] = a.startTime.split(':').map(Number);
    const [bH, bM] = b.startTime.split(':').map(Number);
    return (aH * 60 + aM) - (bH * 60 + bM);
  });
  const eventsWithLayout = [];
  const columns = [];
  sortedEvents.forEach(event => {
    const [startH, startM] = event.startTime.split(':').map(Number);
    const [endH, endM] = event.endTime.split(':').map(Number);
    const eventStart = startH * 60 + startM;
    const eventEnd = endH * 60 + endM;
    let columnIndex = 0;
    while (columnIndex < columns.length) {
      const lastEventInColumn = columns[columnIndex];
      const [lastEndH, lastEndM] = lastEventInColumn.endTime.split(':').map(Number);
      const lastEnd = lastEndH * 60 + lastEndM;
      if (eventStart >= lastEnd) break;
      columnIndex++;
    }
    if (columnIndex === columns.length) columns.push(event);
    else columns[columnIndex] = event;
    const overlappingColumns = columns.filter(col => {
      if (!col) return false;
      const [colStartH, colStartM] = col.startTime.split(':').map(Number);
      const [colEndH, colEndM] = col.endTime.split(':').map(Number);
      const colStart = colStartH * 60 + colStartM;
      const colEnd = colEndH * 60 + colEndM;
      return !(eventEnd <= colStart || eventStart >= colEnd);
    }).length;
    eventsWithLayout.push({ ...event, column: columnIndex, totalColumns: Math.max(overlappingColumns, columnIndex + 1) });
  });
  return eventsWithLayout;
};

const WeekView = ({ currentDate, timeSlots, events, onEventClick, onDateClick, onTimeSlotClick }) => {
  const start = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  const eventsByDay = useMemo(() => {
    const grouped = {};
    weekDays.forEach(day => {
      const key = format(day, "yyyy-MM-dd");
      grouped[key] = events?.filter((e) => {
        const eventDateKey = getEventDate(e);
        return eventDateKey === key;
      }) || [];
    });
    return grouped;
  }, [events, weekDays]);
  const getEventsForDay = useCallback((day) => {
    const key = format(day, "yyyy-MM-dd");
    return eventsByDay[key] || [];
  }, [eventsByDay]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="grid grid-cols-8 border-b border-gray-200 bg-white shrink-0">
        <div className="w-20 border-r border-gray-100"></div>
        {weekDays.map((day) => (
          <div key={day.toISOString()} className={`py-3 text-center border-r border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition ${isToday(day) ? "bg-blue-50/30" : ""}`} onClick={() => onDateClick?.(day)}>
            <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isToday(day) ? "text-blue-600" : "text-gray-400"}`}>{format(day, "EEE", { locale: ptBR })}</div>
            <div className={`text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full ${isToday(day) ? "bg-blue-600 text-white" : "text-gray-900"}`}>{format(day, "d")}</div>
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-8 relative min-h-[1000px]">
          <div className="w-20 flex flex-col border-r border-gray-100 bg-white sticky left-0 z-10">
            {timeSlots.map((t) => <div key={t} className="h-[70px] border-b border-gray-50 text-xs text-gray-400 font-medium text-right pr-3 pt-2">{t}</div>)}
          </div>
          {weekDays.map((day) => {
            const dayEvents = getEventsForDay(day);
            const eventsWithLayout = calculateEventLayout(dayEvents);
            return (
              <div key={day.toISOString()} className="flex flex-col relative border-r border-gray-100 bg-white">
                {timeSlots.map((t) => <div key={t} className="h-[70px] border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer" onClick={() => onTimeSlotClick?.(day, t)} />)}
                <div className="absolute inset-0 p-1 pointer-events-none">
                  {eventsWithLayout.map((evt, index) => {
                    const eventStyle = calculateEventStyle(evt.startTime, evt.endTime);
                    const widthPercent = 100 / evt.totalColumns;
                    const leftPercent = (evt.column * widthPercent);
                    return (
                      <motion.div
                        key={evt.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        className="absolute rounded-md px-2 py-1 shadow-sm border-l-4 cursor-pointer text-[11px] leading-tight overflow-hidden hover:z-20 hover:shadow-md transition-all pointer-events-auto"
                        style={{ ...eventStyle, left: `calc(${leftPercent}% + 4px)`, width: `calc(${widthPercent}% - 8px)`, borderLeftColor: evt.backgroundColor || "#3b82f6", backgroundColor: `${evt.backgroundColor || "#3b82f6"}20` }}
                        onClick={(e) => { e.stopPropagation(); onEventClick?.(evt); }}
                        whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="font-semibold truncate text-gray-900">{evt.title || "Evento"}</div>
                        <div className="opacity-70 text-gray-700">{evt.startTime} - {evt.endTime}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const DayView = ({ currentDay, timeSlots, events, onEventClick, onTimeSlotClick }) => {
  const dayKey = format(currentDay, "yyyy-MM-dd");
  const dayEvents = events?.filter((e) => {
    const eventDateKey = getEventDate(e);
    return eventDateKey === dayKey;
  }) || [];
  const eventsWithLayout = calculateEventLayout(dayEvents);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="grid grid-cols-[100px_1fr] border-b border-gray-200 bg-white py-4 shrink-0">
        <div className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest pt-2">Horário</div>
        <div className="pl-6">
          <div className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-1">{format(currentDay, "EEEE", { locale: ptBR })}</div>
          <div className="text-2xl font-normal text-gray-900">{format(currentDay, "d 'de' MMMM", { locale: ptBR })}</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[100px_1fr] relative">
          <div className="border-r border-gray-100 bg-white">
            {timeSlots.map((t) => <div key={t} className="h-20 border-b border-gray-50 text-sm text-gray-500 font-medium text-center pt-3">{t}</div>)}
          </div>
          <div className="relative bg-white">
            {timeSlots.map((t) => (
              <div key={t} className="h-20 border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer relative" onClick={() => onTimeSlotClick?.(currentDay, t)}>
                <div className="absolute top-1/2 w-full border-t border-dotted border-gray-100 pointer-events-none" />
              </div>
            ))}
            {eventsWithLayout?.map((evt, i) => {
              const eventStyle = calculateEventStyle(evt.startTime, evt.endTime);
              const widthPercent = 100 / evt.totalColumns;
              const leftPercent = (evt.column * widthPercent);
              return (
                <motion.div
                  key={evt.id || i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="absolute rounded-md px-3 py-2 shadow-sm border-l-4 hover:shadow-md cursor-pointer overflow-hidden hover:z-20 transition-all"
                  style={{ ...eventStyle, left: `calc(${leftPercent}% + 16px)`, width: `calc(${widthPercent}% - 32px)`, borderLeftColor: evt.backgroundColor || "#3b82f6", backgroundColor: `${evt.backgroundColor || "#3b82f6"}20` }}
                  onClick={(e) => { e.stopPropagation(); onEventClick?.(evt); }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-semibold text-gray-900 text-sm truncate">{evt.title}</div>
                  <div className="text-gray-600 text-xs flex items-center gap-1"><Clock size={12} /> {evt.startTime} - {evt.endTime}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const CalendarView = ({
  selectedDate,
  onDateSelect,
  onEventCreate,
  events = [],
  onEventDeleted,
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [viewType, setViewType] = useState("month");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDate, setNewDate] = useState("");

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = 0; h < 24; h++) {
      slots.push(`${String(h).padStart(2, "0")}:00`);
    }
    return slots;
  }, []);

  const handlePrev = () => {
    setCurrentDate((d) =>
      viewType === "month" ? addMonths(d, -1) : addDays(d, viewType === "week" ? -7 : -1)
    );
  };

  const handleNext = () => {
    setCurrentDate((d) =>
      viewType === "month" ? addMonths(d, 1) : addDays(d, viewType === "week" ? 7 : 1)
    );
  };

  const handleTodayClick = () => setCurrentDate(new Date());
  const handleViewChange = (type) => setViewType(type);

  const renderHeaderTitle = () => {
    if (viewType === "month") return format(currentDate, "MMMM yyyy", { locale: ptBR });
    if (viewType === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      return `${format(start, "d MMM", { locale: ptBR })} - ${format(end, "d MMM", { locale: ptBR })}`;
    }
    if (viewType === "day") return format(currentDate, "d 'de' MMMM yyyy", { locale: ptBR });
    return "";
  };

  // Abre o modal de criação de evento com a data pré-selecionada
  const handleOpenCreateModal = (dateStr) => {
    setNewDate(dateStr);
    setIsCreateModalOpen(true);
  };

  const handleDayClick = (day) => {
    setCurrentDate(day);
    onDateSelect?.(day);
    handleOpenCreateModal(format(day, "yyyy-MM-dd"));
  };

  const handleTimeSlotClick = (day, time) => {
    setCurrentDate(day);
    handleOpenCreateModal(format(day, "yyyy-MM-dd"));
  };

  const handleEventClick = (evt) => {
    setSelectedEvent(evt);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="h-full flex flex-col bg-white border border-gray-200 relative overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
            <button onClick={handlePrev} className="p-1.5 cursor-pointer hover:bg-white hover:shadow-sm rounded-md text-gray-600 transition">
              <ChevronLeft size={18} />
            </button>
            <button onClick={handleNext} className="p-1.5 cursor-pointer hover:bg-white hover:shadow-sm rounded-md text-gray-600 transition">
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
        <div className="flex items-center gap-7 bg-white p-1">
          <button
            onClick={() => handleOpenCreateModal(format(currentDate, "yyyy-MM-dd"))}
            className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold text-white transition-colors bg-[#007EA7] rounded-md shadow-sm cursor-pointer hover:bg-[#046b8d] shrink-0 whitespace-nowrap"
            title="Nova Tarefa"
          >
            <Plus size={18} className="shrink-0" />
            <span className="hidden md:inline">Nova Tarefa</span>
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2 sm:mx-4"></div>

          <div className="flex items-center gap-0 bg-white p-1 rounded-lg border border-gray-300 shadow-sm">
            {["day", "week", "month"].map((type) => (
              <button
                key={type}
                onClick={() => handleViewChange(type)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md cursor-pointer transition-all ${
                  viewType === type
                    ? "bg-[#007EA7] text-white shadow-md"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <CalendarIcon size={18} />
                {{ day: "Dia", week: "Semana", month: "Mês" }[type]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {viewType === "day" && (
            <motion.div
              key="day"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <DayView
                currentDay={currentDate}
                timeSlots={timeSlots}
                events={events}
                onEventClick={handleEventClick}
                onTimeSlotClick={handleTimeSlotClick}
              />
            </motion.div>
          )}
          {viewType === "week" && (
            <motion.div
              key="week"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <WeekView
                currentDate={currentDate}
                timeSlots={timeSlots}
                events={events}
                onEventClick={handleEventClick}
                onDateClick={handleDayClick}
                onTimeSlotClick={handleTimeSlotClick}
              />
            </motion.div>
          )}
          {viewType === "month" && (
            <motion.div
              key="month"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <MonthView
                currentMonth={currentDate}
                events={events}
                onDateClick={handleDayClick}
                onEventClick={handleEventClick}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <EventDetailsModal
            initialEvent={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onGeoLocationClick={(endereco) => {
              if (!endereco) return;
              const addressParts = [
                endereco.rua, endereco.numero, endereco.complemento,
                endereco.bairro, endereco.cidade, endereco.uf, endereco.cep
              ].filter(Boolean);
              window.open(`https://www.google.com/maps/search/?api=1&query=$${encodeURIComponent(addressParts.join(", "))}`, "_blank");
            }}
            onEventDeleted={onEventDeleted}
          />
        )}
      </AnimatePresence>

      <CreateEventModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={(data) => {
          console.log("Criar evento com dados:", data);
          onEventCreate?.(data); // Passa para o pai se necessário
        }}
        initialDate={newDate}
      />

    </motion.div>
  );
};

export default CalendarView;