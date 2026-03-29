import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';

const MOCK_DATA = [
  { date: '2020-01-01', recall: 17.5 },
  { date: '2020-06-15', recall: 42.0 },
  { date: '2021-03-10', recall: 88.3 },
  { date: '2022-11-20', recall: 5.1 },
];

vi.mock('../../src/services/csvService.js', () => {
  function lowerBound(target: string): number {
    let lo = 0;
    let hi = MOCK_DATA.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (MOCK_DATA[mid].date < target) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  function upperBound(target: string): number {
    let lo = 0;
    let hi = MOCK_DATA.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (MOCK_DATA[mid].date <= target) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  return {
    loadCsv: vi.fn().mockResolvedValue(MOCK_DATA),
    getCache: vi.fn(() => MOCK_DATA),
    filterByDateRange: vi.fn((fromTs?: string, toTs?: string) => {
      if (!fromTs && !toTs) return MOCK_DATA;
      const start = fromTs ? lowerBound(fromTs) : 0;
      const end = toTs ? upperBound(toTs) : MOCK_DATA.length;
      return MOCK_DATA.slice(start, end);
    }),
    resolveCsvPath: vi.fn(() => '/fake/path'),
    parseCsvStream: vi.fn(),
    isValidRow: vi.fn(),
  };
});

vi.mock('../../src/services/delayService.js', () => ({
  delay: () => Promise.resolve(),
}));

let app: import('express').Express;

beforeAll(async () => {
  const { createApp } = await import('../../src/app.js');
  app = createApp();
});

describe('GET /recall', () => {
  it('returns all records with no params', async () => {
    const res = await request(app).get('/recall');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(4);
  });

  it('returns filtered records with from_ts', async () => {
    const res = await request(app).get('/recall?from_ts=2021-01-01');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    for (const record of res.body) {
      expect(record.date >= '2021-01-01').toBe(true);
    }
  });

  it('returns 400 for to_ts without from_ts', async () => {
    const res = await request(app).get('/recall?to_ts=2020-06-15');
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('to_ts requires from_ts');
  });

  it('returns filtered records with both params', async () => {
    const res = await request(app).get('/recall?from_ts=2020-06-01&to_ts=2021-12-31');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    for (const record of res.body) {
      expect(record.date >= '2020-06-01').toBe(true);
      expect(record.date <= '2021-12-31').toBe(true);
    }
  });

  it('returns empty array for out-of-range dates', async () => {
    const res = await request(app).get('/recall?from_ts=2025-01-01&to_ts=2025-12-31');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns 400 for invalid date format', async () => {
    const res = await request(app).get('/recall?from_ts=not-a-date');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body).toHaveProperty('statusCode', 400);
  });

  it('returns 400 when from_ts > to_ts', async () => {
    const res = await request(app).get('/recall?from_ts=2022-01-01&to_ts=2020-01-01');
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('from_ts must be on or before to_ts');
  });

  it('response records have correct shape', async () => {
    const res = await request(app).get('/recall?from_ts=2020-01-01&to_ts=2020-01-05');
    expect(res.status).toBe(200);
    for (const record of res.body) {
      expect(record).toHaveProperty('date');
      expect(record).toHaveProperty('recall');
      expect(record.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof record.recall).toBe('number');
    }
  });

  it('returns 400 for invalid calendar dates', async () => {
    const res = await request(app).get('/recall?from_ts=2020-02-30');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('Unknown routes', () => {
  it('returns JSON 404 for unknown paths', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found', statusCode: 404 });
  });
});
