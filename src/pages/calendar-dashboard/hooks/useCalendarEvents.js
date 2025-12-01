import { useState, useEffect, useMemo, useCallback } from "react";
import agendamentosService from "../../../services/agendamentosService";
import { groupEventsByDate } from "../utils/eventHelpers";

/**
 * Hook para gerenciar detalhes de um evento/agendamento
 * @param {Object} initialEvent - Evento inicial
 * @returns {Object} - Estado e funções do evento
 */
export const useEventDetails = (initialEvent) => {
  const [details, setDetails] = useState(initialEvent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!initialEvent?.id) {
        setDetails(initialEvent);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:3000/api/agendamentos/${initialEvent.id}`
        );

        if (response.ok) {
          const data = await response.json();
          
          // Mescla dados da API com dados iniciais, preservando funcionários
          const merged = {
            ...initialEvent,
            ...data,
            funcionarios: data.funcionarios?.length
              ? data.funcionarios
              : initialEvent.funcionarios || [],
          };
          
          setDetails(merged);
        } else {
          setDetails(initialEvent);
          setError("Não foi possível carregar os detalhes completos");
        }
      } catch (err) {
        console.error("Erro ao buscar detalhes do evento:", err);
        setDetails(initialEvent);
        setError("Erro ao carregar detalhes");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [initialEvent]);

  return {
    details,
    loading,
    error,
    setError,
  };
};

/**
 * Hook para deletar agendamento
 * @param {Function} onSuccess - Callback de sucesso
 * @returns {Object} - Estado e função de delete
 */
export const useDeleteAgendamento = (onSuccess) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const deleteAgendamento = useCallback(
    async (id) => {
      if (!id) {
        setError("ID do agendamento não fornecido");
        return false;
      }

      setDeleting(true);
      setError(null);

      try {
        await agendamentosService.delete(id);
        onSuccess?.(id);
        return true;
      } catch (err) {
        console.error("Erro ao deletar agendamento:", err);
        setError("Erro ao excluir agendamento. Tente novamente.");
        return false;
      } finally {
        setDeleting(false);
      }
    },
    [onSuccess]
  );

  return {
    deleteAgendamento,
    deleting,
    error,
    setError,
  };
};

/**
 * Hook para agrupar eventos por data
 * @param {Array} events - Lista de eventos
 * @returns {Object} - Eventos agrupados por data
 */
export const useEventsByDate = (events) => {
  const eventsByDate = useMemo(() => {
    return groupEventsByDate(events);
  }, [events]);

  const getEventsForDate = useCallback(
    (dateKey) => {
      return eventsByDate[dateKey] || [];
    },
    [eventsByDate]
  );

  const hasEvents = useCallback(
    (dateKey) => {
      return eventsByDate[dateKey] && eventsByDate[dateKey].length > 0;
    },
    [eventsByDate]
  );

  const getEventCount = useCallback(
    (dateKey) => {
      return eventsByDate[dateKey]?.length || 0;
    },
    [eventsByDate]
  );

  return {
    eventsByDate,
    getEventsForDate,
    hasEvents,
    getEventCount,
  };
};
