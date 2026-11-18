import type { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/app.error.js';

export const errorMiddleware: ErrorRequestHandler = (error: unknown, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: { code: error.code, message: error.message } });
    return;
  }
  console.error('Erro interno inesperado:', error);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Ocorreu um erro interno inesperado.' } });
};
