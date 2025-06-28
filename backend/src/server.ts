import app from './app';
import { APP_HOST, APP_PORT } from './config/config';

export function startServer() {
  app.listen(APP_PORT, APP_HOST, () => {
    console.log(`Servidor rodando em http://${APP_HOST}:${APP_PORT}`);
  });
}
