import Api from "../axios/Api";

export const agendamentosService = {
  create: async (agendamento) => {
    try {
      const response = await Api.post("/agendamentos", agendamento);
      return response.data;
    } catch (error) {
      console.error("Erro na requisição:", error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      const response = await Api.get("/agendamentos");
      return response.data;
    } catch (error) {
      console.error("Erro na requisição:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await Api.get(`/agendamentos/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro na requisição:", error);
      throw error;
    }
  },

  update: async (id, agendamento) => {
    try {
      console.log(` Atualizando agendamento ${id}...`);
      const response = await Api.put(`/agendamentos/${id}`, agendamento);
      console.log(` Agendamento ${id} atualizado com sucesso`);
      return response.data;
    } catch (error) {
      console.error(` Erro ao atualizar agendamento ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      console.log(`🗑️ Deletando agendamento ${id}...`);
      const response = await Api.delete(`/agendamentos/${id}`);
      console.log(`Agendamento ${id} deletado com sucesso`);
      return response.data;
    } catch (error) {
      console.error(` Erro ao deletar agendamento ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },
};

export default agendamentosService;
