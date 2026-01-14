import React, { useMemo, useRef } from "react";
import { Card } from "./ui/Card";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { NoteListItem } from "./NoteListItem";
import { Spinner } from "./ui/Spinner";
import { EmptyState } from "./EmptyState";

// PUBLIC_INTERFACE
export function NotesSidebar({
  notes,
  selectedNoteId,
  searchQuery,
  setSearchQuery,
  onCreate,
  onSelect,
  loading = false,
  error = null,
}) {
  /** Sidebar with search/filter and keyboard navigable note list (listbox/option + roving tabindex). */
  const optionRefs = useRef({});

  const activeId = useMemo(() => {
    // Keep an active id for roving tabindex/focus even if selection is null.
    if (selectedNoteId && notes.some((n) => n.id === selectedNoteId)) return selectedNoteId;
    return notes[0]?.id ?? null;
  }, [notes, selectedNoteId]);

  const activeOptionDomId = activeId ? `kv-note-option-${activeId}` : undefined;

  const onListKeyDown = (e, id) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Home" && e.key !== "End") return;

    e.preventDefault();

    const idx = notes.findIndex((n) => n.id === id);
    if (idx === -1) return;

    let nextIdx = idx;
    if (e.key === "ArrowDown") nextIdx = Math.min(notes.length - 1, idx + 1);
    if (e.key === "ArrowUp") nextIdx = Math.max(0, idx - 1);
    if (e.key === "Home") nextIdx = 0;
    if (e.key === "End") nextIdx = notes.length - 1;

    const next = notes[nextIdx];
    if (!next) return;

    onSelect(next.id);

    // Ensure keyboard users get clear focus cues.
    window.requestAnimationFrame(() => {
      optionRefs.current[next.id]?.focus?.();
    });
  };

  return (
    <Card className="kv-sidebar" aria-label="Notes sidebar">
      <div className="kv-sidebar-header">
        <div className="kv-row kv-row-space">
          <h2 className="kv-sidebar-title">Notes</h2>
          <Button variant="primary" onClick={onCreate} aria-label="Create new note">
            + New
          </Button>
        </div>

        <div className="kv-sidebar-controls">
          <Input
            aria-label="Search notes"
            placeholder="Search notes…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="ghost" onClick={() => setSearchQuery("")} aria-label="Clear search">
            Clear
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 14 }}>
          <Spinner label="Loading notes" />
        </div>
      ) : error ? (
        <div style={{ padding: 14 }}>
          <EmptyState title="Could not load notes" description={String(error)} actionLabel="Retry" onAction={() => {}} />
        </div>
      ) : notes.length === 0 ? (
        <div style={{ padding: 10 }}>
          <EmptyState
            title={searchQuery ? "No matches" : "No notes yet"}
            description={
              searchQuery
                ? "Try a different search, or clear the filter."
                : "Create your first note to start writing. Notes are saved locally to this browser."
            }
            actionLabel={searchQuery ? "Clear search" : "Create a note"}
            onAction={searchQuery ? () => setSearchQuery("") : onCreate}
          />
        </div>
      ) : (
        <ul
          className="kv-list"
          role="listbox"
          aria-label="Notes list"
          aria-activedescendant={activeOptionDomId}
          tabIndex={0}
        >
          {notes.map((n) => (
            <NoteListItem
              key={n.id}
              id={`kv-note-option-${n.id}`}
              note={n}
              selected={n.id === selectedNoteId}
              onSelect={onSelect}
              onKeyDown={onListKeyDown}
              tabIndex={n.id === activeId ? 0 : -1}
              setButtonRef={(el) => {
                optionRefs.current[n.id] = el;
              }}
            />
          ))}
        </ul>
      )}
    </Card>
  );
}
