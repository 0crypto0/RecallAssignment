import { recallApiResponseSchema } from '../schemas/recall.js';
import type { RecallApiResponse } from '../types/recall.js';

const API_BASE = '/recall';

export async function fetchRecallData(fromTs?: string, toTs?: string): Promise<RecallApiResponse> {
  const params = new URLSearchParams();
  if (fromTs) params.set('from_ts', fromTs);
  if (toTs) params.set('to_ts', toTs);

  const queryString = params.toString();
  const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;

  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${response.status}`);
  }

  const data: unknown = await response.json();
  const parsed = recallApiResponseSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error('Invalid response format from server');
  }

  return parsed.data;
}
