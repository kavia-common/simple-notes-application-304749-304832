import React, { useEffect, useMemo, useState } from "react";
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

// PUBLIC_INTERFACE
export function NoteEditor({
  note,
  savingState, // "idle" | "saving" | "saved"
  onChangeTitle,
  onChangeBody,
  onRequestDelete,
}) {
  /** Editor pane with markdown textarea and preview toggle. */
  const [previewMode, setPreviewMode] = useState("split"); // "edit" | "preview" | "split"

  useEffect(() => {
    // Reset preview mode when switching notes (keeps UI predictable)
    setPreviewMode("split");
  }, [note?.id]);

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
