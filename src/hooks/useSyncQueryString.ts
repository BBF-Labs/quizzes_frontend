"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

export function useSyncQueryString() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const setQueryString = useCallback(
    (name: string, value: string) => {
      // console.log("Updating URL param:", name, value);
      router.push(pathname + "?" + createQueryString(name, value));
    },
    [router, pathname, createQueryString]
  );

  return {
    searchParams,
    setQueryString,
    getParam: (name: string) => searchParams.get(name) || "",
  };
}
