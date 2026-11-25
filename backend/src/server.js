import Fastify from 'fastify';
import cors from '@fastify/cors';
import { checkConnection, closePool } from './database/index.js';
import chamadosRoutes from './routes/chamados.js';
import tecnicosRoutes from './routes/tecnicos.js';
import categoriasRoutes from './routes/categorias.js';
import dashboardRoutes from './routes/dashboard.js';

export async function buildApp({ logger = false } = {}) {
  const app = Fastify({ logger });

  const origins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  await app.register(cors, {
    origin: origins.length === 1 ? origins[0] : origins
  });

  app.get('/health', async () => ({ status: 'ok' }));

  app.get('/', async () => ({
    nome: 'Help Desk API',
    versao: '1.0.0',
    documentacao: 'Rotas: /chamados, /tecnicos, /categorias, /dashboard'
  }));

  await app.register(chamadosRoutes);
  await app.register(tecnicosRoutes);
  await app.register(categoriasRoutes);
  await app.register(dashboardRoutes);

  app.setNotFoundHandler(async (_request, reply) => {
    return reply.code(404).send({ error: 'Rota não encontrada.' });
  });

  app.setErrorHandler(async (error, request, reply) => {
    if (error.statusCode && error.statusCode < 500) {
      return reply.code(error.statusCode).send({ error: error.message });
    }
    request.log.error(error);
    return reply.code(500).send({ error: 'Erro interno do servidor.' });
  });

  return app;
}

async function start() {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  const app = await buildApp({ logger: true });

  try {
    await checkConnection();
    app.log.info('Conexão com o banco de dados estabelecida.');
  } catch (error) {
    app.log.error('Não foi possível conectar ao banco de dados: %s', error.message);
  }

  const port = Number(process.env.PORT || 3333);

  try {
    await app.listen({ port, host: '0.0.0.0' });
  } catch (error) {
    app.log.error(error);
    await closePool();
    process.exit(1);
  }

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, async () => {
      await app.close();
      await closePool();
      process.exit(0);
    });
  }
}

start();
