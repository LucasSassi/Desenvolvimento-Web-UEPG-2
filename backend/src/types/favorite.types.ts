import { z } from 'zod';

export const favoriteNameSchema = z.string().trim().min(1).max(80);
export const createFavoriteSchema = z.object({
  cep: z.string().regex(/^\d{5}-?\d{3}$/).transform((cep) => cep.replace('-', '')),
  name: favoriteNameSchema,
}).strict();
export const updateFavoriteSchema = z.object({ name: favoriteNameSchema }).strict();
export const favoriteIdSchema = z.string().regex(/^[1-9]\d*$/)
  .transform(Number).pipe(z.number().int().positive().max(2147483647));

export interface Favorite {
  id: number;
  cep: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateFavorite = z.infer<typeof createFavoriteSchema>;
