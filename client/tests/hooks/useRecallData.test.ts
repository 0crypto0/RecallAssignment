import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useRecallData } from '../../src/hooks/useRecallData.js';

vi.mock('../../src/services/recallApi.js', () => ({
  fetchRecallData: vi.fn().mockResolvedValue([
    { date: '2020-01-01', recall: 50 },
    { date: '2020-01-02', recall: 75 },
  ]),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useRecallData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading state initially', () => {
    const { result } = renderHook(() => useRecallData(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('returns data after fetch', async () => {
    const { result } = renderHook(() => useRecallData(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0].date).toBe('2020-01-01');
  });

  it('uses correct query key with date params', () => {
    const { result } = renderHook(
      () => useRecallData('2020-01-01', '2020-06-01'),
      { wrapper: createWrapper() },
    );
    expect(result.current.isLoading).toBe(true);
  });
});
