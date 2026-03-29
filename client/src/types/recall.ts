import { z } from 'zod';

import { recallRecordSchema, dateRangeSchema, recallApiResponseSchema } from '../schemas/recall.js';

export type RecallRecord = z.infer<typeof recallRecordSchema>;
export type DateRangeFilter = z.infer<typeof dateRangeSchema>;
export type RecallApiResponse = z.infer<typeof recallApiResponseSchema>;
