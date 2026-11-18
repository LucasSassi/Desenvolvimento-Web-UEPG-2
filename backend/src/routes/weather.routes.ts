import { Router } from 'express';
import { getWeather } from '../controllers/weather.controller.js';

export const weatherRoutes = Router();
weatherRoutes.get('/weather/:cep', getWeather);
