import React from "react";
import { renderMarkdownToHtml } from "../utils/markdown";

// PUBLIC_INTERFACE
export function NoteViewer({ title, body }) {
  /** Markdown preview panel. */
  const html = renderMarkdownToHtml(body || "");
  return (
    <div aria-label="Markdown preview">
      {title?.trim() ? <h2 style={{ margin: "0 0 10px", letterSpacing: "-0.02em" }}>{title}</h2> : null}
      <div className="kv-markdown" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
