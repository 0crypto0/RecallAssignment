import type { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error({ err }, 'Unhandled error');

  const statusCode = 500;
  res.status(statusCode).json({
    error: 'Internal server error',
    statusCode,
  });
}
