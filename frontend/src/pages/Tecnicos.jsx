import { useEffect, useState } from 'react';
import ModalConfirmacao from '../components/ModalConfirmacao.jsx';
import {
  atualizarTecnico,
  criarTecnico,
  excluirTecnico,
  listarTecnicos,
  mensagemErro
} from '../services/api.js';

const formularioInicial = {
  nome: '',
  email: '',
  telefone: '',
  especialidade: '',
  status: 'Ativo'
};

export default function Tecnicos() {
  const [form, setForm] = useState(formularioInicial);
  const [editandoId, setEditandoId] = useState(null);
  const [tecnicos, setTecnicos] = useState([]);
  const [search, setSearch] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [tecnicoParaExcluir, setTecnicoParaExcluir] = useState(null);

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      setTecnicos(await listarTecnicos(search));
    } catch (error) {
      setErro(mensagemErro(error));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [search]);

  function alterar(campo, valor) {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
  }

  function prepararNovo() {
    setForm(formularioInicial);
    setEditandoId(null);
    setSucesso('');
  }

  function prepararEdicao(tecnico) {
    setForm({
      nome: tecnico.nome,
      email: tecnico.email,
      telefone: tecnico.telefone,
      especialidade: tecnico.especialidade,
      status: tecnico.status
    });
    setEditandoId(tecnico.id);
    setSucesso('');
  }

  async function enviar(event) {
    event.preventDefault();
    setErro('');
    setSalvando(true);

    try {
      if (editandoId) {
        await atualizarTecnico(editandoId, form);
        setSucesso('Técnico atualizado com sucesso.');
      } else {
        await criarTecnico(form);
        setSucesso('Técnico cadastrado com sucesso.');
      }
      prepararNovo();
      await carregar();
    } catch (error) {
      setErro(mensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarExclusao() {
    if (!tecnicoParaExcluir) return;

    const id = tecnicoParaExcluir.id;
    setTecnicoParaExcluir(null);
    try {
      await excluirTecnico(id);
      setSucesso('Técnico excluído com sucesso.');
      await carregar();
    } catch (error) {
      setErro(mensagemErro(error));
    }
  }

  return (
    <>
      <div className="page-titulo">
        <h2>Técnicos</h2>
        <p>Cadastre e gerencie os profissionais responsáveis pelos atendimentos.</p>
      </div>

      {sucesso && <div className="alert alert-success" role="status">{sucesso}</div>}
      {erro && <div className="alert alert-danger" role="alert">{erro}</div>}

      <div className="row g-4">
        <div className="col-xl-4">
          <form className="card painel form-helpdesk" onSubmit={enviar}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">{editandoId ? 'Editar técnico' : 'Novo técnico'}</h5>
              {editandoId && (
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={prepararNovo}>
                  Cancelar edição
                </button>
              )}
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label" htmlFor="nome">Nome completo *</label>
                <input id="nome" className="form-control" required maxLength={100} value={form.nome} onChange={(event) => alterar('nome', event.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="email">E-mail *</label>
                <input id="email" type="email" className="form-control" required maxLength={100} value={form.email} onChange={(event) => alterar('email', event.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="telefone">Telefone *</label>
                <input id="telefone" className="form-control" required maxLength={20} value={form.telefone} onChange={(event) => alterar('telefone', event.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="especialidade">Especialidade *</label>
                <input id="especialidade" className="form-control" required maxLength={100} value={form.especialidade} onChange={(event) => alterar('especialidade', event.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="status">Status *</label>
                <select id="status" className="form-select" value={form.status} onChange={(event) => alterar('status', event.target.value)}>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={salvando}>
                <i className="bi bi-save me-2" aria-hidden="true" />
                {salvando ? 'Salvando...' : editandoId ? 'Salvar alterações' : 'Cadastrar técnico'}
              </button>
            </div>
          </form>
        </div>

        <div className="col-xl-8">
          <section className="card painel">
            <div className="card-header">
              <label className="form-label visually-hidden" htmlFor="pesquisa-tecnico">Pesquisar técnico</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search" aria-hidden="true" /></span>
                <input
                  id="pesquisa-tecnico"
                  type="search"
                  className="form-control"
                  placeholder="Pesquisar técnico pelo nome"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
            <div className="card-body">
              {carregando ? (
                <div className="alert alert-info mb-0">Carregando técnicos...</div>
              ) : tecnicos.length === 0 ? (
                <div className="estado-vazio">
                  <i className="bi bi-people" aria-hidden="true" />
                  <strong>Nenhum técnico encontrado</strong>
                  <p className="mb-0">Cadastre um técnico ou ajuste a pesquisa.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover tabela-helpdesk align-middle">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>E-mail</th>
                        <th>Especialidade</th>
                        <th>Status</th>
                        <th className="text-end">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tecnicos.map((tecnico) => (
                        <tr key={tecnico.id}>
                          <td className="fw-semibold">{tecnico.nome}<div className="small text-muted">{tecnico.telefone}</div></td>
                          <td>{tecnico.email}</td>
                          <td>{tecnico.especialidade}</td>
                          <td>
                            <span className={`badge ${tecnico.status === 'Ativo' ? 'bg-success' : 'bg-secondary'}`}>
                              {tecnico.status}
                            </span>
                          </td>
                          <td>
                            <div className="acoes-tabela justify-content-end">
                              <button type="button" className="btn btn-sm btn-outline-secondary" aria-label={`Editar técnico ${tecnico.id}`} onClick={() => prepararEdicao(tecnico)}>
                                <i className="bi bi-pencil" aria-hidden="true" />
                              </button>
                              <button type="button" className="btn btn-sm btn-outline-danger" aria-label={`Excluir técnico ${tecnico.id}`} onClick={() => setTecnicoParaExcluir(tecnico)}>
                                <i className="bi bi-trash" aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {tecnicoParaExcluir && (
        <ModalConfirmacao
          titulo="Excluir técnico"
          mensagem={`Tem certeza de que deseja excluir o técnico ${tecnicoParaExcluir.nome}?`}
          confirmLabel="Excluir"
          onConfirmar={confirmarExclusao}
          onCancelar={() => setTecnicoParaExcluir(null)}
        />
      )}
    </>
  );
}
