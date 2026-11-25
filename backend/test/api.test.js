import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

process.env.NODE_ENV = 'test';
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'helpdesk_db'
};

let app;
let closePool;

async function request(method, url, payload) {
  return app.inject({
    method,
    url,
    payload,
    headers: payload === undefined ? {} : { 'content-type': 'application/json' }
  });
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

test('API Help Desk com banco real', async (t) => {
  await t.test('prepara o banco de testes', async () => {
    const { database: _database, ...configSemBanco } = dbConfig;
    const connection = await mysql.createConnection({ ...configSemBanco, multipleStatements: true });
    const schemaPath = fileURLToPath(new URL('../../database/schema.sql', import.meta.url));
    const schema = await readFile(schemaPath, 'utf8');
    await connection.query(schema);
    await connection.end();

    const moduloServidor = await import('../src/server.js');
    const moduloBanco = await import('../src/database/index.js');
    app = await moduloServidor.buildApp();
    closePool = moduloBanco.closePool;
  });

  await t.test('health retorna ok', async () => {
    const response = await request('GET', '/health');
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), { status: 'ok' });
  });

  await t.test('dashboard retorna indicadores e últimos chamados', async () => {
    const response = await request('GET', '/dashboard');
    assert.equal(response.statusCode, 200);
    const dados = response.json();
    assert.equal(dados.indicadores.totalChamados, 5);
    assert.equal(dados.indicadores.chamadosAbertos, 3);
    assert.equal(dados.indicadores.chamadosEmAndamento, 1);
    assert.equal(dados.indicadores.chamadosConcluidos, 1);
    assert.equal(dados.indicadores.totalTecnicos, 3);
    assert.equal(dados.ultimosChamados.length, 5);
  });

  await t.test('rejeita chamado sem título', async () => {
    const response = await request('POST', '/chamados', {
      descricao: 'Sem título',
      solicitante: 'Teste',
      id_categoria: 1
    });
    assert.equal(response.statusCode, 400);
    assert.match(response.json().error, /título/);
  });

  let chamadoCriado;

  await t.test('cadastra chamado começando como Aberto', async () => {
    const response = await request('POST', '/chamados', {
      titulo: 'Chamado de teste automatizado',
      descricao: 'Descrição detalhada do chamado de teste.',
      solicitante: 'Usuário de Teste',
      email_solicitante: 'usuario.teste@empresa.test',
      telefone_solicitante: '(11) 90000-0000',
      id_categoria: 2,
      id_tecnico: 2,
      prioridade: 'Alta',
      status: 'Concluído'
    });
    assert.equal(response.statusCode, 201);
    chamadoCriado = response.json();
    assert.equal(chamadoCriado.status, 'Aberto');
    assert.equal(chamadoCriado.prioridade, 'Alta');
    assert.equal(chamadoCriado.categoria, 'Software');
    assert.equal(chamadoCriado.tecnico, 'Bruno Oliveira');
  });

  await t.test('lista e filtra chamados por título, status e prioridade', async () => {
    const response = await request(
      'GET',
      '/chamados?search=automatizado&status=Aberto&prioridade=Alta'
    );
    assert.equal(response.statusCode, 200);
    const chamados = response.json();
    assert.equal(chamados.length, 1);
    assert.equal(chamados[0].id, chamadoCriado.id);
  });

  await t.test('atualiza chamado e modifica a data de atualização', async () => {
    await delay(1100);
    const response = await request('PUT', `/chamados/${chamadoCriado.id}`, {
      status: 'Em andamento',
      prioridade: 'Média',
      id_tecnico: 1
    });
    assert.equal(response.statusCode, 200);
    const atualizado = response.json();
    assert.equal(atualizado.status, 'Em andamento');
    assert.equal(atualizado.prioridade, 'Média');
    assert.equal(atualizado.tecnico, 'Ana Paula Souza');
    assert.notEqual(atualizado.data_atualizacao, chamadoCriado.data_atualizacao);
  });

  await t.test('busca chamado específico', async () => {
    const response = await request('GET', `/chamados/${chamadoCriado.id}`);
    assert.equal(response.statusCode, 200);
    assert.equal(response.json().id, chamadoCriado.id);
  });

  await t.test('exclui chamado', async () => {
    const response = await request('DELETE', `/chamados/${chamadoCriado.id}`);
    assert.equal(response.statusCode, 204);
    const busca = await request('GET', `/chamados/${chamadoCriado.id}`);
    assert.equal(busca.statusCode, 404);
  });

  let tecnicoCriado;

  await t.test('cadastra técnico', async () => {
    const response = await request('POST', '/tecnicos', {
      nome: 'Técnico de Teste',
      email: `tecnico.teste.${Date.now()}@helpdesk.test`,
      telefone: '(11) 90000-1111',
      especialidade: 'Testes',
      status: 'Ativo'
    });
    assert.equal(response.statusCode, 201);
    tecnicoCriado = response.json();
    assert.equal(tecnicoCriado.status, 'Ativo');
  });

  await t.test('rejeita técnico com e-mail duplicado', async () => {
    const response = await request('POST', '/tecnicos', {
      nome: 'Duplicado',
      email: tecnicoCriado.email,
      telefone: '(11) 90000-2222',
      especialidade: 'Testes'
    });
    assert.equal(response.statusCode, 409);
  });

  await t.test('pesquisa técnico pelo nome', async () => {
    const response = await request('GET', '/tecnicos?search=Técnico%20de%20Teste');
    assert.equal(response.statusCode, 200);
    assert.equal(response.json().length, 1);
  });

  await t.test('impede excluir técnico vinculado a chamado', async () => {
    const response = await request('DELETE', '/tecnicos/1');
    assert.equal(response.statusCode, 409);
    assert.match(response.json().error, /chamados vinculados/);
  });

  await t.test('edita e exclui técnico sem vínculo', async () => {
    const edicao = await request('PUT', `/tecnicos/${tecnicoCriado.id}`, {
      nome: 'Técnico de Teste Editado',
      status: 'Inativo'
    });
    assert.equal(edicao.statusCode, 200);
    assert.equal(edicao.json().status, 'Inativo');

    const exclusao = await request('DELETE', `/tecnicos/${tecnicoCriado.id}`);
    assert.equal(exclusao.statusCode, 204);
  });

  let categoriaCriada;

  await t.test('cadastra categoria', async () => {
    const response = await request('POST', '/categorias', {
      nome: `Categoria de Teste ${Date.now()}`,
      descricao: 'Categoria criada pelos testes automatizados.'
    });
    assert.equal(response.statusCode, 201);
    categoriaCriada = response.json();
  });

  await t.test('impede excluir categoria vinculada a chamado', async () => {
    const response = await request('DELETE', '/categorias/1');
    assert.equal(response.statusCode, 409);
    assert.match(response.json().error, /chamados vinculados/);
  });

  await t.test('edita e exclui categoria sem vínculo', async () => {
    const edicao = await request('PUT', `/categorias/${categoriaCriada.id}`, {
      nome: `${categoriaCriada.nome} Editada`,
      descricao: 'Descrição atualizada.'
    });
    assert.equal(edicao.statusCode, 200);
    assert.match(edicao.json().nome, /Editada/);

    const exclusao = await request('DELETE', `/categorias/${categoriaCriada.id}`);
    assert.equal(exclusao.statusCode, 204);
  });

  await t.test('rota inexistente retorna 404', async () => {
    const response = await request('GET', '/rota-inexistente');
    assert.equal(response.statusCode, 404);
  });

  await t.test('encerra o pool de conexões', async () => {
    await app.close();
    await closePool();
  });
});
