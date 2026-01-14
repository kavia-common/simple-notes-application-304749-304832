import React from "react";

// PUBLIC_INTERFACE
export function IconButton({ label, children, className = "", ...props }) {
  /** Icon-only button with accessible label. */
  return (
    <button
      type="button"
      className={`kv-icon-btn kv-focus-ring ${className}`.trim()}
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
    </button>
  );
}
