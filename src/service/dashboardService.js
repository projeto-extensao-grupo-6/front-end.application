import axios from "./api";

const API_DASHBOARD = "/dashboard";

export const getQtdItensCriticos = () => {
    return axios.get(`${API_DASHBOARD}/qtd-itens-criticos`);
}

export const getQtdAgendamentosHoje = () => {
    return axios.get(`${API_DASHBOARD}/qtd-agendamentos-hoje`);
}

export const getTaxaOcupacaoServicos = () => {
    return axios.get(`${API_DASHBOARD}/taxa-ocupacao-servicos`);
}

export const getQtdAgendamentosFuturos = () => {
    return axios.get(`${API_DASHBOARD}/qtd-agendamentos-futuros`)
}

export const getEstoqueCritico = () => {
    return axios.get(`${API_DASHBOARD}/estoque-critico`);
}

export const getAgendamentosFuturos = () => {
    return axios.get(`${API_DASHBOARD}/agendamentos-futuros`);
}

export const getQtdServicosHoje = () => {
    return axios.get(`${API_DASHBOARD}/qtd-servicos-hoje`);
}
