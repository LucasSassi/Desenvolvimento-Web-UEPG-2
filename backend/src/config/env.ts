import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  CORS_ORIGIN: z.url().default('http://localhost:5173'),
  HTTP_TIMEOUT_MS: z.coerce.number().int().min(1).max(60000).default(10000),
});

export const env = schema.parse(process.env);
