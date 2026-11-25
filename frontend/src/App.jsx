import { Navigate, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Chamados from './pages/Chamados.jsx';
import NovoChamado from './pages/NovoChamado.jsx';
import EditarChamado from './pages/EditarChamado.jsx';
import Tecnicos from './pages/Tecnicos.jsx';
import Categorias from './pages/Categorias.jsx';

export default function App() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar aberto={menuAberto} onFechar={() => setMenuAberto(false)} />
      <div className="main-wrapper">
        <Header onMenuClick={() => setMenuAberto(true)} />
        <main className="content-area">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chamados" element={<Chamados />} />
            <Route path="/chamados/novo" element={<NovoChamado />} />
            <Route path="/chamados/:id/editar" element={<EditarChamado />} />
            <Route path="/tecnicos" element={<Tecnicos />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
