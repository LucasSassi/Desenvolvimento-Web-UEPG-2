import { Pool, type QueryResultRow } from 'pg';
import { env } from './env.js';
import { AppError } from '../errors/app.error.js';

let pool: Pool | undefined;

function getPool(): Pool {
  if (!env.DATABASE_URL) {
    throw new AppError(503, 'DATABASE_UNAVAILABLE', 'O serviço de favoritos está indisponível.');
  }
  if (!pool) {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      connectionTimeoutMillis: 5000,
      query_timeout: 10000,
      max: 10,
    });
    pool.on('error', (error) => console.error('Erro na conexão ociosa do PostgreSQL:', error));
  }
  return pool;
}

export const database = {
  async query<T extends QueryResultRow>(sql: string, values: unknown[] = []) {
    try {
      return await getPool().query<T>(sql, values);
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
        throw new AppError(409, 'FAVORITE_ALREADY_EXISTS', 'Este CEP já está nos favoritos.');
      }
      console.error('Falha ao acessar favoritos no PostgreSQL:', error);
      throw new AppError(503, 'DATABASE_UNAVAILABLE', 'O serviço de favoritos está indisponível.');
    }
  },
};

export async function closeDatabase(): Promise<void> {
  const currentPool = pool;
  pool = undefined;
  await currentPool?.end();
}
