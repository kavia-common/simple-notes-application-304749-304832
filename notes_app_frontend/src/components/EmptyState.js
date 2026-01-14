import React from "react";
import { Button } from "./ui/Button";

// PUBLIC_INTERFACE
export function EmptyState({ title, description, actionLabel, onAction }) {
  /** Simple empty state panel section. */
  return (
    <div className="kv-empty">
      <div aria-hidden="true" style={{ fontSize: 22 }}>
        ✨
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      {actionLabel ? (
        <div>
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
