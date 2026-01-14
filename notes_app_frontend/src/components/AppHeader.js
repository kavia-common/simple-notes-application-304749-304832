import React from "react";

// PUBLIC_INTERFACE
export function AppHeader({ right }) {
  /** Top application header bar. */
  return (
    <header className="kv-header">
      <div className="kv-header-inner">
        <div className="kv-brand">
          <div className="kv-logo-dot" aria-hidden="true" />
          <div style={{ minWidth: 0 }}>
            <h1 className="kv-title">Ocean Notes</h1>
            <p className="kv-subtitle">Fast, local, and clean.</p>
          </div>
        </div>
        <div className="kv-row" style={{ justifyContent: "flex-end" }}>
          {right}
        </div>
      </div>
    </header>
  );
}
