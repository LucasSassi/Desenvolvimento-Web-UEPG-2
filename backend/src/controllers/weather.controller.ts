import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../errors/app.error.js';
import { getWeatherByCep } from '../services/weather.service.js';

const cepSchema = z.string().regex(/^\d{5}-?\d{3}$/).transform((cep) => cep.replace('-', ''));

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
