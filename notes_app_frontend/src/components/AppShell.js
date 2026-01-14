import React from "react";

// PUBLIC_INTERFACE
export function AppShell({ header, sidebar, main }) {
  /** App layout: header + 2-column content (responsive). */
  return (
    <div className="kv-app kv-gradient-bg">
      <div className="kv-shell">
        {header}
        <main className="kv-main" aria-label="Notes application">
          {sidebar}
          {main}
        </main>
      </div>
    </div>
  );
}
