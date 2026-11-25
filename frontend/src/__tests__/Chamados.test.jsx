import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import App from '../App.jsx';
import { excluirChamado, listarChamados } from '../services/api.js';

vi.mock('../services/api.js', () => ({
  buscarDashboard: vi.fn(() => Promise.resolve({ indicadores: {}, ultimosChamados: [] })),
  listarChamados: vi.fn(),
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

const chamado = {
  id: 12,
  titulo: 'Impressora com erro',
  solicitante: 'Maria Costa',
  categoria: 'Impressoras',
  tecnico: 'Bruno Oliveira',
  prioridade: 'Baixa',
  status: 'Aberto',
  data_abertura: '2026-11-25T12:00:00.000Z'
};

describe('Página de chamados', () => {
  it('filtra, exibe a tabela e confirma exclusão', async () => {
    const usuario = userEvent.setup();
    vi.mocked(listarChamados).mockResolvedValue([chamado]);
    vi.mocked(excluirChamado).mockResolvedValue(undefined);

    render(
      <MemoryRouter initialEntries={['/chamados']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: 'Chamados' })).toBeInTheDocument();
    expect(screen.getByText('Impressora com erro')).toBeInTheDocument();

    await usuario.type(screen.getByLabelText('Pesquisar'), 'Impressora');
    expect(vi.mocked(listarChamados).mock.calls.at(-1)[0]).toMatchObject({ search: 'Impressora' });

    await usuario.click(screen.getByRole('button', { name: 'Excluir chamado 12' }));
    expect(screen.getByRole('dialog', { name: 'Excluir chamado' })).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Excluir', exact: true }));
    expect(vi.mocked(excluirChamado)).toHaveBeenCalledWith(12);
    expect(await screen.findByText('Chamado #12 excluído com sucesso.')).toBeInTheDocument();
  });
});
