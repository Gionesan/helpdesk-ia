import * as tecnicos from '../controllers/tecnicosController.js';

export default async function tecnicosRoutes(app) {
  app.get('/tecnicos', tecnicos.listar);
  app.get('/tecnicos/:id', tecnicos.buscar);
  app.post('/tecnicos', tecnicos.criar);
  app.put('/tecnicos/:id', tecnicos.atualizar);
  app.delete('/tecnicos/:id', tecnicos.excluir);
}
