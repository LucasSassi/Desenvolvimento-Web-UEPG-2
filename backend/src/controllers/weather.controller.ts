import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../errors/app.error.js';
import { brazilianStateSchema } from '../types/location.types.js';
import { getWeatherByCep, searchLocationsByAddress } from '../services/weather.service.js';

const cepSchema = z.string().regex(/^\d{5}-?\d{3}$/).transform((cep) => cep.replace('-', ''));

const addressSearchQuerySchema = z.object({
  uf: z.string().trim().toUpperCase().pipe(brazilianStateSchema),
  city: z.string().trim().min(3),
  street: z.string().trim().min(3),
});

export async function getWeather(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = cepSchema.safeParse(req.params.cep);
    if (!result.success) {
      throw new AppError(400, 'INVALID_CEP', 'O CEP informado é inválido.');
    }
    res.json(await getWeatherByCep(result.data));
  } catch (error: unknown) {
    next(error);
  }
}

export async function searchCep(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = addressSearchQuerySchema.safeParse(req.query);
    if (!result.success) {
      throw new AppError(
        400,
        'INVALID_ADDRESS_QUERY',
        'Informe UF válida, cidade e logradouro com pelo menos 3 caracteres.',
      );
    }
    const { uf, city, street } = result.data;
    res.json(await searchLocationsByAddress(uf, city, street));
  } catch (error: unknown) {
    next(error);
  }
}