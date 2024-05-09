import axios, { AxiosError } from 'axios';
import { cloneDeep, isEqual } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';

interface FetchParams {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface FetchError {
  message: string;
  statusCode?: number;
}

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: FetchError | null;
  refetch: (params?: FetchParams) => void;
}

const requestCache = new Map();

const createCacheKey = (url: string, params?: FetchParams) =>
  JSON.stringify({ url, params: cloneDeep(params) });

const useFetch = <T = unknown>(
  url: string,
  initialParams: FetchParams = {}
): UseFetchResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FetchError | null>(null);
  const lastParams = useRef<FetchParams>(initialParams);

  const fetchData = useCallback(
    async (params: FetchParams = {}, forceRefresh: boolean = false) => {
      const key = createCacheKey(url, params);
      if (
        forceRefresh ||
        !requestCache.has(key) ||
        !isEqual(params, lastParams.current)
      ) {
        if (forceRefresh) {
          requestCache.delete(key);
        }
        lastParams.current = cloneDeep(params);
        const fetchPromise = axios
          .get<T>(url, { params })
          .then((response) => {
            requestCache.set(key, { data: response.data });
            return response.data;
          })
          .catch((err) => {
            requestCache.delete(key);
            throw err;
          });
        requestCache.set(key, { promise: fetchPromise });
      }

      try {
        setLoading(true);
        const cacheEntry = requestCache.get(key);
        const result = cacheEntry.data
          ? cacheEntry.data
          : await cacheEntry.promise;
        setData(result);
        setError(null);
      } catch (err) {
        const e = err as AxiosError;
        setError({
          message: e.message,
          statusCode: e.response?.status,
        });
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [url]
  );

  const refetch = useCallback(
    (params?: FetchParams) => {
      fetchData(params || initialParams, true);
    },
    [fetchData, initialParams]
  );

  useEffect(() => {
    fetchData(initialParams);
  }, [fetchData, initialParams]);

  return { data, loading, error, refetch };
};

export default useFetch;
