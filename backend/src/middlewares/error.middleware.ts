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
  if (typeof error === 'object' && error !== null && 'type' in error) {
    if (error.type === 'entity.parse.failed') {
      res.status(400).json({ error: { code: 'INVALID_JSON', message: 'O corpo da requisição deve ser um JSON válido.' } });
      return;
    }
    if (error.type === 'entity.too.large') {
      res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'O corpo da requisição excede o limite permitido.' } });
      return;
    }
  }
  console.error('Erro interno inesperado:', error);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Ocorreu um erro interno inesperado.' } });
};
