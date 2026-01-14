import React from "react";
import { IconButton } from "./IconButton";

function kindLabel(kind) {
  if (kind === "success") return "Success";
  if (kind === "error") return "Error";
  return "Info";
}

function iconForKind(kind) {
  if (kind === "success") return "✓";
  if (kind === "error") return "!";
  return "i";
}

// PUBLIC_INTERFACE
export function ToastRegion({ toasts, onDismiss }) {
  /** Render toasts (aria-live) in bottom-right region. */
  return (
    <div className="kv-toast-region" aria-live="polite" aria-relevant="additions removals">
      {toasts.map((t) => (
        <div key={t.id} className="kv-toast" role="status" aria-label={`${kindLabel(t.kind)}: ${t.title}`}>
          <div className="kv-toast-title">
            <span>
              <span className="kv-kbd" aria-hidden="true" style={{ marginRight: 8 }}>
                {iconForKind(t.kind)}
              </span>
              {t.title}
            </span>
            <IconButton label="Dismiss notification" onClick={() => onDismiss(t.id)}>
              <span className="kv-icon" aria-hidden="true">
                ×
              </span>
            </IconButton>
          </div>
          {t.description ? <div className="kv-toast-desc">{t.description}</div> : null}
        </div>
      ))}
    </div>
  );
}
