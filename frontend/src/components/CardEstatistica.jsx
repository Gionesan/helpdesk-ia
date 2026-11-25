export default function CardEstatistica({ titulo, valor, icone, cor = 'primary', rodape }) {
  const cores = {
    primary: { background: '#dbeafe', color: '#2563eb' },
    success: { background: '#dcfce7', color: '#16a34a' },
    warning: { background: '#fef9c3', color: '#a16207' },
    danger: { background: '#fee2e2', color: '#dc2626' },
    dark: { background: '#e2e8f0', color: '#172554' }
  };
  const estilo = cores[cor] ?? cores.primary;

  return (
    <div className="card stat-card">
      <div className="stat-card__corpo">
        <span className="stat-card__icone" style={estilo}>
          <i className={`bi ${icone}`} aria-hidden="true" />
        </span>
        <div>
          <span className="stat-card__valor">{valor}</span>
          <span className="stat-card__label">{titulo}</span>
          {rodape && <div className="small text-muted mt-1">{rodape}</div>}
        </div>
      </div>
    </div>
  );
}
