import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearchParamsState } from '../../src/hooks/useSearchParamsState.js';

function setUrl(search: string) {
  window.history.replaceState(null, '', search || '/');
}

describe('useSearchParamsState', () => {
  beforeEach(() => {
    setUrl('/');
  });

  it('returns undefined when URL has no params', () => {
    const { result } = renderHook(() => useSearchParamsState());
    expect(result.current.fromTs).toBeUndefined();
    expect(result.current.toTs).toBeUndefined();
  });

  it('reads from_ts from URL on mount', () => {
    setUrl('/?from_ts=2020-01-01');
    const { result } = renderHook(() => useSearchParamsState());
    expect(result.current.fromTs).toBe('2020-01-01');
    expect(result.current.toTs).toBeUndefined();
  });

  it('reads to_ts from URL on mount', () => {
    setUrl('/?to_ts=2022-06-30');
    const { result } = renderHook(() => useSearchParamsState());
    expect(result.current.fromTs).toBeUndefined();
    expect(result.current.toTs).toBe('2022-06-30');
  });

  it('reads both params from URL on mount', () => {
    setUrl('/?from_ts=2020-01-01&to_ts=2021-12-31');
    const { result } = renderHook(() => useSearchParamsState());
    expect(result.current.fromTs).toBe('2020-01-01');
    expect(result.current.toTs).toBe('2021-12-31');
  });

  it('setDateRange updates state and URL', () => {
    const { result } = renderHook(() => useSearchParamsState());
    act(() => result.current.setDateRange('2021-03-01', '2021-09-30'));

    expect(result.current.fromTs).toBe('2021-03-01');
    expect(result.current.toTs).toBe('2021-09-30');

    const params = new URLSearchParams(window.location.search);
    expect(params.get('from_ts')).toBe('2021-03-01');
    expect(params.get('to_ts')).toBe('2021-09-30');
  });

  it('setDateRange with undefined clears URL params', () => {
    setUrl('/?from_ts=2020-01-01&to_ts=2022-01-01');
    const { result } = renderHook(() => useSearchParamsState());

    act(() => result.current.setDateRange(undefined, undefined));

    expect(result.current.fromTs).toBeUndefined();
    expect(result.current.toTs).toBeUndefined();
    expect(window.location.search).toBe('');
  });

  it('setDateRange with partial params updates URL correctly', () => {
    const { result } = renderHook(() => useSearchParamsState());
    act(() => result.current.setDateRange('2020-06-01', undefined));

    expect(result.current.fromTs).toBe('2020-06-01');
    expect(result.current.toTs).toBeUndefined();

    const params = new URLSearchParams(window.location.search);
    expect(params.get('from_ts')).toBe('2020-06-01');
    expect(params.has('to_ts')).toBe(false);
  });

  it('discards invalid from_ts in URL', () => {
    setUrl('/?from_ts=garbage&to_ts=2021-06-30');
    const { result } = renderHook(() => useSearchParamsState());
    expect(result.current.fromTs).toBeUndefined();
    expect(result.current.toTs).toBe('2021-06-30');
  });

  it('discards invalid calendar date in URL', () => {
    setUrl('/?from_ts=2020-02-30');
    const { result } = renderHook(() => useSearchParamsState());
    expect(result.current.fromTs).toBeUndefined();
  });

  it('discards non-date format values', () => {
    setUrl('/?from_ts=abc&to_ts=xyz');
    const { result } = renderHook(() => useSearchParamsState());
    expect(result.current.fromTs).toBeUndefined();
    expect(result.current.toTs).toBeUndefined();
  });
});
