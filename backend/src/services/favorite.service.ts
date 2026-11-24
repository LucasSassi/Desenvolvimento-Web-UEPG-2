import { getAddress } from '../clients/viacep.client.js';
import { AppError } from '../errors/app.error.js';
import { favoriteRepository } from '../repositories/favorite.repository.js';
import type { CreateFavorite, Favorite } from '../types/favorite.types.js';

function notFound(): AppError {
  return new AppError(404, 'FAVORITE_NOT_FOUND', 'Favorito não encontrado.');
}

export const favoriteService = {
  list: () => favoriteRepository.list(),
  async create(input: CreateFavorite): Promise<Favorite> {
    await getAddress(input.cep);
    return favoriteRepository.create(input);
  },
  async update(id: number, name: string): Promise<Favorite> {
    const favorite = await favoriteRepository.update(id, name);
    if (!favorite) throw notFound();
    return favorite;
  },
  async delete(id: number): Promise<void> {
    if (!await favoriteRepository.delete(id)) throw notFound();
  },
};
