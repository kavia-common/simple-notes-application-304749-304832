import React, { useMemo } from "react";
import { formatUpdatedAt } from "../utils/datetime";
import { IconButton } from "./ui/IconButton";

function PinIcon({ filled = false }) {
  return (
    <svg className="kv-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14 3 10 7v6l-3 3v2h10v-2l-3-3V7l-4-4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill={filled ? "currentColor" : "none"}
        opacity={filled ? 0.9 : 1}
      />
    </svg>
  );
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderHighlightedText(text, query) {
  const t = text ?? "";
  const q = (query ?? "").trim();
  if (!q) return t;

  const re = new RegExp(`(${escapeRegExp(q)})`, "ig");
  const parts = t.split(re);

  return parts.map((p, i) => {
    const isMatch = p.toLowerCase() === q.toLowerCase();
    if (!isMatch) return <React.Fragment key={i}>{p}</React.Fragment>;
    return (
      <mark key={i} className="kv-highlight">
        {p}
      </mark>
    );
  });
}

/**
 * @param {{
 *  id: string,
 *  note: import("../types/note").Note,
 *  selected: boolean,
 *  onSelect: (id: string) => void,
 *  onTogglePinned?: (id: string) => void,
 *  highlightQuery?: string,
 *  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>, id: string) => void,
 *  tabIndex?: number,
 *  setButtonRef?: (el: HTMLButtonElement|null) => void
 * }} props
 */

// PUBLIC_INTERFACE
export function NoteListItem({
  id,
  note,
  selected,
  onSelect,
  onTogglePinned,
  highlightQuery = "",
  onKeyDown,
  tabIndex = -1,
  setButtonRef,
}) {
  /** Sidebar note row with title/snippet/meta and selection state (supports pin + title highlight). */
  const snippet = (note.body ?? "").trim().slice(0, 140) || "No content yet…";
  const title = (note.title ?? "").trim() || "Untitled note";

  const titleNode = useMemo(() => renderHighlightedText(title, highlightQuery), [title, highlightQuery]);

  return (
    <li role="presentation">
      <div className="kv-list-item-wrap">
        <button
          id={id}
          type="button"
          role="option"
          tabIndex={tabIndex}
          className="kv-list-item kv-focus-ring"
          aria-selected={selected}
          ref={setButtonRef}
          onClick={() => onSelect(note.id)}
          onKeyDown={(e) => onKeyDown?.(e, note.id)}
        >
          <div className="kv-note-title-row">
            <div className="kv-note-title" title={title}>
              {titleNode}
            </div>
            {note.pinned ? (
              <span className="kv-badge kv-badge-primary kv-pin-badge" aria-label="Pinned note">
                <span aria-hidden="true">📌</span> Pinned
              </span>
            ) : null}
          </div>
          <div className="kv-note-snippet">{snippet}</div>
          <div className="kv-note-meta">
            <span>Updated {formatUpdatedAt(note.updatedAt)}</span>
            {note.body?.trim() ? <span className="kv-badge kv-badge-muted">●</span> : <span />}
          </div>
        </button>

        <div className="kv-list-item-actions" aria-label="Note actions">
          <IconButton
            label={note.pinned ? "Unpin note" : "Pin note"}
            className={note.pinned ? "kv-icon-btn-primary" : ""}
            aria-pressed={!!note.pinned}
            onClick={(e) => {
              // Don't steal selection focus; keep list interactions stable.
              e.preventDefault();
              e.stopPropagation();
              onTogglePinned?.(note.id);
            }}
          >
            <PinIcon filled={!!note.pinned} />
          </IconButton>
        </div>
      </div>
    </li>
  );
}
