import type { Request, Response, NextFunction } from 'express';
import { dateRangeSchema } from '../schemas/recall.js';
import { filterByDateRange } from '../services/csvService.js';
import { delay } from '../services/delayService.js';
import logger from '../utils/logger.js';

export async function getRecall(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validation = dateRangeSchema.safeParse(req.query);

    if (!validation.success) {
      const messages = validation.error.issues.map((i) => i.message).join('; ');
      logger.warn({ query: req.query, errors: validation.error.issues }, 'Invalid query params');
      res.status(400).json({
        error: `Invalid query parameters: ${messages}`,
        statusCode: 400,
      });
      return;
    }

    const { from_ts, to_ts } = validation.data;

    logger.info({ from_ts, to_ts }, 'Recall data requested');

    await delay();

    const records = filterByDateRange(from_ts, to_ts);

    logger.info({ count: records.length }, 'Returning recall records');
    res.json(records);
  } catch (err) {
    next(err);
  }
}
