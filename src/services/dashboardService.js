import Api from "../axios/Api";

const API_DASHBOARD = "/dashboard";

export const getQtdItensCriticos = () => {
    return Api.get(`${API_DASHBOARD}/qtd-itens-criticos`);
}

export const getQtdAgendamentosHoje = () => {
    return Api.get(`${API_DASHBOARD}/qtd-agendamentos-hoje`);
}

export const getTaxaOcupacaoServicos = async () => {
    try {
        const response = await Api.get(`${API_DASHBOARD}/taxa-ocupacao-servicos`);
        // Se a taxa de ocupação for null, retorna 0
        if (response.data === null || response.data === undefined || response.data.taxaOcupacaoServicos === null || response.data.taxaOcupacaoServicos === undefined) {
            return { ...response, data: { ...response.data, taxaOcupacaoServicos: 0 } };
        }
        return response;
    } catch (error) {
        throw error;
    }
}

export const getQtdAgendamentosFuturos = () => {
    return Api.get(`${API_DASHBOARD}/qtd-agendamentos-futuros`)
}

export const getEstoqueCritico = () => {
    return Api.get(`${API_DASHBOARD}/estoque-critico`);
}

export const getAgendamentosFuturos = () => {
    return Api.get(`${API_DASHBOARD}/agendamentos-futuros`);
}

export const getQtdServicosHoje = () => {
    return Api.get(`${API_DASHBOARD}/qtd-servicos-hoje`);
}
