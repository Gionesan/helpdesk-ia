import * as categorias from '../controllers/categoriasController.js';

export default async function categoriasRoutes(app) {
  app.get('/categorias', categorias.listar);
  app.get('/categorias/:id', categorias.buscar);
  app.post('/categorias', categorias.criar);
  app.put('/categorias/:id', categorias.atualizar);
  app.delete('/categorias/:id', categorias.excluir);
}
