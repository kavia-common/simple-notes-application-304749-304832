import { useEffect, useMemo, useRef } from "react";
import { debounce } from "../utils/debounce";

// PUBLIC_INTERFACE
export function useDebouncedCallback(callback, waitMs) {
  /** Return a stable debounced function that calls callback after waitMs pause; cancels on unmount. */
  const cbRef = useRef(callback);
  cbRef.current = callback;

  const debounced = useMemo(() => {
    return debounce((...args) => cbRef.current(...args), waitMs);
  }, [waitMs]);

  useEffect(() => {
    return () => {
      debounced.cancel?.();
    };
  }, [debounced]);

  return debounced;
}
