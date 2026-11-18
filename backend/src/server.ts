import { app } from './app.js';
import { env } from './config/env.js';

const server = app.listen(env.PORT, () => {
  console.log(`ClimaCEP API disponível em http://localhost:${env.PORT}`);
});

server.on('error', (error: Error) => {
  console.error('Não foi possível iniciar a API:', error.message);
  process.exitCode = 1;
});
