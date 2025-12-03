import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { getEventDate } from "../utils/eventHelpers";
import Api from "../../../axios/Api";

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
        const response = await Api.get(`/agendamentos/${initialEvent.id}`);
        const apiData = response.data;
        
        // Mesclar dados da API com dados processados do initialEvent
        const mergedDetails = {
          ...apiData, // Dados completos da API
          title: initialEvent.fullTitle || initialEvent.title, // Usar fullTitle para o modal
          startTime: initialEvent.startTime, // Manter horário formatado
          endTime: initialEvent.endTime, // Manter horário formatado
          date: initialEvent.date, // Manter data processada
          backgroundColor: initialEvent.backgroundColor // Manter cor processada
        };
        
        setDetails(mergedDetails);
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

export const useDeleteAgendamento = (onSuccess) => {
  const [deleting, setDeleting] = useState(false);

  const deleteAgendamento = async (id) => {
    if (!id) return false;
    
    setDeleting(true);
    try {
      await Api.delete(`/agendamentos/${id}`);
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
