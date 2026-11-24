import { Router } from 'express';
import { getWeather, searchCep } from '../controllers/weather.controller.js';

export const weatherRoutes = Router();
weatherRoutes.get('/weather/cep/search', searchCep);
weatherRoutes.get('/weather/:cep', getWeather);