import { useCallback, useMemo, useState } from "react";
import { uuidV4 } from "../utils/uuid";

/**
 * @typedef {"info"|"success"|"error"} ToastKind
 * @typedef {Object} Toast
 * @property {string} id
 * @property {ToastKind} kind
 * @property {string} title
 * @property {string} [description]
 * @property {number} createdAt
 */

// PUBLIC_INTERFACE
export function useToasts() {
  /** Create/remove toasts for small UX feedback (saved, deleted, errors). */
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((toast) => {
    const id = uuidV4();
    const createdAt = Date.now();
    const next = { id, createdAt, kind: "info", ...toast };
    setToasts((prev) => [next, ...prev].slice(0, 5));

    // Auto-dismiss
    const ttl = next.kind === "error" ? 6000 : 3500;
    window.setTimeout(() => removeToast(id), ttl);

    return id;
  }, [removeToast]);

  return useMemo(
    () => ({
      toasts,
      pushToast,
      removeToast,
    }),
    [toasts, pushToast, removeToast]
  );
}
