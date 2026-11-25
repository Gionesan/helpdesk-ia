import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import App from '../App.jsx';
import { criarChamado, listarCategorias, listarChamados, listarTecnicos } from '../services/api.js';

vi.mock('../services/api.js', () => ({
  buscarDashboard: vi.fn(() => Promise.resolve({ indicadores: {}, ultimosChamados: [] })),
  listarChamados: vi.fn(),
  buscarChamado: vi.fn(),
  criarChamado: vi.fn(),
  atualizarChamado: vi.fn(),
  excluirChamado: vi.fn(),
  listarTecnicos: vi.fn(),
  buscarTecnico: vi.fn(),
  criarTecnico: vi.fn(),
  atualizarTecnico: vi.fn(),
  excluirTecnico: vi.fn(),
  listarCategorias: vi.fn(),
  buscarCategoria: vi.fn(),
  criarCategoria: vi.fn(),
  atualizarCategoria: vi.fn(),
  excluirCategoria: vi.fn(),
  mensagemErro: (error) => error?.message ?? 'Erro'
}));

describe('Novo chamado', () => {
  it('carrega categorias/técnicos e envia o formulário para a API', async () => {
    const usuario = userEvent.setup();
    vi.mocked(listarCategorias).mockResolvedValue([{ id: 1, nome: 'Hardware' }]);
    vi.mocked(listarTecnicos).mockResolvedValue([{ id: 3, nome: 'Ana Paula Souza' }]);
    vi.mocked(criarChamado).mockResolvedValue({ id: 20 });
    vi.mocked(listarChamados).mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={['/chamados/novo']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: 'Novo Chamado' })).toBeInTheDocument();

    await usuario.type(screen.getByLabelText('Título do chamado *'), 'Teclado com falha');
    await usuario.type(screen.getByLabelText('Nome do solicitante *'), 'Carlos Lima');
    await usuario.selectOptions(screen.getByLabelText('Categoria do problema *'), '1');
    await usuario.selectOptions(screen.getByLabelText('Técnico responsável'), '3');
    await usuario.type(screen.getByLabelText('Descrição detalhada do problema *'), 'Algumas teclas não respondem.');
    await usuario.click(screen.getByRole('button', { name: /Cadastrar chamado/ }));

    expect(vi.mocked(criarChamado)).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: 'Teclado com falha',
        solicitante: 'Carlos Lima',
        id_categoria: 1,
        id_tecnico: 3,
        prioridade: 'Média'
      })
    );
    expect(await screen.findByText('Chamado cadastrado com sucesso.')).toBeInTheDocument();
  });
});
