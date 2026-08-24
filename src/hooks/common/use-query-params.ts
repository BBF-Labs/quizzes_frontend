"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export type QueryParamValue = string | number | boolean | null | undefined;
export type QueryParamUpdates = Record<string, QueryParamValue>;

export interface SetQueryParamsOptions {
  /**
   * If true (default), replaces current history entry instead of pushing a new one.
   */
  replace?: boolean;
  /**
   * Whether to scroll to top after navigation. Default is false.
   */
  scroll?: boolean;
}

export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Convert searchParams to a key-value record for quick access
  const params = useMemo(() => {
    const record: Record<string, string> = {};
    if (!searchParams) return record;
    for (const [key, value] of searchParams.entries()) {
      record[key] = value;
    }
    return record;
  }, [searchParams]);

  // Helper to build a URL query string with updates
  const createQueryString = useCallback(
    (updates: QueryParamUpdates): string => {
      const current = new URLSearchParams(
        searchParams ? searchParams.toString() : "",
      );
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined || value === "") {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      }
      const qs = current.toString();
      return qs ? `?${qs}` : "";
    },
    [searchParams],
  );

  // Helper to generate a full URL path with updated query params
  const createUrl = useCallback(
    (updates: QueryParamUpdates): string => {
      const qs = createQueryString(updates);
      return `${pathname}${qs}`;
    },
    [pathname, createQueryString],
  );

  // Apply batch updates to query params in the URL
  const setQueryParams = useCallback(
    (updates: QueryParamUpdates, options: SetQueryParamsOptions = {}) => {
      const { replace = true, scroll = false } = options;
      const nextUrl = createUrl(updates);

      if (replace) {
        router.replace(nextUrl, { scroll });
      } else {
        router.push(nextUrl, { scroll });
      }
    },
    [router, createUrl],
  );

  // Single param updater
  const setQueryParam = useCallback(
    (key: string, value: QueryParamValue, options?: SetQueryParamsOptions) => {
      setQueryParams({ [key]: value }, options);
    },
    [setQueryParams],
  );

  // Delete specific param(s)
  const deleteQueryParam = useCallback(
    (key: string, options?: SetQueryParamsOptions) => {
      setQueryParams({ [key]: null }, options);
    },
    [setQueryParams],
  );

  const deleteQueryParams = useCallback(
    (keys: string[], options?: SetQueryParamsOptions) => {
      const updates: QueryParamUpdates = {};
      for (const key of keys) {
        updates[key] = null;
      }
      setQueryParams(updates, options);
    },
    [setQueryParams],
  );

  // Clear all query params
  const clearQueryParams = useCallback(
    (options: SetQueryParamsOptions = {}) => {
      const { replace = true, scroll = false } = options;
      if (replace) {
        router.replace(pathname, { scroll });
      } else {
        router.push(pathname, { scroll });
      }
    },
    [router, pathname],
  );

  // Safe typed getters
  const getParam = useCallback(
    (key: string, defaultValue: string = ""): string => {
      return searchParams?.get(key) ?? defaultValue;
    },
    [searchParams],
  );

  const getNumberParam = useCallback(
    (key: string, defaultValue: number = 0): number => {
      const raw = searchParams?.get(key);
      if (!raw) return defaultValue;
      const num = Number(raw);
      return isNaN(num) ? defaultValue : num;
    },
    [searchParams],
  );

  const getBoolParam = useCallback(
    (key: string, defaultValue: boolean = false): boolean => {
      const raw = searchParams?.get(key);
      if (!raw) return defaultValue;
      return raw === "true" || raw === "1";
    },
    [searchParams],
  );

  return {
    searchParams,
    params,
    pathname,
    getParam,
    getNumberParam,
    getBoolParam,
    setQueryParams,
    setQueryParam,
    deleteQueryParam,
    deleteQueryParams,
    clearQueryParams,
    createUrl,
    createQueryString,
    // Alias matching existing updateQueryParams signature for instant drop-in
    updateQueryParams: setQueryParams,
  };
}
