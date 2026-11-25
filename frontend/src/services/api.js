import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
  timeout: 10000
});

export function mensagemErro(error) {
  return error?.response?.data?.error || error?.message || 'Não foi possível concluir a operação.';
}

export async function buscarDashboard() {
  const { data } = await api.get('/dashboard');
  return data;
}

export async function listarChamados(filtros = {}) {
  const params = Object.fromEntries(
    Object.entries(filtros).filter(([, valor]) => valor !== '' && valor !== null && valor !== undefined)
  );
  const { data } = await api.get('/chamados', { params });
  return data;
}

export async function buscarChamado(id) {
  const { data } = await api.get(`/chamados/${id}`);
  return data;
}

export async function criarChamado(dados) {
  const { data } = await api.post('/chamados', dados);
  return data;
}

export async function atualizarChamado(id, dados) {
  const { data } = await api.put(`/chamados/${id}`, dados);
  return data;
}

export async function excluirChamado(id) {
  await api.delete(`/chamados/${id}`);
}

export async function listarTecnicos(search = '') {
  const { data } = await api.get('/tecnicos', { params: search ? { search } : {} });
  return data;
}

export async function buscarTecnico(id) {
  const { data } = await api.get(`/tecnicos/${id}`);
  return data;
}

export async function criarTecnico(dados) {
  const { data } = await api.post('/tecnicos', dados);
  return data;
}

export async function atualizarTecnico(id, dados) {
  const { data } = await api.put(`/tecnicos/${id}`, dados);
  return data;
}

export async function excluirTecnico(id) {
  await api.delete(`/tecnicos/${id}`);
}

export async function listarCategorias() {
  const { data } = await api.get('/categorias');
  return data;
}

export async function buscarCategoria(id) {
  const { data } = await api.get(`/categorias/${id}`);
  return data;
}

export async function criarCategoria(dados) {
  const { data } = await api.post('/categorias', dados);
  return data;
}

export async function atualizarCategoria(id, dados) {
  const { data } = await api.put(`/categorias/${id}`, dados);
  return data;
}

export async function excluirCategoria(id) {
  await api.delete(`/categorias/${id}`);
}

export default api;
