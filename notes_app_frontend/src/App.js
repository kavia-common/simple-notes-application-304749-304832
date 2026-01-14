import React, { useEffect, useMemo, useState } from "react";
import "./index.css";

import { AppHeader } from "./components/AppHeader";
import { AppShell } from "./components/AppShell";
import { NotesSidebar } from "./components/NotesSidebar";
import { NoteEditor } from "./components/NoteEditor";
import { ConfirmDeleteModal } from "./components/ConfirmDeleteModal";
import { ToastRegion } from "./components/ui/ToastRegion";
import { Button } from "./components/ui/Button";

import { useNotes } from "./hooks/useNotes";
import { useDebouncedCallback } from "./hooks/useDebouncedCallback";
import { useToasts } from "./hooks/useToasts";

/**
 * Future extension: base URL for an API (currently unused, no backend required).
 * This keeps env handling ready for later without coupling UI to a backend.
 */
const API_BASE = process.env.REACT_APP_API_BASE || "";

// PUBLIC_INTERFACE
function App() {
  /** Ocean Notes: local-first notes app with sidebar + editor and autosave. */
  // eslint-disable-next-line no-unused-vars
  const unusedApiBaseForFuture = API_BASE;

  const { sortedNotes, createNote, updateNote, deleteNote, getNoteById, searchNotes } = useNotes();
  const { toasts, pushToast, removeToast } = useToasts();

  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [savingState, setSavingState] = useState("idle"); // "idle" | "saving" | "saved"
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Select first note by default (or keep selection if still exists)
  useEffect(() => {
    if (!sortedNotes.length) {
      setSelectedNoteId(null);
      return;
    }
    if (selectedNoteId && sortedNotes.some((n) => n.id === selectedNoteId)) return;
    setSelectedNoteId(sortedNotes[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedNotes]);

  const filteredNotes = useMemo(() => searchNotes(searchQuery), [searchNotes, searchQuery]);
  const selectedNote = useMemo(() => (selectedNoteId ? getNoteById(selectedNoteId) : null), [selectedNoteId, getNoteById]);

  const debouncedMarkSaved = useDebouncedCallback(() => {
    setSavingState("saved");
  }, 350);

  const debouncedSave = useDebouncedCallback((id, patch) => {
    setSavingState("saving");
    updateNote(id, patch);
    debouncedMarkSaved();
  }, 450);

  const onCreate = () => {
    const n = createNote();
    setSelectedNoteId(n.id);
    setSearchQuery("");
    setSavingState("idle");
    pushToast({ kind: "success", title: "Note created", description: "Your new note is ready." });
  };

  const onChangeTitle = (nextTitle) => {
    if (!selectedNoteId) return;
    setSavingState("idle");
    debouncedSave(selectedNoteId, { title: nextTitle });
  };

  const onChangeBody = (nextBody) => {
    if (!selectedNoteId) return;
    setSavingState("idle");
    debouncedSave(selectedNoteId, { body: nextBody });
  };

  const onRequestDelete = () => {
    if (!selectedNote) return;
    setConfirmDeleteOpen(true);
  };

  const onConfirmDelete = () => {
    if (!selectedNote) return;
    const title = selectedNote.title?.trim() || "Untitled note";
    deleteNote(selectedNote.id);
    setConfirmDeleteOpen(false);
    setSavingState("idle");
    pushToast({ kind: "success", title: "Note deleted", description: `Removed “${title}”.` });
  };

  return (
    <>
      <AppShell
        header={
          <AppHeader
            right={
              <>
                <span className="kv-badge kv-badge-muted" aria-label="Notes count">
                  {sortedNotes.length} note{sortedNotes.length === 1 ? "" : "s"}
                </span>
                <Button variant="ghost" onClick={onCreate} aria-label="Create new note (header)">
                  New note
                </Button>
              </>
            }
          />
        }
        sidebar={
          <NotesSidebar
            notes={filteredNotes}
            selectedNoteId={selectedNoteId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onCreate={onCreate}
            onSelect={setSelectedNoteId}
            loading={false}
            error={null}
          />
        }
        main={
          <NoteEditor
            note={selectedNote}
            savingState={savingState}
            onChangeTitle={onChangeTitle}
            onChangeBody={onChangeBody}
            onRequestDelete={onRequestDelete}
          />
        }
      />

      <ConfirmDeleteModal
        open={confirmDeleteOpen}
        noteTitle={selectedNote?.title}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={onConfirmDelete}
      />

      <ToastRegion toasts={toasts} onDismiss={removeToast} />
    </>
  );
}

export default App;
