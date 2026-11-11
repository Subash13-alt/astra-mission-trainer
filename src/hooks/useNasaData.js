import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Load NASA data with loading, error and retry handling.
 * `loader` is a function returning a { items, source, ... } result and never throws.
 */
export function useNasaData(loader, deps = []) {
  const [state, setState] = useState({ loading: true, result: null });
  const alive = useRef(true);

  const run = useCallback(
    (force = false) => {
      setState((s) => ({ ...s, loading: true }));
      loader({ force })
        .then((result) => alive.current && setState({ loading: false, result }))
        .catch((err) =>
          alive.current &&
          setState({
            loading: false,
            result: { items: [], source: 'archived', error: err?.message || 'Something went wrong.' },
          }),
        );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps,
  );

  useEffect(() => {
    alive.current = true;
    run(false);
    return () => {
      alive.current = false;
    };
  }, [run]);

  return { ...state, retry: () => run(true) };
}
