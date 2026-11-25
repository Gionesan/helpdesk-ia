import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import App from '../App.jsx';
import { buscarDashboard } from '../services/api.js';

vi.mock('../services/api.js', () => ({
  buscarDashboard: vi.fn(),
  listarChamados: vi.fn(() => Promise.resolve([])),
  buscarChamado: vi.fn(),
  criarChamado: vi.fn(),
  atualizarChamado: vi.fn(),
  excluirChamado: vi.fn(),
  listarTecnicos: vi.fn(() => Promise.resolve([])),
  buscarTecnico: vi.fn(),
  criarTecnico: vi.fn(),
  atualizarTecnico: vi.fn(),
  excluirTecnico: vi.fn(),
  listarCategorias: vi.fn(() => Promise.resolve([])),
  buscarCategoria: vi.fn(),
  criarCategoria: vi.fn(),
  atualizarCategoria: vi.fn(),
  excluirCategoria: vi.fn(),
  mensagemErro: (error) => error?.message ?? 'Erro'
}));

describe('Dashboard', () => {
  it('exibe indicadores e últimos chamados vindos da API', async () => {
    vi.mocked(buscarDashboard).mockResolvedValue({
      indicadores: {
        totalChamados: 7,
        chamadosAbertos: 3,
        chamadosEmAndamento: 2,
        chamadosConcluidos: 2,
        totalTecnicos: 4
      },
      ultimosChamados: [
        {
          id: 1,
          titulo: 'Notebook não liga',
          solicitante: 'João Silva',
          tecnico: 'Ana Paula Souza',
          prioridade: 'Alta',
          status: 'Em andamento',
          data_abertura: '2026-11-25T12:00:00.000Z'
        }
      ]
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Notebook não liga')).toBeInTheDocument();
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Ana Paula Souza')).toBeInTheDocument();
  });
});
