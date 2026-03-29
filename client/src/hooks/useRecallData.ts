import { useQuery } from '@tanstack/react-query';
import { fetchRecallData } from '../services/recallApi.js';
import type { RecallApiResponse } from '../types/recall.js';

export function useRecallData(fromTs?: string, toTs?: string) {
  return useQuery<RecallApiResponse, Error>({
    queryKey: ['recall', fromTs, toTs],
    queryFn: () => fetchRecallData(fromTs, toTs),
  });
}
