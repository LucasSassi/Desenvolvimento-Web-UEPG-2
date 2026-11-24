import { app } from './app.js';
import { env } from './config/env.js';
import { closeDatabase } from './config/database.js';

const server = app.listen(env.PORT, () => {
  console.log(`ClimaCEP API disponível em http://localhost:${env.PORT}`);
});

server.on('error', (error: Error) => {
  console.error('Não foi possível iniciar a API:', error.message);
  process.exitCode = 1;
});

let isShuttingDown = false;
function shutdown(): void {
  if (isShuttingDown) return;
  isShuttingDown = true;
  const timeout = setTimeout(() => process.exit(1), 15000);
  timeout.unref();
  server.close(() => {
    void closeDatabase().catch((error: unknown) => {
      console.error('Não foi possível encerrar o PostgreSQL:', error);
      process.exitCode = 1;
    }).finally(() => clearTimeout(timeout));
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
