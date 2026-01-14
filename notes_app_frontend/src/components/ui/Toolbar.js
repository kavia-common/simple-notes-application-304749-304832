import React from "react";

// PUBLIC_INTERFACE
export function Toolbar({ left, right }) {
  /** Panel toolbar row. */
  return (
    <div className="kv-toolbar">
      <div className="kv-toolbar-left">{left}</div>
      <div className="kv-toolbar-right">{right}</div>
    </div>
  );
}
