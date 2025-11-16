import React, { useState } from "react";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isToday,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  getDaysInMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import Icon from "../../../shared/components/AppIcon";
import Button from "../../../shared/components/buttons/button.component";
import { useEffect } from "react";
import { coresAgendamentos } from "../../../shared/components/Enum/CalendarView";

// Função auxiliar para adicionar minutos (mantida da sua implementação original)
function addMinutesToTime(time, minutes) {
  const [hour, min] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, min + minutes);
  const endHour = date.getHours().toString().padStart(2, "0");
  const endMin = date.getMinutes().toString().padStart(2, "0");
  return `${endHour}:${endMin}`;
}

const CalendarView = ({
  selectedDate,
  onDateSelect,
  onEventCreate,
  events,
}) => {
  const [calendarEvents, setCalendarEvents] = useState(events || []);

  const carregarDados = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/solicitacoes");
      const data = await response.json();

      const eventosTratados = data.map((item) => ({
        id: item.id,
        title: item.cliente,
        date: item.data,
        startTime: item.inicioAgendamento,
        endTime: item.fimAgendamento,
        backgroundColor: coresAgendamentos[item.tipoAgendamento],
      }));

      setCalendarEvents(eventosTratados);
    } catch (error) {
      console.log("Erro ao buscar eventos, usando mock:", error);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const [viewType, setViewType] = useState("week");
  // Centraliza o estado para a data de navegação
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());

  // --- Propriedades Derivadas do Estado ---

  // Calcula o início da semana (para a visualização 'week')
  const currentWeek = startOfWeek(currentDate, { weekStartsOn: 0 });
  // Calcula o início do mês (para a visualização 'month')
  const currentMonth = startOfMonth(currentDate);

  const timeSlots = [];
  for (let hour = 6; hour <= 19; hour++) {
    timeSlots?.push(`${hour?.toString()?.padStart(2, "0")}:00`);
  }

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    weekDays?.push(addDays(currentWeek, i));
  }

  // --- Funções Auxiliares ---

  const getEventsForDay = (day) => {
    return calendarEvents?.filter((event) => {
      const eventDate = new Date(event?.date + "T00:00:00");
      return (
        eventDate.getFullYear() === day.getFullYear() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getDate() === day.getDate()
      );
    });
  };

  // --- Funções de Navegação e Ação ---

  const handlePrev = () => {
    if (viewType === "day") {
      setCurrentDate(addDays(currentDate, -1));
    } else if (viewType === "week") {
      setCurrentDate(addDays(currentDate, -7));
    } else if (viewType === "month") {
      setCurrentDate(addMonths(currentDate, -1));
    }
  };

  const handleNext = () => {
    if (viewType === "day") {
      setCurrentDate(addDays(currentDate, 1));
    } else if (viewType === "week") {
      setCurrentDate(addDays(currentDate, 7));
    } else if (viewType === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleTodayClick = () => {
    const today = new Date();
    setCurrentDate(today);
    onDateSelect?.(today);
  };

  const handleViewChange = (newViewType) => {
    setViewType(newViewType);
    // Atualiza o current date para a data selecionada ou hoje
    setCurrentDate(selectedDate || new Date());
  };

  const handleTimeSlotClick = (day, time) => {
    onEventCreate?.({
      eventDate: day?.toISOString()?.split("T")?.[0], // PADRONIZADO
      eventTime: time, // PADRONIZADO
    });
  };

  const handleDateClick = (date) => {
    onDateSelect?.(date);
    // Ao clicar em um dia, a visualização pode mudar para 'day'
    if (viewType === "month" || viewType === "week") {
      setCurrentDate(date);
      setViewType("day");
    }
  };

  // --- Funções de Renderização Específicas ---

  const renderHeaderTitle = () => {
    if (viewType === "day") {
      return format(currentDate, "PPP", { locale: ptBR }); // Ex: Segunda-feira, 24 de Outubro de 2025
    }
    if (viewType === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = addDays(start, 6);
      if (format(start, "yyyy") !== format(end, "yyyy")) {
        return `${format(start, "d MMM yyyy", { locale: ptBR })} - ${format(
          end,
          "d MMM yyyy",
          { locale: ptBR }
        )}`;
      }
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
    if (viewType === "month") {
      return format(currentDate, "MMMM yyyy", { locale: ptBR }); // Ex: Outubro 2025
    }
    return "";
  };

  // --- Renderização (Switch Case) ---

  const renderView = () => {
    switch (viewType) {
      case "day":
        return (
          <DayView
            currentDay={currentDate}
            timeSlots={timeSlots}
            getEventsForDay={getEventsForDay}
            handleTimeSlotClick={handleTimeSlotClick}
          />
        );
      case "week":
        return (
          <WeekView
            currentWeek={currentWeek}
            weekDays={weekDays}
            timeSlots={timeSlots}
            getEventsForDay={getEventsForDay}
            handleTimeSlotClick={handleTimeSlotClick}
            handleDateClick={handleDateClick}
          />
        );
      case "month":
        return (
          <MonthView
            currentMonth={currentMonth}
            getEventsForDay={getEventsForDay}
            handleDateClick={handleDateClick}
          />
        );
      default:
        return null;
    }
  };

  // O resto do componente (Header e Estrutura)
  return (
    <div className="h-full flex flex-col">
      {/* Calendar Header */}
      <div className="flex items-center justify-between pb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={handlePrev}>
              <Icon name="ChevronLeft" size={20} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNext}>
              <Icon name="ChevronRight" size={20} />
            </Button>
          </div>

          <h2 className="text-xl font-semibold text-text-primary">
            {renderHeaderTitle()}
          </h2>

          <Button variant="outline" size="sm" onClick={handleTodayClick}>
            Hoje
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-muted rounded-modern p-1">
            <button
              onClick={() => handleViewChange("day")}
              className={`px-3 py-1 text-sm rounded-modern transition-micro cursor-pointer ${
                viewType === "day"
                  ? "bg-blue-500 text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => handleViewChange("week")}
              className={`px-3 py-1 text-sm rounded-modern transition-micro cursor-pointer ${
                viewType === "week"
                  ? "bg-blue-500 text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => handleViewChange("month")}
              className={`px-3 py-1 text-sm rounded-modern transition-micro cursor-pointer ${
                viewType === "month"
                  ? "bg-blue-500 text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Mês
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic View */}
      <div className="flex-1 overflow-hidden">{renderView()}</div>
    </div>
  );
};

export default CalendarView;

// ====================================================================
// --- Componente de Visualização do Dia (Day View) ---
// ====================================================================

const DayView = ({
  currentDay,
  timeSlots,
  getEventsForDay,
  handleTimeSlotClick,
}) => {
  const dayEvents = getEventsForDay(currentDay);
  const SLOT_HEIGHT_PX = 60;
  // Defina a hora de início do seu calendário (baseado no seu loop for)
  const CALENDAR_START_HOUR = 6;
  const CALENDAR_START_MINUTES = CALENDAR_START_HOUR * 60;

  /**
   * Converte uma string 'HH:mm' para o total de minutos desde a meia-noite.
   */
  const getMinutesFromMidnight = (timeStr) => {
    if (!timeStr || !timeStr.includes(":")) return 0;
    try {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    } catch (e) {
      console.error("Erro ao parsear time:", timeStr, e);
      return 0;
    }
  };
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Header do Dia (sem alterações) */}
      <div className="grid grid-cols-[100px_1fr] border border-hairline rounded-t-modern overflow-hidden bg-muted">
        {/* ... (código do header do dia igual) ... */}
        <div className="p-2 border-r border-hairline">
          <div className="text-xs font-medium text-text-secondary text-center">
            Horário
          </div>
        </div>
        <div className="p-2 text-center">
          <div className="text-xs font-medium text-text-secondary">
            {format(currentDay, "EEEE", { locale: ptBR })}
          </div>
          <div
            className={`text-xl font-semibold mt-1 ${
              isToday(currentDay) ? "text-primary" : "text-text-primary"
            }`}
          >
            {format(currentDay, "d")}
          </div>
        </div>
      </div>

      {/* Slots de Tempo */}
      <div className="flex-1 overflow-y-auto border-x border-b border-hairline rounded-b-modern">
        <div className="grid grid-cols-[100px_1fr] min-h-full">
          {/* Coluna de Horários (Labels) */}
          <div className="flex flex-col">
            {timeSlots?.map((time) => (
              <div
                key={time}
                className="border-r border-b border-hairline p-2 bg-muted/50 h-[60px]" // h-[60px] = SLOT_HEIGHT_PX
              >
                <div className="text-xs text-text-secondary">{time}</div>
              </div>
            ))}
          </div>

          {/* Coluna do Dia (Grid + Eventos) */}
          <div className="relative">
            {" "}
            {/* O container PAI precisa ser relative */}
            {/* 1. Renderiza as linhas do grid (fundo) */}
            {timeSlots?.map((time) => (
              <div
                key={time}
                className="border-b border-hairline h-[60px] hover:bg-muted/20 cursor-pointer transition-micro"
                onClick={() => handleTimeSlotClick(currentDay, time)}
              >
                {/* Apenas a linha, o evento não mora mais aqui */}
              </div>
            ))}
            {/* 2. Renderiza os eventos por cima do grid */}
            <div className="absolute inset-0 p-1">
              {" "}
              {/* Overlay para os eventos */}
              {dayEvents?.map((event) => {
                const eventStartMinutes = getMinutesFromMidnight(
                  event.startTime
                );
                const eventEndMinutes = getMinutesFromMidnight(event.endTime);

                // Ignora eventos que terminam antes do início do calendário
                if (eventEndMinutes <= CALENDAR_START_MINUTES) return null;

                const minutesFromGridTop = Math.max(
                  0,
                  eventStartMinutes - CALENDAR_START_MINUTES
                );
                const durationInMinutes = eventEndMinutes - eventStartMinutes;

                // (minutos / 60 minutos_por_slot) * altura_do_slot
                const top = (minutesFromGridTop / 60) * SLOT_HEIGHT_PX;
                const height = (durationInMinutes / 60) * SLOT_HEIGHT_PX;

                return (
                  <div
                    key={event.id}
                    className="absolute left-1 right-1 p-2 rounded-modern text-xs font-medium text-black shadow-soft overflow-hidden"
                    style={{
                      backgroundColor: event.backgroundColor,
                      top: `${top}px`,
                      height: `${height}px`,
                    }}
                  >
                    <div className="truncate font-semibold">{event.title}</div>
                    <div className="text-xs opacity-75">
                      {event.startTime} - {event.endTime}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ====================================================================
// --- Componente de Visualização do Mês (Month View) ---
// ====================================================================

const MonthView = ({ currentMonth, getEventsForDay, handleDateClick }) => {
  const start = startOfWeek(currentMonth, { weekStartsOn: 0 }); // Início da primeira semana
  const end = endOfMonth(currentMonth); // Fim do mês
  const endOfGrid = startOfWeek(addDays(end, 6), { weekStartsOn: 0 }); // Fim da última semana

  // Obtém todos os dias a serem exibidos no grid (inclui dias do mês anterior/próximo)
  const days = eachDayOfInterval({ start: start, end: endOfGrid });

  // Nomes dos dias da semana
  const weekDaysNames = Array.from({ length: 7 }).map((_, i) =>
    format(addDays(start, i), "EEE", { locale: ptBR })
  );

  return (
    <div className="flex-1 overflow-hidden flex flex-col border border-hairline rounded-modern">
      {/* Cabeçalho dos Dias da Semana */}
      <div className="grid grid-cols-7 bg-muted rounded-t-modern border-b border-hairline">
        {weekDaysNames.map((name, index) => (
          <div
            key={index}
            className="p-2 text-center text-sm font-medium text-text-secondary"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Grid do Mês */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6 auto-rows-fr overflow-y-auto">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth =
            format(day, "MM") === format(currentMonth, "MM");
          const dayStyle = isCurrentMonth
            ? "text-text-primary"
            : "text-text-secondary opacity-50";

          return (
            <div
              key={index}
              className={`border-r border-b border-hairline p-2 min-h-[100px] cursor-pointer hover:bg-muted/20 transition-micro relative
                                ${
                                  isSameDay(day, new Date())
                                    ? "bg-primary/10"
                                    : ""
                                }`}
              onClick={() => handleDateClick(day)}
            >
              <div className={`text-sm font-semibold ${dayStyle}`}>
                {format(day, "d")}
              </div>

              {/* Lista de Eventos */}
              <div className="mt-1 space-y-1 overflow-hidden max-h-20">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event?.id}
                    className="text-xs font-medium px-1 py-0.5 rounded-sm truncate text-black"
                    style={{ backgroundColor: event?.backgroundColor }}
                  >
                    {event?.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-text-secondary mt-1">
                    +{dayEvents.length - 3} mais
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

// ====================================================================
// --- Componente de Visualização da Semana (Week View) ---
// ====================================================================

// Seu componente original da semana, extraído para manter a modularidade
const WeekView = ({
  currentWeek,
  weekDays,
  timeSlots,
  getEventsForDay,
  handleTimeSlotClick,
  handleDateClick,
}) => {
  // Defina a altura do slot (baseada no seu h-[60px])
  const SLOT_HEIGHT_PX = 60;
  // Defina a hora de início do seu calendário (baseado no seu loop for)
  const CALENDAR_START_HOUR = 6;
  const CALENDAR_START_MINUTES = CALENDAR_START_HOUR * 60;

  /**
   * Converte uma string 'HH:mm' para o total de minutos desde a meia-noite.
   */
  const getMinutesFromMidnight = (timeStr) => {
    if (!timeStr || !timeStr.includes(":")) return 0;
    try {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    } catch (e) {
      console.error("Erro ao parsear time:", timeStr, e);
      return 0;
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Header da Semana (sem alterações) */}
      <div className="grid grid-cols-8 border border-hairline rounded-t-modern overflow-hidden">
        {/* ... (código do header da semana igual) ... */}
        <div className="bg-muted border-r border-hairline p-2">
          <div className="text-xs font-medium text-text-secondary text-center">
            Horário
          </div>
        </div>
        {weekDays?.map((day) => (
          <div
            key={day?.toISOString()}
            className={`bg-muted border-r border-hairline p-2 text-center cursor-pointer hover:bg-muted/80 transition-micro ${
              isToday(day) ? "bg-primary/10" : ""
            }`}
            onClick={() => handleDateClick(day)}
          >
            <div className="text-xs font-medium text-text-secondary">
              {format(day, "EEE", { locale: ptBR })}
            </div>
            <div
              className={`text-sm font-semibold mt-1 ${
                isToday(day) ? "text-primary" : "text-text-primary"
              }`}
            >
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Slots de Tempo */}
      <div className="flex-1 overflow-y-auto border-x border-b border-hairline rounded-b-modern">
        <div className="grid grid-cols-8 min-h-full">
          {/* Coluna de Horários (Labels) */}
          <div className="flex flex-col">
            {timeSlots?.map((time) => (
              <div
                key={time}
                className="border-r border-b border-hairline p-2 bg-muted/50 h-[60px]" // h-[60px] = SLOT_HEIGHT_PX
              >
                <div className="text-xs text-text-secondary">{time}</div>
              </div>
            ))}
          </div>

          {/* Colunas dos Dias (Grid + Eventos) */}
          {weekDays?.map((day) => {
            const dayEvents = getEventsForDay(day);

            return (
              <div
                key={day.toISOString()}
                className="relative border-r border-hairline" // PAI de cada dia é relative
              >
                {/* 1. Renderiza as linhas do grid para este dia */}
                {timeSlots?.map((time) => (
                  <div
                    key={time}
                    className="border-b border-hairline h-[60px] hover:bg-muted/20 cursor-pointer transition-micro"
                    onClick={() => handleTimeSlotClick(day, time)}
                  >
                    {/* Apenas a linha */}
                  </div>
                ))}

                {/* 2. Renderiza os eventos por cima do grid deste dia */}
                <div className="absolute inset-0 p-1">
                  {" "}
                  {/* Overlay para os eventos */}
                  {dayEvents?.map((event) => {
                    const eventStartMinutes = getMinutesFromMidnight(
                      event.startTime
                    );
                    const eventEndMinutes = getMinutesFromMidnight(
                      event.endTime
                    );

                    if (eventEndMinutes <= CALENDAR_START_MINUTES) return null;

                    const minutesFromGridTop = Math.max(
                      0,
                      eventStartMinutes - CALENDAR_START_MINUTES
                    );
                    const durationInMinutes =
                      eventEndMinutes - eventStartMinutes;

                    const top = (minutesFromGridTop / 60) * SLOT_HEIGHT_PX;
                    const height = (durationInMinutes / 60) * SLOT_HEIGHT_PX;

                    return (
                      <div
                        key={event.id}
                        className="absolute left-1 right-1 p-2 rounded-modern text-xs font-medium text-black shadow-soft overflow-hidden"
                        style={{
                          backgroundColor: event.backgroundColor,
                          top: `${top}px`,
                          height: `${height}px`,
                        }}
                      >
                        {/* CORREÇÃO: Seu código antigo usava event.clientName, 
                        mas a API mapeia para event.title 
                      */}
                        <div className="truncate font-semibold">
                          {event.title}
                        </div>
                        <div className="text-xs opacity-75">
                          {event.startTime} - {event.endTime}
                        </div>
                      </div>
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
