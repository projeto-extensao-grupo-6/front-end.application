import React, { useState, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const getMonthName = (monthIndex) => {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  return months[monthIndex];
};

const CalendarDropdown = ({ isOpen, onClose, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const changeMonth = useCallback((amount) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate.getTime());
      newDate.setMonth(prevDate.getMonth() + amount);
      return newDate;
    });
  }, []);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }
    for (let day = 1; day <= totalDays; day++) {
      days.push({ day, isCurrentMonth: true, date: new Date(year, month, day) });
    }
    return days;
  }, [currentDate]);

  const handleDayClick = (dateItem) => {
    if (dateItem.day) {
      setSelectedDate(dateItem.date);
      onDateSelect(dateItem.date);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute z-10 top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-3 text-sm font-semibold">
        <button
          onClick={() => changeMonth(-1)}
          className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-700"
          title="Mês anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-gray-900">
          {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
        </div>
        <button
          onClick={() => changeMonth(1)}
          className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-700"
          title="Próximo mês"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs font-medium text-gray-500 text-center border-b pb-1 mb-1">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => (
          <div key={index} className="w-8 h-8 flex items-center justify-center">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayItem, index) => {
          const isToday = dayItem.day && dayItem.date.toDateString() === new Date().toDateString();
          const isSelected = dayItem.day && selectedDate && dayItem.date.toDateString() === selectedDate.toDateString();

          let dayClasses = "w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors text-sm";

          if (dayItem.day) {
            if (isSelected) {
              dayClasses += " bg-[#003d6b] text-white font-semibold";
            } else if (isToday) {
              dayClasses += " border border-[#003d6b] text-[#003d6b] font-medium hover:bg-gray-100";
            } else {
              dayClasses += " text-gray-900 hover:bg-gray-100";
            }
          } else {
            dayClasses += " text-gray-300 pointer-events-none";
          }

          return (
            <div key={index} className="flex justify-center items-center">
              {dayItem.day ? (
                <button
                  className={dayClasses}
                  onClick={() => handleDayClick(dayItem)}
                >
                  {dayItem.day}
                </button>
              ) : (
                <div className="w-8 h-8"></div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={() => {
            setSelectedDate(null);
            onDateSelect(null);
            onClose();
          }}
          className="text-sm font-medium text-gray-600 hover:text-[#007EA7] transition-colors"
        >
          Limpar
        </button>
      </div>
    </div>
  );
};

export default CalendarDropdown;