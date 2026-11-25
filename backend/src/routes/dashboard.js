import * as dashboard from '../controllers/dashboardController.js';

export default async function dashboardRoutes(app) {
  app.get('/dashboard', dashboard.obter);
}
