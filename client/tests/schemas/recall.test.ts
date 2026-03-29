import { describe, it, expect } from 'vitest';
import { recallRecordSchema, dateRangeSchema, recallApiResponseSchema } from '../../src/schemas/recall.js';

describe('client recallRecordSchema', () => {
  it('validates correct record', () => {
    expect(recallRecordSchema.safeParse({ date: '2020-01-01', recall: 42.5 }).success).toBe(true);
  });

  it('rejects invalid date', () => {
    expect(recallRecordSchema.safeParse({ date: 'bad', recall: 42.5 }).success).toBe(false);
  });

  it('rejects out-of-range recall', () => {
    expect(recallRecordSchema.safeParse({ date: '2020-01-01', recall: -5 }).success).toBe(false);
    expect(recallRecordSchema.safeParse({ date: '2020-01-01', recall: 150 }).success).toBe(false);
  });

  it('rejects invalid calendar dates', () => {
    expect(recallRecordSchema.safeParse({ date: '2020-02-30', recall: 50 }).success).toBe(false);
    expect(recallRecordSchema.safeParse({ date: '2020-13-01', recall: 50 }).success).toBe(false);
  });
});

describe('client dateRangeSchema', () => {
  it('validates empty params', () => {
    expect(dateRangeSchema.safeParse({}).success).toBe(true);
  });

  it('validates with only from_ts', () => {
    expect(dateRangeSchema.safeParse({ from_ts: '2020-01-01' }).success).toBe(true);
  });

  it('rejects to_ts without from_ts', () => {
    expect(dateRangeSchema.safeParse({ to_ts: '2022-01-01' }).success).toBe(false);
  });

  it('rejects from_ts > to_ts', () => {
    expect(dateRangeSchema.safeParse({ from_ts: '2022-01-01', to_ts: '2020-01-01' }).success).toBe(false);
  });

  it('rejects invalid calendar dates in range params', () => {
    expect(dateRangeSchema.safeParse({ from_ts: '2020-02-30' }).success).toBe(false);
    expect(dateRangeSchema.safeParse({ to_ts: '2020-13-01' }).success).toBe(false);
  });
});

describe('client recallApiResponseSchema', () => {
  it('validates array of records', () => {
    const data = [{ date: '2020-01-01', recall: 50 }];
    expect(recallApiResponseSchema.safeParse(data).success).toBe(true);
  });

  it('validates empty array', () => {
    expect(recallApiResponseSchema.safeParse([]).success).toBe(true);
  });
});
