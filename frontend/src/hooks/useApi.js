// src/hooks/useApi.js
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Small data-fetching hook. Deliberately dependency-free -- React Query
 * would be better (caching, dedup, devtools) but isn't in package.json,
 * and this page doesn't need it yet. If you add more data-driven pages,
 * `npm i @tanstack/react-query` and replace this file.
 *
 * The requestId guard matters: switching indicators quickly fires
 * overlapping requests, and without it a slow earlier response can
 * land after a fast later one and show the wrong chart.
 */
export function useApi(fetcher, deps, { enabled = true } = {}) {
  const [state, setState] = useState({ data: null, loading: enabled, error: null });
  const requestId = useRef(0);

  const run = useCallback(() => {
    if (!enabled) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    const id = ++requestId.current;
    setState((s) => ({ ...s, loading: true, error: null }));

    Promise.resolve()
      .then(fetcher)
      .then((data) => { if (id === requestId.current) setState({ data, loading: false, error: null }); })
      .catch((error) => { if (id === requestId.current) setState({ data: null, loading: false, error }); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  useEffect(() => { run(); }, [run]);

  return { ...state, refetch: run };
}
