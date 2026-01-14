import React, { useEffect, useRef } from "react";

// PUBLIC_INTERFACE
export function Modal({ open, title, children, footer, onClose }) {
  /** Accessible modal dialog with overlay and Escape-to-close. */
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);
    window.setTimeout(() => dialogRef.current?.focus?.(), 0);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="kv-modal-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className="kv-modal kv-focus-ring"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className="kv-modal-header">
          <h2 className="kv-modal-title">{title}</h2>
        </div>
        <div className="kv-modal-body">{children}</div>
        {footer ? <div className="kv-modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}
