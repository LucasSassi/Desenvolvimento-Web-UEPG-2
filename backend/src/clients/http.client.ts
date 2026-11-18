import { z } from 'zod';
import { env } from '../config/env.js';
import { AppError } from '../errors/app.error.js';

export async function fetchJson<T>(url: URL, schema: z.ZodType<T>, provider: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.HTTP_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      await response.body?.cancel();
      if (response.status === 429 || response.status >= 500) {
        throw new AppError(503, 'EXTERNAL_SERVICE_UNAVAILABLE', `${provider} está temporariamente indisponível.`);
      }
      throw new AppError(502, 'EXTERNAL_API_ERROR', `Falha na comunicação com ${provider}.`);
    }

    const payload: unknown = await response.json();
    const result = schema.safeParse(payload);
    if (!result.success) {
      throw new AppError(502, 'INVALID_EXTERNAL_RESPONSE', `${provider} retornou uma resposta inválida.`);
    }
    return result.data;
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;
    if (controller.signal.aborted) {
      throw new AppError(503, 'EXTERNAL_API_TIMEOUT', `${provider} excedeu o tempo limite de resposta.`);
    }
    if (error instanceof SyntaxError) {
      throw new AppError(502, 'INVALID_EXTERNAL_RESPONSE', `${provider} retornou uma resposta inválida.`);
    }
    throw new AppError(502, 'EXTERNAL_API_ERROR', `Falha na comunicação com ${provider}.`);
  } finally {
    clearTimeout(timer);
  }
}
