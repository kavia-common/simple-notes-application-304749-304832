import { useEffect, useState } from "react";

// PUBLIC_INTERFACE
export function useLocalStorage(key, initialValue) {
  /** Persist state to localStorage with JSON serialization and safe fallback. */
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw == null) return initialValue;
      return JSON.parse(raw);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota/serialization errors; keep in-memory value
    }
  }, [key, value]);

  return [value, setValue];
}
