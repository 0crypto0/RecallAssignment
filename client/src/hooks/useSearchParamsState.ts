import { useCallback, useState } from 'react';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateParam(val: string | null): val is string {
  if (val === null || !DATE_REGEX.test(val)) return false;
  const d = new Date(val);
  return !isNaN(d.getTime()) && d.toISOString().startsWith(val);
}

function readParams(): { fromTs?: string; toTs?: string } {
  const params = new URLSearchParams(window.location.search);
  const rawFrom = params.get('from_ts');
  const rawTo = params.get('to_ts');
  const fromTs = isValidDateParam(rawFrom) ? rawFrom : undefined;
  const toTs = isValidDateParam(rawTo) ? rawTo : undefined;
  return { fromTs, toTs };
}

function writeParams(fromTs?: string, toTs?: string) {
  const params = new URLSearchParams();
  if (fromTs) params.set('from_ts', fromTs);
  if (toTs) params.set('to_ts', toTs);

  const query = params.toString();
  const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  window.history.replaceState(null, '', url);
}

export function useSearchParamsState() {
  const [state, setState] = useState(readParams);

  const setDateRange = useCallback((fromTs?: string, toTs?: string) => {
    writeParams(fromTs, toTs);
    setState({ fromTs, toTs });
  }, []);

  return { fromTs: state.fromTs, toTs: state.toTs, setDateRange };
}
