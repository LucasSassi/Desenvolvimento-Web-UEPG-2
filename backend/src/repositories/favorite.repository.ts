import { database } from '../config/database.js';
import type { CreateFavorite, Favorite } from '../types/favorite.types.js';

interface FavoriteRow {
  id: number;
  cep: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

function toFavorite(row: FavoriteRow): Favorite {
  return {
    id: row.id, cep: row.cep, name: row.name,
    createdAt: row.created_at.toISOString(), updatedAt: row.updated_at.toISOString(),
  };
}

export const favoriteRepository = {
  async list(): Promise<Favorite[]> {
    const result = await database.query<FavoriteRow>(
      'SELECT id, cep, name, created_at, updated_at FROM favorites ORDER BY created_at DESC, id DESC',
    );
    return result.rows.map(toFavorite);
  },
  async create(input: CreateFavorite): Promise<Favorite> {
    const result = await database.query<FavoriteRow>(
      'INSERT INTO favorites (cep, name) VALUES ($1, $2) RETURNING id, cep, name, created_at, updated_at',
      [input.cep, input.name],
    );
    return toFavorite(result.rows[0]!);
  },
  async update(id: number, name: string): Promise<Favorite | undefined> {
    const result = await database.query<FavoriteRow>(
      'UPDATE favorites SET name = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, cep, name, created_at, updated_at',
      [id, name],
    );
    return result.rows[0] ? toFavorite(result.rows[0]) : undefined;
  },
  async delete(id: number): Promise<boolean> {
    const result = await database.query('DELETE FROM favorites WHERE id = $1', [id]);
    return result.rowCount === 1;
  },
};
