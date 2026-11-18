import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { healthRoutes } from './routes/health.routes.js';
import { weatherRoutes } from './routes/weather.routes.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { AppError } from './errors/app.error.js';

export const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: env.CORS_ORIGIN, methods: ['GET'] }));
app.use('/api', healthRoutes, weatherRoutes);
app.use((_req, _res, next) => next(new AppError(404, 'ROUTE_NOT_FOUND', 'Rota não encontrada.')));
app.use(errorMiddleware);
