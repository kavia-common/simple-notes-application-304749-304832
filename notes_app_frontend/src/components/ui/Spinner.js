import React from "react";

// PUBLIC_INTERFACE
export function Spinner({ label = "Loading" }) {
  /** Small spinner with accessible label. */
  return (
    <div className="kv-row" role="status" aria-live="polite" aria-label={label}>
      <div className="kv-spinner" />
      <span className="kv-muted" style={{ fontSize: 12 }}>
        {label}
      </span>
    </div>
  );
}
