import React, { useId } from "react";

// PUBLIC_INTERFACE
export function Input({ label, className = "", id, ...props }) {
  /** Reusable input with optional label (programmatically associated via htmlFor/id). */
  const autoId = useId();
  const inputId = id ?? `kv-input-${autoId}`;

  return (
    <div className={`kv-field ${className}`.trim()}>
      {label ? (
        <label className="kv-label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input id={inputId} className="kv-input kv-focus-ring" {...props} />
    </div>
  );
}
