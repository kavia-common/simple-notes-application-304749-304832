import React from "react";

// PUBLIC_INTERFACE
export function Input({ label, className = "", ...props }) {
  /** Reusable input with optional label. */
  return (
    <div className={`kv-field ${className}`.trim()}>
      {label ? <div className="kv-label">{label}</div> : null}
      <input className="kv-input kv-focus-ring" {...props} />
    </div>
  );
}
