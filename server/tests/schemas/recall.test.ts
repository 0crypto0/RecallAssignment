import { describe, it, expect } from 'vitest';
import { recallRecordSchema, dateRangeSchema, recallApiResponseSchema } from '../../src/schemas/recall.js';

describe('recallRecordSchema', () => {
  it('validates a correct record', () => {
    const result = recallRecordSchema.safeParse({ date: '2020-01-01', recall: 50.5 });
    expect(result.success).toBe(true);
  });

  it('rejects invalid date format', () => {
    const result = recallRecordSchema.safeParse({ date: '01-01-2020', recall: 50 });
    expect(result.success).toBe(false);
  });

  it('rejects date with time component', () => {
    const result = recallRecordSchema.safeParse({ date: '2020-01-01 00:00:00', recall: 50 });
    expect(result.success).toBe(false);
  });

  it('rejects recall below 0', () => {
    const result = recallRecordSchema.safeParse({ date: '2020-01-01', recall: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects recall above 100', () => {
    const result = recallRecordSchema.safeParse({ date: '2020-01-01', recall: 101 });
    expect(result.success).toBe(false);
  });

  it('rejects non-finite recall', () => {
    const result = recallRecordSchema.safeParse({ date: '2020-01-01', recall: Infinity });
    expect(result.success).toBe(false);
  });

  it('rejects invalid calendar date like 2020-02-30', () => {
    const result = recallRecordSchema.safeParse({ date: '2020-02-30', recall: 50 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid calendar date like 2020-13-01', () => {
    const result = recallRecordSchema.safeParse({ date: '2020-13-01', recall: 50 });
    expect(result.success).toBe(false);
  });

  it('accepts boundary values 0 and 100', () => {
    expect(recallRecordSchema.safeParse({ date: '2020-01-01', recall: 0 }).success).toBe(true);
    expect(recallRecordSchema.safeParse({ date: '2020-01-01', recall: 100 }).success).toBe(true);
  });

  it('rejects missing fields', () => {
    expect(recallRecordSchema.safeParse({ date: '2020-01-01' }).success).toBe(false);
    expect(recallRecordSchema.safeParse({ recall: 50 }).success).toBe(false);
    expect(recallRecordSchema.safeParse({}).success).toBe(false);
  });
});

describe('dateRangeSchema', () => {
  it('validates with both params', () => {
    const result = dateRangeSchema.safeParse({ from_ts: '2020-01-01', to_ts: '2020-12-31' });
    expect(result.success).toBe(true);
  });

  it('validates with only from_ts', () => {
    const result = dateRangeSchema.safeParse({ from_ts: '2020-01-01' });
    expect(result.success).toBe(true);
  });

  it('rejects to_ts without from_ts', () => {
    const result = dateRangeSchema.safeParse({ to_ts: '2020-12-31' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes('to_ts requires from_ts'))).toBe(true);
    }
  });

  it('validates with no params', () => {
    const result = dateRangeSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejects from_ts after to_ts', () => {
    const result = dateRangeSchema.safeParse({ from_ts: '2021-01-01', to_ts: '2020-01-01' });
    expect(result.success).toBe(false);
  });

  it('accepts equal from_ts and to_ts', () => {
    const result = dateRangeSchema.safeParse({ from_ts: '2020-06-15', to_ts: '2020-06-15' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid date format', () => {
    const result = dateRangeSchema.safeParse({ from_ts: 'not-a-date' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid calendar dates in range params', () => {
    expect(dateRangeSchema.safeParse({ from_ts: '2020-02-30' }).success).toBe(false);
    expect(dateRangeSchema.safeParse({ to_ts: '2020-13-01' }).success).toBe(false);
  });
});

describe('recallApiResponseSchema', () => {
  it('validates an array of records', () => {
    const result = recallApiResponseSchema.safeParse([
      { date: '2020-01-01', recall: 50 },
      { date: '2020-01-02', recall: 75.5 },
    ]);
    expect(result.success).toBe(true);
  });

  it('validates empty array', () => {
    const result = recallApiResponseSchema.safeParse([]);
    expect(result.success).toBe(true);
  });

  it('rejects array with invalid record', () => {
    const result = recallApiResponseSchema.safeParse([
      { date: '2020-01-01', recall: 50 },
      { date: 'bad', recall: 50 },
    ]);
    expect(result.success).toBe(false);
  });
});
