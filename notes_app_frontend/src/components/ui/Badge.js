import React from "react";

// PUBLIC_INTERFACE
export function Badge({ variant = "muted", children }) {
  /** Small badge/pill for statuses. */
  const cls = variant === "primary" ? "kv-badge kv-badge-primary" : "kv-badge kv-badge-muted";
  return <span className={cls}>{children}</span>;
}
