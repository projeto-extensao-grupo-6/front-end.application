import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { getEventDate } from "../utils/eventHelpers";

/**
 * Hook para gerenciar detalhes de um evento/agendamento
 * @param {Object} initialEvent - Evento inicial
 * @returns {Object} - Estado e funções do evento
 */
export const useEventDetails = (initialEvent) => {
  const [details, setDetails] = useState(initialEvent || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!initialEvent?.id) return;
    
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`http://localhost:3000/api/agendamentos/${initialEvent.id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          throw new Error("Falha ao buscar detalhes do evento");
        }
        
        const data = await response.json();
        setDetails(data);
      } catch (err) {
        console.error("Erro ao buscar detalhes:", err);
        setError(err.message);
        setDetails(initialEvent);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [initialEvent]);

  return { details, loading, error };
};

/**
 * Hook para deletar agendamento
 * @param {Function} onSuccess - Callback de sucesso
 * @returns {Object} - Estado e função de delete
 */
export const useDeleteAgendamento = (onSuccess) => {
  const [deleting, setDeleting] = useState(false);

  const deleteAgendamento = async (id) => {
    if (!id) return false;
    
    setDeleting(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:3000/api/agendamentos/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Falha ao excluir agendamento");
      }

      onSuccess?.(id);
      return true;
    } catch (err) {
      console.error("Erro ao excluir:", err);
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return { deleteAgendamento, deleting };
};

/**
 * Hook para agrupar eventos por data
 * @param {Array} events - Lista de eventos
 * @returns {Object} - Eventos agrupados por data
 */
export const useEventsByDate = (events) => {
  const eventsByDate = useMemo(() => {
    const grouped = {};
    events?.forEach((evt) => {
      const dateKey = getEventDate(evt);
      if (!dateKey) return;
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(evt);
    });
    return grouped;
  }, [events]);

  return { eventsByDate };
};
