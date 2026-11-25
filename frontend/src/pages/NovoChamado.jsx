import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { criarChamado, listarCategorias, listarTecnicos, mensagemErro } from '../services/api.js';

const formularioInicial = {
  titulo: '',
  solicitante: '',
  email_solicitante: '',
  telefone_solicitante: '',
  descricao: '',
  id_categoria: '',
  id_tecnico: '',
  prioridade: 'Média'
};

export default function NovoChamado() {
  const navigate = useNavigate();
  const [form, setForm] = useState(formularioInicial);
  const [categorias, setCategorias] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;

    Promise.all([listarCategorias(), listarTecnicos()])
      .then(([respostaCategorias, respostaTecnicos]) => {
        if (!ativo) return;
        setCategorias(respostaCategorias);
        setTecnicos(respostaTecnicos);
      })
      .catch((error) => {
        if (ativo) setErro(mensagemErro(error));
      });

    return () => {
      ativo = false;
    };
  }, []);

  function alterar(campo, valor) {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
  }

  async function enviar(event) {
    event.preventDefault();
    setErro('');
    setSalvando(true);

    try {
      await criarChamado({
        titulo: form.titulo,
        solicitante: form.solicitante,
        email_solicitante: form.email_solicitante,
        telefone_solicitante: form.telefone_solicitante,
        descricao: form.descricao,
        id_categoria: Number(form.id_categoria),
        id_tecnico: form.id_tecnico ? Number(form.id_tecnico) : null,
        prioridade: form.prioridade
      });
      navigate('/chamados', { state: { mensagem: 'Chamado cadastrado com sucesso.' } });
    } catch (error) {
      setErro(mensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <div className="page-titulo">
        <h2>Novo Chamado</h2>
        <p>Preencha as informações do problema informado pelo solicitante.</p>
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
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2" aria-hidden="true" />
            O status inicial será <strong>Aberto</strong> e a data de abertura será registrada automaticamente.
          </div>

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
                placeholder="Ex.: Notebook não liga"
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
                placeholder="Descreva o que aconteceu, desde quando e qualquer informação relevante."
              />
            </div>
          </div>
        </div>
        <div className="card-footer d-flex justify-content-end gap-2 bg-transparent border-0">
          <Link to="/chamados" className="btn btn-outline-secondary">Cancelar</Link>
          <button type="submit" className="btn btn-primary" disabled={salvando}>
            <i className="bi bi-save me-2" aria-hidden="true" />
            {salvando ? 'Salvando...' : 'Cadastrar chamado'}
          </button>
        </div>
      </form>
    </>
  );
}
