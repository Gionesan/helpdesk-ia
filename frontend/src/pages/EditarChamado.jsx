import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  atualizarChamado,
  buscarChamado,
  listarCategorias,
  listarTecnicos,
  mensagemErro
} from '../services/api.js';

export default function EditarChamado() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;

    Promise.all([buscarChamado(id), listarCategorias(), listarTecnicos()])
      .then(([chamado, respostaCategorias, respostaTecnicos]) => {
        if (!ativo) return;
        setForm({
          titulo: chamado.titulo,
          solicitante: chamado.solicitante,
          email_solicitante: chamado.email_solicitante ?? '',
          telefone_solicitante: chamado.telefone_solicitante ?? '',
          descricao: chamado.descricao,
          id_categoria: String(chamado.id_categoria),
          id_tecnico: chamado.id_tecnico ? String(chamado.id_tecnico) : '',
          prioridade: chamado.prioridade,
          status: chamado.status
        });
        setCategorias(respostaCategorias);
        setTecnicos(respostaTecnicos);
      })
      .catch((error) => {
        if (ativo) setErro(mensagemErro(error));
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [id]);

  function alterar(campo, valor) {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
  }

  async function enviar(event) {
    event.preventDefault();
    setErro('');
    setSalvando(true);

    try {
      await atualizarChamado(id, {
        titulo: form.titulo,
        solicitante: form.solicitante,
        email_solicitante: form.email_solicitante,
        telefone_solicitante: form.telefone_solicitante,
        descricao: form.descricao,
        id_categoria: Number(form.id_categoria),
        id_tecnico: form.id_tecnico ? Number(form.id_tecnico) : null,
        prioridade: form.prioridade,
        status: form.status
      });
      navigate('/chamados', { state: { mensagem: 'Chamado atualizado com sucesso.' } });
    } catch (error) {
      setErro(mensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div className="alert alert-info">
        <i className="bi bi-hourglass-split me-2" aria-hidden="true" />
        Carregando dados do chamado...
      </div>
    );
  }

  if (!form) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
        {erro || 'Não foi possível carregar o chamado.'}
      </div>
    );
  }

  return (
    <>
      <div className="page-titulo">
        <h2>Editar Chamado #{id}</h2>
        <p>Altere os dados e o status do atendimento.</p>
      </div>

      {erro && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
          {erro}
        </div>
      )}

      <form className="card painel form-helpdesk" onSubmit={enviar}>
        <div className="card-header">
          <h5 className="mb-0">Dados do chamado</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label" htmlFor="titulo">Título do chamado *</label>
              <input
                id="titulo"
                className="form-control"
                required
                maxLength={150}
                value={form.titulo}
                onChange={(event) => alterar('titulo', event.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="solicitante">Nome do solicitante *</label>
              <input
                id="solicitante"
                className="form-control"
                required
                maxLength={100}
                value={form.solicitante}
                onChange={(event) => alterar('solicitante', event.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="email-solicitante">E-mail do solicitante</label>
              <input
                id="email-solicitante"
                type="email"
                className="form-control"
                maxLength={100}
                value={form.email_solicitante}
                onChange={(event) => alterar('email_solicitante', event.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="telefone-solicitante">Telefone do solicitante</label>
              <input
                id="telefone-solicitante"
                className="form-control"
                maxLength={20}
                value={form.telefone_solicitante}
                onChange={(event) => alterar('telefone_solicitante', event.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="categoria">Categoria do problema *</label>
              <select
                id="categoria"
                className="form-select"
                required
                value={form.id_categoria}
                onChange={(event) => alterar('id_categoria', event.target.value)}
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="tecnico">Técnico responsável</label>
              <select
                id="tecnico"
                className="form-select"
                value={form.id_tecnico}
                onChange={(event) => alterar('id_tecnico', event.target.value)}
              >
                <option value="">Não atribuído</option>
                {tecnicos.map((tecnico) => (
                  <option key={tecnico.id} value={tecnico.id}>{tecnico.nome}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="prioridade">Prioridade *</label>
              <select
                id="prioridade"
                className="form-select"
                required
                value={form.prioridade}
                onChange={(event) => alterar('prioridade', event.target.value)}
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="status">Status *</label>
              <select
                id="status"
                className="form-select"
                required
                value={form.status}
                onChange={(event) => alterar('status', event.target.value)}
              >
                <option value="Aberto">Aberto</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Concluído">Concluído</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="descricao">Descrição detalhada do problema *</label>
              <textarea
                id="descricao"
                className="form-control"
                rows={5}
                required
                maxLength={5000}
                value={form.descricao}
                onChange={(event) => alterar('descricao', event.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="card-footer d-flex justify-content-end gap-2 bg-transparent border-0">
          <Link to="/chamados" className="btn btn-outline-secondary">Cancelar</Link>
          <button type="submit" className="btn btn-primary" disabled={salvando}>
            <i className="bi bi-save me-2" aria-hidden="true" />
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </>
  );
}
