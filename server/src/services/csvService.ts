import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import Papa from 'papaparse';
import type { RecallRecord } from '../schemas/recall.js';
import logger from '../utils/logger.js';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isValidRow(dateStr: string | undefined, recallVal: number): dateStr is string {
  if (typeof dateStr !== 'string' || !DATE_REGEX.test(dateStr)) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime()) || !d.toISOString().startsWith(dateStr)) return false;
  return typeof recallVal === 'number' && isFinite(recallVal) && recallVal >= 0 && recallVal <= 100;
}

export function parseCsvStream(input: Readable): Promise<{ records: RecallRecord[]; skipped: number }> {
  return new Promise((resolve, reject) => {
    const records: RecallRecord[] = [];
    let skipped = 0;

    Papa.parse<Record<string, string>>(input, {
      header: true,
      skipEmptyLines: true,
      step(results) {
        const row = results.data;
        const dateStr = row['date']?.split(' ')[0];
        const recallVal = parseFloat(row['recall'] ?? '');

        if (isValidRow(dateStr, recallVal)) {
          records.push({ date: dateStr, recall: recallVal });
        } else {
          skipped++;
        }
      },
      complete() {
        resolve({ records, skipped });
      },
      error(err: Error) {
        reject(err);
      },
    });
  });
}

let cache: RecallRecord[] | null = null;

export async function loadCsv(csvPath: string): Promise<RecallRecord[]> {
  const startTime = Date.now();
  const stream = fs.createReadStream(csvPath, 'utf-8');
  const { records, skipped } = await parseCsvStream(stream);

  cache = records;
  const elapsed = Date.now() - startTime;
  logger.info(`CSV loaded: ${records.length} records in ${elapsed}ms`);
  if (skipped > 0) {
    logger.warn(`Skipped ${skipped} invalid CSV rows`);
  }
  if (records.length === 0) {
    logger.warn('CSV loaded with 0 valid records — all API responses will be empty');
  }
  return records;
}

export function getCache(): RecallRecord[] {
  if (!cache) {
    throw new Error('CSV not loaded. Call loadCsv() first.');
  }
  return cache;
}

function lowerBound(records: RecallRecord[], target: string): number {
  let lo = 0;
  let hi = records.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (records[mid].date < target) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}

function upperBound(records: RecallRecord[], target: string): number {
  let lo = 0;
  let hi = records.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (records[mid].date <= target) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}

export function filterByDateRange(fromTs?: string, toTs?: string): RecallRecord[] {
  const records = getCache();

  if (!fromTs && !toTs) {
    return records;
  }

  const startIdx = fromTs ? lowerBound(records, fromTs) : 0;
  const endIdx = toTs ? upperBound(records, toTs) : records.length;

  return records.slice(startIdx, endIdx);
}

export function resolveCsvPath(): string {
  const thisDir = path.dirname(new URL(import.meta.url).pathname);
  return path.resolve(thisDir, '..', '..', '..', 'recall_data.csv');
}
