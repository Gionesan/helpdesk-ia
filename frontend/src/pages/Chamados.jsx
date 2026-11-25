import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ModalConfirmacao from '../components/ModalConfirmacao.jsx';
import TabelaChamados, { badgePrioridade, badgeStatus, formatarData } from '../components/TabelaChamados.jsx';
import { excluirChamado, listarChamados, mensagemErro } from '../services/api.js';

export default function Chamados() {
  const navigate = useNavigate();
  const location = useLocation();
  const [filtros, setFiltros] = useState({ search: '', status: '', prioridade: '' });
  const [chamados, setChamados] = useState([]);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(location.state?.mensagem ?? '');
  const [carregando, setCarregando] = useState(true);
  const [chamadoParaExcluir, setChamadoParaExcluir] = useState(null);
  const [chamadoVisualizado, setChamadoVisualizado] = useState(null);

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      const dados = await listarChamados(filtros);
      setChamados(dados);
    } catch (error) {
      setErro(mensagemErro(error));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [filtros.search, filtros.status, filtros.prioridade]);

  function alterarFiltro(campo, valor) {
    setSucesso('');
    setFiltros((anterior) => ({ ...anterior, [campo]: valor }));
  }

  async function confirmarExclusao() {
    if (!chamadoParaExcluir) return;

    const id = chamadoParaExcluir.id;
    setChamadoParaExcluir(null);
    try {
      await excluirChamado(id);
      setSucesso(`Chamado #${id} excluído com sucesso.`);
      await carregar();
    } catch (error) {
      setErro(mensagemErro(error));
    }
  }

  return (
    <>
      <div className="page-titulo d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
          <h2>Chamados</h2>
          <p>Registre, acompanhe e finalize os atendimentos técnicos.</p>
        </div>
        <Link to="/chamados/novo" className="btn btn-primary">
          <i className="bi bi-plus-lg me-2" aria-hidden="true" />
          Novo Chamado
        </Link>
      </div>

      {sucesso && (
        <div className="alert alert-success" role="status">
          <i className="bi bi-check-circle me-2" aria-hidden="true" />
          {sucesso}
        </div>
      )}

      {erro && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
          {erro}
        </div>
      )}

      <section className="card painel mb-4">
        <div className="card-body">
          <div className="filtro-grid form-helpdesk">
            <div>
              <label className="form-label" htmlFor="filtro-busca">Pesquisar</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search" aria-hidden="true" />
                </span>
                <input
                  id="filtro-busca"
                  type="search"
                  className="form-control"
                  placeholder="Título ou solicitante"
                  value={filtros.search}
                  onChange={(event) => alterarFiltro('search', event.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="form-label" htmlFor="filtro-status">Status</label>
              <select
                id="filtro-status"
                className="form-select"
                value={filtros.status}
                onChange={(event) => alterarFiltro('status', event.target.value)}
              >
                <option value="">Todos</option>
                <option value="Aberto">Aberto</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Concluído">Concluído</option>
              </select>
            </div>
            <div>
              <label className="form-label" htmlFor="filtro-prioridade">Prioridade</label>
              <select
                id="filtro-prioridade"
                className="form-select"
                value={filtros.prioridade}
                onChange={(event) => alterarFiltro('prioridade', event.target.value)}
              >
                <option value="">Todas</option>
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="card painel">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Chamados cadastrados</h5>
          <span className="badge text-bg-light border">{chamados.length} registro(s)</span>
        </div>
        <div className="card-body">
          {carregando ? (
            <div className="alert alert-info mb-0">
              <i className="bi bi-hourglass-split me-2" aria-hidden="true" />
              Carregando chamados...
            </div>
          ) : (
            <TabelaChamados
              chamados={chamados}
              onVisualizar={setChamadoVisualizado}
              onEditar={(chamado) => navigate(`/chamados/${chamado.id}/editar`)}
              onExcluir={setChamadoParaExcluir}
            />
          )}
        </div>
      </section>

      {chamadoParaExcluir && (
        <ModalConfirmacao
          titulo="Excluir chamado"
          mensagem={`Tem certeza de que deseja excluir o chamado #${chamadoParaExcluir.id} — ${chamadoParaExcluir.titulo}?`}
          confirmLabel="Excluir"
          onConfirmar={confirmarExclusao}
          onCancelar={() => setChamadoParaExcluir(null)}
        />
      )}

      {chamadoVisualizado && (
        <div className="modal modal-helpdesk d-block" tabIndex="-1" role="dialog" aria-modal="true" aria-label="Detalhes do chamado">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chamado #{chamadoVisualizado.id}</h5>
                <button type="button" className="btn-close" aria-label="Fechar" onClick={() => setChamadoVisualizado(null)} />
              </div>
              <div className="modal-body">
                <h5>{chamadoVisualizado.titulo}</h5>
                <p className="text-muted mb-3">Aberto em {formatarData(chamadoVisualizado.data_abertura)}</p>
                <div className="row g-3 mb-3">
                  <div className="col-sm-6"><strong>Solicitante:</strong> {chamadoVisualizado.solicitante}</div>
                  <div className="col-sm-6"><strong>E-mail:</strong> {chamadoVisualizado.email_solicitante || '—'}</div>
                  <div className="col-sm-6"><strong>Telefone:</strong> {chamadoVisualizado.telefone_solicitante || '—'}</div>
                  <div className="col-sm-6"><strong>Categoria:</strong> {chamadoVisualizado.categoria}</div>
                  <div className="col-sm-6"><strong>Técnico:</strong> {chamadoVisualizado.tecnico || 'Não atribuído'}</div>
                  <div className="col-sm-6"><strong>Prioridade:</strong> {badgePrioridade(chamadoVisualizado.prioridade)}</div>
                  <div className="col-sm-6"><strong>Status:</strong> {badgeStatus(chamadoVisualizado.status)}</div>
                  <div className="col-sm-6"><strong>Atualizado em:</strong> {formatarData(chamadoVisualizado.data_atualizacao)}</div>
                </div>
                <hr />
                <strong>Descrição</strong>
                <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{chamadoVisualizado.descricao}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setChamadoVisualizado(null)}>
                  Fechar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate(`/chamados/${chamadoVisualizado.id}/editar`)}
                >
                  Editar chamado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
