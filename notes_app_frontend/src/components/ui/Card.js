import React from "react";

// PUBLIC_INTERFACE
export function Card({ className = "", children }) {
  /** Surface card with border + radius. */
  return <div className={`kv-panel ${className}`.trim()}>{children}</div>;
}
