import { query } from '../database/index.js';
import { bodyObject, fail, has, optionalText, requiredText, validId, withErrorHandling } from './helpers.js';

async function buscarPorId(id) {
  const rows = await query('SELECT * FROM categorias WHERE id = ?', [id]);
  return rows[0] ?? null;
}

export const listar = withErrorHandling(async (_request, reply) => {
  const categorias = await query('SELECT * FROM categorias ORDER BY nome ASC');
  return reply.send(categorias);
});

export const buscar = withErrorHandling(async (request, reply) => {
  const id = validId(request.params?.id, 'id');
  const categoria = await buscarPorId(id);

  if (!categoria) {
    fail(404, 'Categoria não encontrada.');
  }

  return reply.send(categoria);
});

export const criar = withErrorHandling(async (request, reply) => {
  const body = bodyObject(request.body);
  const nome = requiredText(body.nome, 'nome', 100);
  const descricao = optionalText(body.descricao, 'descrição', 1000);

  const result = await query(
    'INSERT INTO categorias (nome, descricao, created_at) VALUES (?, ?, NOW())',
    [nome, descricao]
  );

  return reply.code(201).send(await buscarPorId(result.insertId));
});

export const atualizar = withErrorHandling(async (request, reply) => {
  const id = validId(request.params?.id, 'id');
  const categoriaAtual = await buscarPorId(id);

  if (!categoriaAtual) {
    fail(404, 'Categoria não encontrada.');
  }

  const body = bodyObject(request.body);
  const campos = [];
  const valores = [];
  const definir = (coluna, valor) => {
    campos.push(`${coluna} = ?`);
    valores.push(valor);
  };

  if (has(body, 'nome')) definir('nome', requiredText(body.nome, 'nome', 100));
  if (has(body, 'descricao')) definir('descricao', optionalText(body.descricao, 'descrição', 1000));

  if (campos.length > 0) {
    valores.push(id);
    await query(`UPDATE categorias SET ${campos.join(', ')} WHERE id = ?`, valores);
  }

  return reply.send(await buscarPorId(id));
});

export const excluir = withErrorHandling(async (request, reply) => {
  const id = validId(request.params?.id, 'id');
  const categoria = await buscarPorId(id);

  if (!categoria) {
    fail(404, 'Categoria não encontrada.');
  }

  const vinculos = await query('SELECT COUNT(*) AS total FROM chamados WHERE id_categoria = ?', [id]);
  if (Number(vinculos[0].total) > 0) {
    fail(409, 'Não é possível excluir esta categoria porque existem chamados vinculados a ela.');
  }

  await query('DELETE FROM categorias WHERE id = ?', [id]);
  return reply.code(204).send();
});
