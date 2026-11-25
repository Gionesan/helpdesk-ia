import { NavLink } from 'react-router-dom';

const itens = [
  { to: '/', label: 'Dashboard', icone: 'bi-speedometer2', end: true },
  { to: '/chamados', label: 'Chamados', icone: 'bi-ticket-perforated', end: false },
  { to: '/tecnicos', label: 'Técnicos', icone: 'bi-people', end: false },
  { to: '/categorias', label: 'Categorias', icone: 'bi-tags', end: false }
];

export default function Sidebar({ aberto = false, onFechar }) {
  return (
    <>
      <aside className={`sidebar${aberto ? ' sidebar--aberto' : ''}`}>
        <div className="sidebar__brand">
          <span className="sidebar__logo">
            <i className="bi bi-headset" aria-hidden="true" />
          </span>
          <div>
            <strong>Help Desk</strong>
            <small>Suporte técnico</small>
          </div>
        </div>

        <div className="sidebar__section">Menu principal</div>
        <nav className="nav flex-column" aria-label="Menu principal">
          {itens.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={onFechar}
            >
              <i className={`bi ${item.icone}`} aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
          <button type="button" className="nav-link btn btn-link" onClick={onFechar}>
            <i className="bi bi-box-arrow-right" aria-hidden="true" />
            Sair
          </button>
        </nav>

        <div className="sidebar__footer">Help Desk IA · versão 1.0</div>
      </aside>
      {aberto && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Fechar menu"
          onClick={onFechar}
        />
      )}
    </>
  );
}
