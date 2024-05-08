import axios, { AxiosError } from 'axios';
import isEqual from 'lodash/isEqual';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseFetchOptions {
  manual?: boolean;
}

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

const useFetch = <T = unknown>(
  url: string,
  initialParams: FetchParams,
  options: UseFetchOptions = {}
): UseFetchResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<FetchError | null>(null);
  const lastParams = useRef<FetchParams | null>(null);
  const cancelTokenSource = useRef(axios.CancelToken.source());

  const fetchData = useCallback(
    async (params: FetchParams) => {
      if (!isEqual(params, lastParams.current) || options.manual) {
        setLoading(true);
        setError(null);
        cancelTokenSource.current.cancel('new request - component unmount');
        cancelTokenSource.current = axios.CancelToken.source();

        try {
          const response = await axios.get<T>(url, {
            params,
            cancelToken: cancelTokenSource.current.token,
          });

          setData(response.data);

          lastParams.current = params;
        } catch (err) {
          if (!axios.isCancel(err)) {
            const e = err as AxiosError;
            setError({
              message: e.message,
              statusCode: e.response?.status,
            });
            setData(null);
          }
        } finally {
          setLoading(false);
        }
      }
    },
    [url, options.manual]
  );

  useEffect(() => {
    if (!options.manual) fetchData(initialParams);

    return () => cancelTokenSource.current.cancel('Component unmounted');
  }, [fetchData, initialParams, options.manual]);

  const refetch = useCallback(
    (params: FetchParams = initialParams) => {
      fetchData(params);
    },
    [fetchData, initialParams]
  );

  return { data, loading, error, refetch };
};

export default useFetch;
