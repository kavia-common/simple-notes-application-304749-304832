import React from "react";

// PUBLIC_INTERFACE
export function Button({ variant = "default", children, className = "", ...props }) {
  /** Reusable button with Ocean theme variants. */
  const variantClass =
    variant === "primary"
      ? "kv-btn kv-btn-primary"
      : variant === "danger"
        ? "kv-btn kv-btn-danger"
        : variant === "ghost"
          ? "kv-btn kv-btn-ghost"
          : "kv-btn";

  return (
    <button className={`${variantClass} kv-focus-ring ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
