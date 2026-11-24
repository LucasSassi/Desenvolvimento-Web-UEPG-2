import { Router, json } from 'express';
import { createFavorite, deleteFavorite, listFavorites, updateFavorite } from '../controllers/favorite.controller.js';

export const favoriteRoutes = Router();
favoriteRoutes.use('/favorites', json({ limit: '10kb' }));
favoriteRoutes.get('/favorites', listFavorites);
favoriteRoutes.post('/favorites', createFavorite);
favoriteRoutes.patch('/favorites/:id', updateFavorite);
favoriteRoutes.delete('/favorites/:id', deleteFavorite);
