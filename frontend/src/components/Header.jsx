export default function Header({ onMenuClick }) {
  return (
    <header className="header">
      <button
        type="button"
        className="btn btn-light border d-lg-none"
        aria-label="Abrir menu"
        onClick={onMenuClick}
      >
        <i className="bi bi-list" aria-hidden="true" />
      </button>

      <div className="header__titulo">
        <h1>Help Desk</h1>
        <span>Gerenciamento de chamados técnicos</span>
      </div>

      <div className="header__acoes">
        <span className="badge rounded-pill text-bg-light border">
          <i className="bi bi-circle-fill text-success me-1" style={{ fontSize: '0.5rem' }} />
          Sistema online
        </span>
        <span className="header__avatar" title="Usuário">HD</span>
      </div>
    </header>
  );
}
