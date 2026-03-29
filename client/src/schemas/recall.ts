import { z } from 'zod';

function isValidCalendarDate(val: string): boolean {
  const d = new Date(val);
  return !isNaN(d.getTime()) && d.toISOString().startsWith(val);
}

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine(isValidCalendarDate, 'Date must be a valid calendar date');

export const recallRecordSchema = z.object({
  date: dateStringSchema,
  recall: z.number().min(0).max(100).finite(),
});

export const dateRangeSchema = z
  .object({
    from_ts: dateStringSchema.optional(),
    to_ts: dateStringSchema.optional(),
  })
  .refine(
    (data) => !(data.to_ts && !data.from_ts),
    { message: 'to_ts requires from_ts to be provided' },
  )
  .refine(
    (data) => {
      if (data.from_ts && data.to_ts) {
        return data.from_ts <= data.to_ts;
      }
      return true;
    },
    { message: 'from_ts must be on or before to_ts' },
  );

export const recallApiResponseSchema = z.array(recallRecordSchema);
