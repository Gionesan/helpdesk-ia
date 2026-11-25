import { query } from '../database/index.js';
import { withErrorHandling } from './helpers.js';

export const obter = withErrorHandling(async (_request, reply) => {
  const [contagem] = await query(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'Aberto' THEN 1 ELSE 0 END) AS abertos,
      SUM(CASE WHEN status = 'Em andamento' THEN 1 ELSE 0 END) AS em_andamento,
      SUM(CASE WHEN status = 'Concluído' THEN 1 ELSE 0 END) AS concluidos
    FROM chamados
  `);

  const [tecnicos] = await query('SELECT COUNT(*) AS total FROM tecnicos');

  const ultimosChamados = await query(`
    SELECT
      c.id,
      c.titulo,
      c.solicitante,
      t.nome AS tecnico,
      c.prioridade,
      c.status,
      c.data_abertura
    FROM chamados c
    LEFT JOIN tecnicos t ON t.id = c.id_tecnico
    ORDER BY c.data_abertura DESC, c.id DESC
    LIMIT 5
  `);

  return reply.send({
    indicadores: {
      totalChamados: Number(contagem.total ?? 0),
      chamadosAbertos: Number(contagem.abertos ?? 0),
      chamadosEmAndamento: Number(contagem.em_andamento ?? 0),
      chamadosConcluidos: Number(contagem.concluidos ?? 0),
      totalTecnicos: Number(tecnicos.total ?? 0)
    },
    ultimosChamados
  });
});
