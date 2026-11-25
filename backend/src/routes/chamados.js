import * as chamados from '../controllers/chamadosController.js';

export default async function chamadosRoutes(app) {
  app.get('/chamados', chamados.listar);
  app.get('/chamados/:id', chamados.buscar);
  app.post('/chamados', chamados.criar);
  app.put('/chamados/:id', chamados.atualizar);
  app.delete('/chamados/:id', chamados.excluir);
}
