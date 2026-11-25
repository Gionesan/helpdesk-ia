import { query } from '../database/index.js';
import {
  bodyObject,
  fail,
  has,
  requiredText,
  validEmail,
  validEnum,
  validId,
  withErrorHandling
} from './helpers.js';

const STATUS = ['Ativo', 'Inativo'];

async function buscarPorId(id) {
  const rows = await query('SELECT * FROM tecnicos WHERE id = ?', [id]);
  return rows[0] ?? null;
}

export const listar = withErrorHandling(async (request, reply) => {
  const filtros = request.query ?? {};
  const busca = typeof filtros.search === 'string' ? filtros.search.trim() : '';

  if (busca.length > 100) {
    fail(400, 'A pesquisa deve ter no máximo 100 caracteres.');
  }

  const like = `%${busca}%`;
  const tecnicos = await query(
    'SELECT * FROM tecnicos WHERE (? = \'\' OR nome LIKE ?) ORDER BY nome ASC',
    [busca, like]
  );

  return reply.send(tecnicos);
});

export const buscar = withErrorHandling(async (request, reply) => {
  const id = validId(request.params?.id, 'id');
  const tecnico = await buscarPorId(id);

  if (!tecnico) {
    fail(404, 'Técnico não encontrado.');
  }

  return reply.send(tecnico);
});

export const criar = withErrorHandling(async (request, reply) => {
  const body = bodyObject(request.body);

  const nome = requiredText(body.nome, 'nome', 100);
  const email = validEmail(body.email, 'e-mail', { required: true });
  const telefone = requiredText(body.telefone, 'telefone', 20);
  const especialidade = requiredText(body.especialidade, 'especialidade', 100);
  const status = validEnum(body.status, 'status', STATUS, { defaultValue: 'Ativo' });

  const result = await query(
    `INSERT INTO tecnicos (nome, email, telefone, especialidade, status, created_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [nome, email, telefone, especialidade, status]
  );

  return reply.code(201).send(await buscarPorId(result.insertId));
});

export const atualizar = withErrorHandling(async (request, reply) => {
  const id = validId(request.params?.id, 'id');
  const tecnicoAtual = await buscarPorId(id);

  if (!tecnicoAtual) {
    fail(404, 'Técnico não encontrado.');
  }

  const body = bodyObject(request.body);
  const campos = [];
  const valores = [];
  const definir = (coluna, valor) => {
    campos.push(`${coluna} = ?`);
    valores.push(valor);
  };

  if (has(body, 'nome')) definir('nome', requiredText(body.nome, 'nome', 100));
  if (has(body, 'email')) definir('email', validEmail(body.email, 'e-mail', { required: true }));
  if (has(body, 'telefone')) definir('telefone', requiredText(body.telefone, 'telefone', 20));
  if (has(body, 'especialidade')) definir('especialidade', requiredText(body.especialidade, 'especialidade', 100));
  if (has(body, 'status')) definir('status', validEnum(body.status, 'status', STATUS));

  if (campos.length > 0) {
    valores.push(id);
    await query(`UPDATE tecnicos SET ${campos.join(', ')} WHERE id = ?`, valores);
  }

  return reply.send(await buscarPorId(id));
});

export const excluir = withErrorHandling(async (request, reply) => {
  const id = validId(request.params?.id, 'id');
  const tecnico = await buscarPorId(id);

  if (!tecnico) {
    fail(404, 'Técnico não encontrado.');
  }

  const vinculos = await query('SELECT COUNT(*) AS total FROM chamados WHERE id_tecnico = ?', [id]);
  if (Number(vinculos[0].total) > 0) {
    fail(409, 'Não é possível excluir este técnico porque existem chamados vinculados a ele.');
  }

  await query('DELETE FROM tecnicos WHERE id = ?', [id]);
  return reply.code(204).send();
});
