import React from "react";
import { formatUpdatedAt } from "../utils/datetime";

/**
 * @param {{
 *  note: import("../types/note").Note,
 *  selected: boolean,
 *  onSelect: (id: string) => void,
 *  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>, id: string) => void
 * }} props
 */

// PUBLIC_INTERFACE
export function NoteListItem({ note, selected, onSelect, onKeyDown }) {
  /** Sidebar note row with title/snippet/meta and selection state. */
  const snippet = (note.body ?? "").trim().slice(0, 140) || "No content yet…";
  const title = (note.title ?? "").trim() || "Untitled note";

  return (
    <li>
      <button
        type="button"
        className="kv-list-item kv-focus-ring"
        aria-selected={selected}
        onClick={() => onSelect(note.id)}
        onKeyDown={(e) => onKeyDown?.(e, note.id)}
      >
        <div className="kv-note-title">{title}</div>
        <div className="kv-note-snippet">{snippet}</div>
        <div className="kv-note-meta">
          <span>Updated {formatUpdatedAt(note.updatedAt)}</span>
          {note.body?.trim() ? <span className="kv-badge kv-badge-muted">●</span> : <span />}
        </div>
      </button>
    </li>
  );
}
