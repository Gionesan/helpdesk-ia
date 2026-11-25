import { useEffect, useState } from 'react';
import ModalConfirmacao from '../components/ModalConfirmacao.jsx';
import {
  atualizarCategoria,
  criarCategoria,
  excluirCategoria,
  listarCategorias,
  mensagemErro
} from '../services/api.js';

const formularioInicial = { nome: '', descricao: '' };

export default function Categorias() {
  const [form, setForm] = useState(formularioInicial);
  const [editandoId, setEditandoId] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [categoriaParaExcluir, setCategoriaParaExcluir] = useState(null);

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      setCategorias(await listarCategorias());
    } catch (error) {
      setErro(mensagemErro(error));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function alterar(campo, valor) {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
  }

  function prepararNovo() {
    setForm(formularioInicial);
    setEditandoId(null);
    setSucesso('');
  }

  function prepararEdicao(categoria) {
    setForm({ nome: categoria.nome, descricao: categoria.descricao ?? '' });
    setEditandoId(categoria.id);
    setSucesso('');
  }

  async function enviar(event) {
    event.preventDefault();
    setErro('');
    setSalvando(true);

    try {
      if (editandoId) {
        await atualizarCategoria(editandoId, form);
        setSucesso('Categoria atualizada com sucesso.');
      } else {
        await criarCategoria(form);
        setSucesso('Categoria cadastrada com sucesso.');
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
    if (!categoriaParaExcluir) return;

    const id = categoriaParaExcluir.id;
    setCategoriaParaExcluir(null);
    try {
      await excluirCategoria(id);
      setSucesso('Categoria excluída com sucesso.');
      await carregar();
    } catch (error) {
      setErro(mensagemErro(error));
    }
  }

  return (
    <>
      <div className="page-titulo">
        <h2>Categorias</h2>
        <p>Organize os chamados por tipo de problema.</p>
      </div>

      {sucesso && <div className="alert alert-success" role="status">{sucesso}</div>}
      {erro && <div className="alert alert-danger" role="alert">{erro}</div>}

      <div className="row g-4">
        <div className="col-xl-4">
          <form className="card painel form-helpdesk" onSubmit={enviar}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">{editandoId ? 'Editar categoria' : 'Nova categoria'}</h5>
              {editandoId && (
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={prepararNovo}>
                  Cancelar edição
                </button>
              )}
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label" htmlFor="nome">Nome da categoria *</label>
                <input id="nome" className="form-control" required maxLength={100} value={form.nome} onChange={(event) => alterar('nome', event.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="descricao">Descrição</label>
                <textarea id="descricao" className="form-control" rows={4} maxLength={1000} value={form.descricao} onChange={(event) => alterar('descricao', event.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={salvando}>
                <i className="bi bi-save me-2" aria-hidden="true" />
                {salvando ? 'Salvando...' : editandoId ? 'Salvar alterações' : 'Cadastrar categoria'}
              </button>
            </div>
          </form>
        </div>

        <div className="col-xl-8">
          <section className="card painel">
            <div className="card-header">
              <h5 className="mb-0">Categorias cadastradas</h5>
            </div>
            <div className="card-body">
              {carregando ? (
                <div className="alert alert-info mb-0">Carregando categorias...</div>
              ) : categorias.length === 0 ? (
                <div className="estado-vazio">
                  <i className="bi bi-tags" aria-hidden="true" />
                  <strong>Nenhuma categoria encontrada</strong>
                  <p className="mb-0">Cadastre uma categoria para começar.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover tabela-helpdesk align-middle">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Descrição</th>
                        <th className="text-end">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categorias.map((categoria) => (
                        <tr key={categoria.id}>
                          <td className="fw-semibold">{categoria.nome}</td>
                          <td className="text-muted">{categoria.descricao || '—'}</td>
                          <td>
                            <div className="acoes-tabela justify-content-end">
                              <button type="button" className="btn btn-sm btn-outline-secondary" aria-label={`Editar categoria ${categoria.id}`} onClick={() => prepararEdicao(categoria)}>
                                <i className="bi bi-pencil" aria-hidden="true" />
                              </button>
                              <button type="button" className="btn btn-sm btn-outline-danger" aria-label={`Excluir categoria ${categoria.id}`} onClick={() => setCategoriaParaExcluir(categoria)}>
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

      {categoriaParaExcluir && (
        <ModalConfirmacao
          titulo="Excluir categoria"
          mensagem={`Tem certeza de que deseja excluir a categoria ${categoriaParaExcluir.nome}?`}
          confirmLabel="Excluir"
          onConfirmar={confirmarExclusao}
          onCancelar={() => setCategoriaParaExcluir(null)}
        />
      )}
    </>
  );
}
