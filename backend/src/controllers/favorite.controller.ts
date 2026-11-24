import type { Request, Response } from 'express';
import { AppError } from '../errors/app.error.js';
import { favoriteService } from '../services/favorite.service.js';
import { createFavoriteSchema, favoriteIdSchema, updateFavoriteSchema } from '../types/favorite.types.js';

function parseId(value: unknown): number {
  const result = favoriteIdSchema.safeParse(value);
  if (!result.success) throw new AppError(400, 'INVALID_FAVORITE_ID', 'Identificador de favorito inválido.');
  return result.data;
}

export async function listFavorites(_req: Request, res: Response): Promise<void> {
  res.json(await favoriteService.list());
}

export async function createFavorite(req: Request, res: Response): Promise<void> {
  const result = createFavoriteSchema.safeParse(req.body);
  if (!result.success) {
    throw new AppError(400, 'INVALID_FAVORITE', 'Informe um CEP válido e um nome de 1 a 80 caracteres.');
  }
  res.status(201).json(await favoriteService.create(result.data));
}

export async function updateFavorite(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id);
  const result = updateFavoriteSchema.safeParse(req.body);
  if (!result.success) {
    throw new AppError(400, 'INVALID_FAVORITE', 'Informe somente um nome de 1 a 80 caracteres.');
  }
  res.json(await favoriteService.update(id, result.data.name));
}

export async function deleteFavorite(req: Request, res: Response): Promise<void> {
  await favoriteService.delete(parseId(req.params.id));
  res.status(204).end();
}
