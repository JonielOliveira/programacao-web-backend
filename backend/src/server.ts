import app from './app';
import { APP_PORT } from './config/config';

export function startServer() {
  app.listen(APP_PORT, () => {
    console.log(`Servidor rodando na porta ${APP_PORT}`);
  });
}
