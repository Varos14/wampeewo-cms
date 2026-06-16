import { useState, useEffect, useCallback } from 'react';

interface UseApiResult<T, Args extends any[]> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: Args) => Promise<T>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export function useApi<T, Args extends any[]>(
  apiFunction: (...args: Args) => Promise<T>,
  immediate = true,
  initialArgs?: Args
): UseApiResult<T, Args> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: Args): Promise<T> => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFunction(...args);
        setData(result);
        setLoading(false);
        return result;
      } catch (err) {
        const parsedError = err instanceof Error ? err : new Error(String(err));
        setError(parsedError);
        setLoading(false);
        throw parsedError;
      }
    },
    [apiFunction]
  );

  useEffect(() => {
    if (immediate) {
      const args = initialArgs || ([] as unknown as Args);
      execute(...args).catch(() => {}); // Error is already handled inside execute
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, immediate]);

  return { data, loading, error, execute, setData };
}
