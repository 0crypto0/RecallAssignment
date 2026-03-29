import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { recallRouter } from './routes/recall.js';

export function createApp(): express.Express {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);

  app.use('/recall', recallRouter);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found', statusCode: 404 });
  });

  app.use(errorHandler);

  return app;
}
