export function badgeStatus(status) {
  const classes = {
    Aberto: 'bg-primary',
    'Em andamento': 'bg-warning text-dark',
    Concluído: 'bg-success'
  };
  return <span className={`badge ${classes[status] ?? 'bg-secondary'}`}>{status}</span>;
}

export function badgePrioridade(prioridade) {
  const classes = {
    Baixa: 'bg-secondary',
    Média: 'bg-warning text-dark',
    Alta: 'bg-danger'
  };
  return <span className={`badge ${classes[prioridade] ?? 'bg-secondary'}`}>{prioridade}</span>;
}

export function formatarData(valor) {
  if (!valor) return '—';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return String(valor);
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function TabelaChamados({
  chamados = [],
  mostrarAcoes = true,
  onVisualizar,
  onEditar,
  onExcluir
}) {
  if (chamados.length === 0) {
    return (
      <div className="estado-vazio">
        <i className="bi bi-inbox" aria-hidden="true" />
        <strong>Nenhum chamado encontrado</strong>
        <p className="mb-0">Cadastre um novo chamado ou ajuste os filtros de pesquisa.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover tabela-helpdesk align-middle">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Título</th>
            <th scope="col">Solicitante</th>
            <th scope="col">Categoria</th>
            <th scope="col">Técnico</th>
            <th scope="col">Prioridade</th>
            <th scope="col">Status</th>
            <th scope="col">Data</th>
            {mostrarAcoes && <th scope="col" className="text-end">Ações</th>}
          </tr>
        </thead>
        <tbody>
          {chamados.map((chamado) => (
            <tr key={chamado.id}>
              <td>#{chamado.id}</td>
              <td className="fw-semibold">{chamado.titulo}</td>
              <td>{chamado.solicitante}</td>
              <td>{chamado.categoria ?? '—'}</td>
              <td>{chamado.tecnico ?? <span className="text-muted">Não atribuído</span>}</td>
              <td>{badgePrioridade(chamado.prioridade)}</td>
              <td>{badgeStatus(chamado.status)}</td>
              <td className="text-nowrap">{formatarData(chamado.data_abertura)}</td>
              {mostrarAcoes && (
                <td>
                  <div className="acoes-tabela justify-content-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      title="Visualizar"
                      aria-label={`Visualizar chamado ${chamado.id}`}
                      onClick={() => onVisualizar?.(chamado)}
                    >
                      <i className="bi bi-eye" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      title="Editar"
                      aria-label={`Editar chamado ${chamado.id}`}
                      onClick={() => onEditar?.(chamado)}
                    >
                      <i className="bi bi-pencil" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      title="Excluir"
                      aria-label={`Excluir chamado ${chamado.id}`}
                      onClick={() => onExcluir?.(chamado)}
                    >
                      <i className="bi bi-trash" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
