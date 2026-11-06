import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../services/api.js';

export default function useApiResource(path) {
  const [revision, setRevision] = useState(0);
  const [resource, setResource] = useState(null);

  useEffect(() => {
    if (!path) {
      setResource(null);
      return undefined;
    }

    const controller = new AbortController();
    setResource({ path, status: 'loading', data: null, pagination: null, error: null });

    apiFetch(path, { signal: controller.signal })
      .then((payload) => {
        setResource({
          path,
          status: 'success',
          data: payload?.data ?? null,
          pagination: Number.isInteger(payload?.page)
            ? {
              page: payload.page,
              limit: payload.limit,
              total: payload.total,
              totalPages: payload.totalPages,
            }
            : null,
          error: null,
        });
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setResource({ path, status: 'error', data: null, pagination: null, error });
        }
      });

    return () => controller.abort();
  }, [path, revision]);

  const retry = useCallback(() => {
    setResource(null);
    setRevision((current) => current + 1);
  }, []);

  const current = resource?.path === path ? resource : null;
  return {
    status: !path ? 'idle' : (current?.status ?? 'loading'),
    data: current?.data ?? null,
    pagination: current?.pagination ?? null,
    error: current?.error ?? null,
    retry,
  };
}
