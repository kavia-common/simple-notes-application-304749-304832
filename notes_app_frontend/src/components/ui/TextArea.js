import React, { useId } from "react";

// PUBLIC_INTERFACE
export function TextArea({ label, className = "", id, ...props }) {
  /** Reusable textarea with optional label (programmatically associated via htmlFor/id). */
  const autoId = useId();
  const textareaId = id ?? `kv-textarea-${autoId}`;

  return (
    <div className={`kv-field ${className}`.trim()}>
      {label ? (
        <label className="kv-label" htmlFor={textareaId}>
          {label}
        </label>
      ) : null}
      <textarea id={textareaId} className="kv-textarea kv-focus-ring" {...props} />
    </div>
  );
}
