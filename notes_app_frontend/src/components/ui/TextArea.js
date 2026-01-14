import React from "react";

// PUBLIC_INTERFACE
export function TextArea({ label, className = "", ...props }) {
  /** Reusable textarea with optional label. */
  return (
    <div className={`kv-field ${className}`.trim()}>
      {label ? <div className="kv-label">{label}</div> : null}
      <textarea className="kv-textarea kv-focus-ring" {...props} />
    </div>
  );
}
