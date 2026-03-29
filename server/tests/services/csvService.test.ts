import { describe, it, expect, beforeAll } from 'vitest';
import { Readable } from 'node:stream';
import { parseCsvStream, isValidRow, loadCsv, filterByDateRange } from '../../src/services/csvService.js';

function csvToStream(content: string): Readable {
  return Readable.from([content]);
}

describe('isValidRow', () => {
  it('accepts valid date and recall', () => {
    expect(isValidRow('2020-01-01', 50)).toBe(true);
  });

  it('rejects undefined date', () => {
    expect(isValidRow(undefined, 50)).toBe(false);
  });

  it('rejects non-YYYY-MM-DD format', () => {
    expect(isValidRow('01-01-2020', 50)).toBe(false);
  });

  it('rejects invalid calendar date', () => {
    expect(isValidRow('2020-02-30', 50)).toBe(false);
  });

  it('rejects recall below 0', () => {
    expect(isValidRow('2020-01-01', -1)).toBe(false);
  });

  it('rejects recall above 100', () => {
    expect(isValidRow('2020-01-01', 101)).toBe(false);
  });

  it('rejects NaN recall', () => {
    expect(isValidRow('2020-01-01', NaN)).toBe(false);
  });

  it('rejects Infinity recall', () => {
    expect(isValidRow('2020-01-01', Infinity)).toBe(false);
  });

  it('accepts boundary values 0 and 100', () => {
    expect(isValidRow('2020-01-01', 0)).toBe(true);
    expect(isValidRow('2020-01-01', 100)).toBe(true);
  });
});

describe('parseCsvStream', () => {
  it('parses valid CSV into records', async () => {
    const csv = `date,recall\n2020-01-01 00:00:00,17.5\n2020-06-15 00:00:00,42.0\n`;
    const { records, skipped } = await parseCsvStream(csvToStream(csv));
    expect(records).toHaveLength(2);
    expect(records[0]).toEqual({ date: '2020-01-01', recall: 17.5 });
    expect(records[1]).toEqual({ date: '2020-06-15', recall: 42.0 });
    expect(skipped).toBe(0);
  });

  it('strips time component from dates', async () => {
    const csv = `date,recall\n2020-01-01 00:00:00,50\n2021-03-10 12:34:56,75\n`;
    const { records } = await parseCsvStream(csvToStream(csv));
    expect(records[0].date).toBe('2020-01-01');
    expect(records[1].date).toBe('2021-03-10');
  });

  it('skips rows with missing recall', async () => {
    const csv = `date,recall\n2020-01-01,\n2020-01-02,55.0\n`;
    const { records, skipped } = await parseCsvStream(csvToStream(csv));
    expect(records).toHaveLength(1);
    expect(records[0].date).toBe('2020-01-02');
    expect(skipped).toBe(1);
  });

  it('skips rows with non-numeric recall', async () => {
    const csv = `date,recall\n2020-01-01,bad\n2020-01-02,33.0\n`;
    const { records, skipped } = await parseCsvStream(csvToStream(csv));
    expect(records).toHaveLength(1);
    expect(skipped).toBe(1);
  });

  it('returns empty for headers-only CSV', async () => {
    const csv = `date,recall\n`;
    const { records } = await parseCsvStream(csvToStream(csv));
    expect(records).toEqual([]);
  });

  it('skips rows with out-of-range recall', async () => {
    const csv = `date,recall\n2020-01-01,150\n2020-01-02,50\n`;
    const { records, skipped } = await parseCsvStream(csvToStream(csv));
    expect(records).toHaveLength(1);
    expect(skipped).toBe(1);
  });

  it('skips rows with invalid calendar dates', async () => {
    const csv = `date,recall\n2020-02-30,50\n2020-01-01,75\n`;
    const { records, skipped } = await parseCsvStream(csvToStream(csv));
    expect(records).toHaveLength(1);
    expect(records[0].date).toBe('2020-01-01');
    expect(skipped).toBe(1);
  });
});

describe('filterByDateRange (with real CSV)', () => {
  beforeAll(async () => {
    const path = await import('node:path');
    const csvPath = path.resolve(process.cwd(), '..', 'recall_data.csv');
    await loadCsv(csvPath);
  });

  it('returns all records when no params', () => {
    const records = filterByDateRange();
    expect(records).toHaveLength(1000);
  });

  it('filters with from_ts only', () => {
    const records = filterByDateRange('2022-01-01');
    expect(records.length).toBeGreaterThan(0);
    expect(records.length).toBeLessThan(1000);
    for (const r of records) {
      expect(r.date >= '2022-01-01').toBe(true);
    }
  });

  it('filters with to_ts only', () => {
    const records = filterByDateRange(undefined, '2020-06-01');
    expect(records.length).toBeGreaterThan(0);
    expect(records.length).toBeLessThan(1000);
    for (const r of records) {
      expect(r.date <= '2020-06-01').toBe(true);
    }
  });

  it('filters with both from_ts and to_ts', () => {
    const records = filterByDateRange('2021-01-01', '2021-06-30');
    expect(records.length).toBeGreaterThan(0);
    for (const r of records) {
      expect(r.date >= '2021-01-01').toBe(true);
      expect(r.date <= '2021-06-30').toBe(true);
    }
  });

  it('returns empty array for out-of-range dates', () => {
    const records = filterByDateRange('2025-01-01', '2025-12-31');
    expect(records).toHaveLength(0);
  });

  it('handles single-day query (from_ts equals to_ts)', () => {
    const records = filterByDateRange('2020-01-01', '2020-01-01');
    expect(records).toHaveLength(1);
    expect(records[0].date).toBe('2020-01-01');
  });

  it('includes boundary dates (inclusive)', () => {
    const allRecords = filterByDateRange();
    const firstDate = allRecords[0].date;
    const lastDate = allRecords[allRecords.length - 1].date;

    const fromResult = filterByDateRange(firstDate);
    expect(fromResult[0].date).toBe(firstDate);

    const toResult = filterByDateRange(undefined, lastDate);
    expect(toResult[toResult.length - 1].date).toBe(lastDate);
  });
});
