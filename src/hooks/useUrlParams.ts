import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

export const useUrlParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getParam = useCallback((key: string): string | null => {
    return searchParams.get(key);
  }, [searchParams]);

  const setParam = useCallback((key: string, value: string | null) => {
    if (value === null || value === '') {
      searchParams.delete(key);
    } else {
      searchParams.set(key, value);
    }
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  const setParams = useCallback((params: Record<string, string | null>) => {
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === '') {
        searchParams.delete(key);
      } else {
        searchParams.set(key, value);
      }
    });
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  const clearParam = useCallback((key: string) => {
    searchParams.delete(key);
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  const clearAllParams = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  return {
    getParam,
    setParam,
    setParams,
    clearParam,
    clearAllParams,
    searchParams
  };
}; 