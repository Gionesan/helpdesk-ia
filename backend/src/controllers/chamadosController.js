import { query } from '../database/index.js';
import {
  bodyObject,
  fail,
  has,
  optionalText,
  requiredText,
  validEmail,
  validEnum,
  validId,
  withErrorHandling
} from './helpers.js';

const PRIORIDADES = ['Baixa', 'Média', 'Alta'];
const STATUS = ['Aberto', 'Em andamento', 'Concluído'];

const SELECT_CHAMADO = `
  SELECT
    c.id,
    c.titulo,
    c.descricao,
    c.solicitante,
    c.email_solicitante,
    c.telefone_solicitante,
    c.id_categoria,
    cat.nome AS categoria,
    c.id_tecnico,
    t.nome AS tecnico,
    c.prioridade,
    c.status,
    c.data_abertura,
    c.data_atualizacao
  FROM chamados c
  INNER JOIN categorias cat ON cat.id = c.id_categoria
  LEFT JOIN tecnicos t ON t.id = c.id_tecnico
`;

async function buscarPorId(id) {
  const rows = await query(`${SELECT_CHAMADO} WHERE c.id = ?`, [id]);
  return rows[0] ?? null;
}

async function garantirCategoria(id) {
  const rows = await query('SELECT id FROM categorias WHERE id = ?', [id]);
  if (rows.length === 0) {
    fail(400, 'Categoria informada não encontrada.');
  }
}

async function garantirTecnico(id) {
  const rows = await query('SELECT id FROM tecnicos WHERE id = ?', [id]);
  if (rows.length === 0) {
    fail(400, 'Técnico informado não encontrado.');
  }
}

export const listar = withErrorHandling(async (request, reply) => {
  const filtros = request.query ?? {};
  const busca = typeof filtros.search === 'string' ? filtros.search.trim() : '';

  if (busca.length > 150) {
    fail(400, 'A pesquisa deve ter no máximo 150 caracteres.');
  }

  const status = has(filtros, 'status') && filtros.status !== ''
    ? validEnum(filtros.status, 'status', STATUS)
    : '';
  const prioridade = has(filtros, 'prioridade') && filtros.prioridade !== ''
    ? validEnum(filtros.prioridade, 'prioridade', PRIORIDADES)
    : '';

  const like = `%${busca}%`;
  const chamados = await query(
    `${SELECT_CHAMADO}
     WHERE (? = '' OR c.titulo LIKE ? OR c.solicitante LIKE ?)
       AND (? = '' OR c.status = ?)
       AND (? = '' OR c.prioridade = ?)
     ORDER BY c.id DESC`,
    [busca, like, like, status, status, prioridade, prioridade]
  );

  return reply.send(chamados);
});

export const buscar = withErrorHandling(async (request, reply) => {
  const id = validId(request.params?.id, 'id');
  const chamado = await buscarPorId(id);

  if (!chamado) {
    fail(404, 'Chamado não encontrado.');
  }

  return reply.send(chamado);
});

export const criar = withErrorHandling(async (request, reply) => {
  const body = bodyObject(request.body);

  const titulo = requiredText(body.titulo, 'título', 150);
  const descricao = requiredText(body.descricao, 'descrição', 5000);
  const solicitante = requiredText(body.solicitante, 'solicitante', 100);
  const emailSolicitante = validEmail(body.email_solicitante, 'e-mail do solicitante');
  const telefoneSolicitante = optionalText(body.telefone_solicitante, 'telefone do solicitante', 20);
  const idCategoria = validId(body.id_categoria, 'categoria');
  const idTecnico = body.id_tecnico === undefined || body.id_tecnico === null || body.id_tecnico === ''
    ? null
    : validId(body.id_tecnico, 'técnico');
  const prioridade = validEnum(body.prioridade, 'prioridade', PRIORIDADES, { defaultValue: 'Média' });

  await garantirCategoria(idCategoria);
  if (idTecnico !== null) {
    await garantirTecnico(idTecnico);
  }

  const result = await query(
    `INSERT INTO chamados (
       titulo, descricao, solicitante, email_solicitante, telefone_solicitante,
       id_categoria, id_tecnico, prioridade, status, data_abertura, data_atualizacao
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Aberto', NOW(), NOW())`,
    [
      titulo,
      descricao,
      solicitante,
      emailSolicitante,
      telefoneSolicitante,
      idCategoria,
      idTecnico,
      prioridade
    ]
  );

  return reply.code(201).send(await buscarPorId(result.insertId));
});

export const atualizar = withErrorHandling(async (request, reply) => {
  const id = validId(request.params?.id, 'id');
  const chamadoAtual = await buscarPorId(id);

  if (!chamadoAtual) {
    fail(404, 'Chamado não encontrado.');
  }

  const body = bodyObject(request.body);
  const campos = [];
  const valores = [];
  const definir = (coluna, valor) => {
    campos.push(`${coluna} = ?`);
    valores.push(valor);
  };

  if (has(body, 'titulo')) definir('titulo', requiredText(body.titulo, 'título', 150));
  if (has(body, 'descricao')) definir('descricao', requiredText(body.descricao, 'descrição', 5000));
  if (has(body, 'solicitante')) definir('solicitante', requiredText(body.solicitante, 'solicitante', 100));
  if (has(body, 'email_solicitante')) definir('email_solicitante', validEmail(body.email_solicitante, 'e-mail do solicitante'));
  if (has(body, 'telefone_solicitante')) definir('telefone_solicitante', optionalText(body.telefone_solicitante, 'telefone do solicitante', 20));
  if (has(body, 'prioridade')) definir('prioridade', validEnum(body.prioridade, 'prioridade', PRIORIDADES));
  if (has(body, 'status')) definir('status', validEnum(body.status, 'status', STATUS));

  if (has(body, 'id_categoria')) {
    const idCategoria = validId(body.id_categoria, 'categoria');
    await garantirCategoria(idCategoria);
    definir('id_categoria', idCategoria);
  }

  if (has(body, 'id_tecnico')) {
    const idTecnico = body.id_tecnico === undefined || body.id_tecnico === null || body.id_tecnico === ''
      ? null
      : validId(body.id_tecnico, 'técnico');
    if (idTecnico !== null) {
      await garantirTecnico(idTecnico);
    }
    definir('id_tecnico', idTecnico);
  }

  campos.push('data_atualizacao = NOW()');
  valores.push(id);

  await query(`UPDATE chamados SET ${campos.join(', ')} WHERE id = ?`, valores);

  return reply.send(await buscarPorId(id));
});

export const excluir = withErrorHandling(async (request, reply) => {
  const id = validId(request.params?.id, 'id');
  const chamado = await query('SELECT id FROM chamados WHERE id = ?', [id]);

  if (chamado.length === 0) {
    fail(404, 'Chamado não encontrado.');
  }

  await query('DELETE FROM chamados WHERE id = ?', [id]);
  return reply.code(204).send();
});
