import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "./ui/Card";
import { Toolbar } from "./ui/Toolbar";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { IconButton } from "./ui/IconButton";
import { Input } from "./ui/Input";
import { TextArea } from "./ui/TextArea";
import { NoteViewer } from "./NoteViewer";
import { EmptyState } from "./EmptyState";

function EyeIcon() {
  return (
    <svg className="kv-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="kv-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 3h6m-9 4h12m-10 0 1 14h6l1-14M10 11v7m4-7v7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="kv-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 9h10v12H9V9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg className="kv-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 7l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ImportIcon() {
  return (
    <svg className="kv-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21V11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 17l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M5 10V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// PUBLIC_INTERFACE
export function NoteEditor({
  note,
  savingState, // "idle" | "saving" | "saved"
  onChangeTitle,
  onChangeBody,
  onRequestDelete,
  onDuplicate,
  onExportAll,
  onImportFileSelected,
  autoFocusTitleKey,
}) {
  /** Editor pane with markdown textarea and preview toggle + quick actions (duplicate/export/import). */
  const [previewMode, setPreviewMode] = useState("split"); // "edit" | "preview" | "split"
  const titleInputRef = useRef(null);
  const importInputRef = useRef(null);

  useEffect(() => {
    // Reset preview mode when switching notes (keeps UI predictable)
    setPreviewMode("split");
  }, [note?.id]);

  useEffect(() => {
    // UX: when creating a new note, auto-focus the title input (without disrupting other note switches).
    if (!note) return;
    if (!autoFocusTitleKey) return;

    window.setTimeout(() => {
      titleInputRef.current?.focus?.();
      titleInputRef.current?.select?.();
    }, 0);
  }, [note?.id, autoFocusTitleKey, note]);

  const badge = useMemo(() => {
    if (savingState === "saving") return { variant: "primary", text: "Saving…" };
    if (savingState === "saved") return { variant: "muted", text: "Saved" };
    return { variant: "muted", text: "Autosave" };
  }, [savingState]);

  if (!note) {
    return (
      <Card className="kv-editor">
        <div style={{ padding: 10 }}>
          <EmptyState
            title="Select a note"
            description="Choose a note from the sidebar, or create a new one."
            actionLabel={null}
          />
        </div>
      </Card>
    );
  }

  const title = note.title ?? "";
  const body = note.body ?? "";

  return (
    <Card className="kv-editor" aria-label="Note editor">
      <Toolbar
        left={
          <>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: "-0.01em", overflow: "hidden" }}>
                Editing
              </div>
              <div className="kv-muted" style={{ fontSize: 12 }}>
                Changes autosave after a short pause.
              </div>
            </div>
            <Badge variant={badge.variant}>{badge.text}</Badge>
          </>
        }
        right={
          <>
            <div className="kv-row" aria-label="Editor actions">
              <IconButton label="Duplicate note" onClick={onDuplicate}>
                <CopyIcon />
              </IconButton>

              <IconButton label="Export all notes (JSON)" onClick={onExportAll}>
                <ExportIcon />
              </IconButton>

              {/* Hidden file input to keep styling consistent, but remain accessible via button */}
              <input
                ref={importInputRef}
                type="file"
                accept="application/json,.json"
                className="kv-sr-only"
                aria-label="Import notes JSON file"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  if (file) onImportFileSelected?.(file);
                  // Reset so selecting the same file again still fires onChange.
                  e.target.value = "";
                }}
              />
              <IconButton
                label="Import notes (JSON)"
                onClick={() => {
                  importInputRef.current?.click?.();
                }}
              >
                <ImportIcon />
              </IconButton>
            </div>

            <div className="kv-row" aria-label="Preview mode">
              <Button
                variant={previewMode === "edit" ? "primary" : "ghost"}
                onClick={() => setPreviewMode("edit")}
                aria-pressed={previewMode === "edit"}
              >
                Edit
              </Button>
              <Button
                variant={previewMode === "split" ? "primary" : "ghost"}
                onClick={() => setPreviewMode("split")}
                aria-pressed={previewMode === "split"}
              >
                Split
              </Button>
              <IconButton
                label={previewMode === "preview" ? "Show editor" : "Show preview"}
                onClick={() => setPreviewMode((m) => (m === "preview" ? "edit" : "preview"))}
                aria-pressed={previewMode === "preview"}
              >
                <EyeIcon />
              </IconButton>
            </div>

            <IconButton label="Delete note" onClick={onRequestDelete}>
              <TrashIcon />
            </IconButton>
          </>
        }
      />

      <div className="kv-editor-body">
        <div className="kv-split" data-split={previewMode === "split"}>
          {previewMode !== "preview" ? (
            <div aria-label="Editor fields">
              <Input
                label="Title"
                aria-label="Note title"
                value={title}
                onChange={(e) => onChangeTitle(e.target.value)}
                placeholder="Untitled…"
                ref={titleInputRef}
              />
              <div style={{ height: 10 }} />
              <TextArea
                label="Body (Markdown)"
                aria-label="Note body"
                value={body}
                onChange={(e) => onChangeBody(e.target.value)}
                placeholder="Write your note in Markdown…"
              />
              <div className="kv-muted" style={{ fontSize: 12, marginTop: 8 }}>
                Tip: Use <span className="kv-kbd">**bold**</span>, <span className="kv-kbd">*italic*</span>,{" "}
                <span className="kv-kbd">`code`</span>, <span className="kv-kbd">- lists</span>.
              </div>
            </div>
          ) : null}

          {previewMode !== "edit" ? <NoteViewer title={title} body={body} /> : null}
        </div>
      </div>
    </Card>
  );
}
