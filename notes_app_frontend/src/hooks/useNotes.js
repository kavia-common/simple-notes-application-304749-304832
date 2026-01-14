import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { uuidV4 } from "../utils/uuid";

const STORAGE_KEY = "ocean-notes:v1";
const STORAGE_VERSION = 1;

/**
 * @typedef {import("../types/note").Note} Note
 * @typedef {{ version: number, notes: Note[] }} NotesStorageEnvelope
 */

function isPlainObject(v) {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function toSafeString(v) {
  if (typeof v === "string") return v;
  if (v == null) return "";
  try {
    return String(v);
  } catch {
    return "";
  }
}

function toSafeTimestamp(v, fallback) {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function toSafeBoolean(v, fallback = false) {
  if (typeof v === "boolean") return v;
  if (v == null) return fallback;
  // Accept some common truthy values on import
  if (typeof v === "string") return v.trim().toLowerCase() === "true";
  if (typeof v === "number") return v === 1;
  return fallback;
}

function normalizeNote(note) {
  const now = Date.now();
  const createdAt = toSafeTimestamp(note?.createdAt, now);
  const updatedAt = toSafeTimestamp(note?.updatedAt, now);

  // Keep updatedAt from ever being older than createdAt (bad imports/migrations).
  const safeUpdatedAt = Math.max(updatedAt, createdAt);

  return {
    id: typeof note?.id === "string" && note.id.trim() ? note.id : uuidV4(),
    title: toSafeString(note?.title),
    body: toSafeString(note?.body),
    createdAt,
    updatedAt: safeUpdatedAt,
    pinned: toSafeBoolean(note?.pinned, false),
  };
}

function seedNotes() {
  const now = Date.now();
  return [
    normalizeNote({
      id: uuidV4(),
      title: "Welcome to Ocean Notes",
      body:
        "This is a lightweight notes app.\n\n- Create notes in the sidebar\n- Edit with autosave\n- Toggle **Markdown** preview\n\n```js\nconsole.log('Hello Ocean');\n```",
      createdAt: now - 1000 * 60 * 60 * 4,
      updatedAt: now - 1000 * 60 * 18,
      pinned: false,
    }),
  ];
}

function makeInitialEnvelope() {
  return { version: STORAGE_VERSION, notes: seedNotes() };
}

function coerceEnvelope(raw) {
  // Supports:
  // - current format: {version, notes}
  // - legacy format: Note[]
  // Any invalid/unknown format falls back to initial seed.
  if (Array.isArray(raw)) {
    return { version: STORAGE_VERSION, notes: raw.map(normalizeNote) };
  }

  if (isPlainObject(raw)) {
    const rawNotes = Array.isArray(raw.notes) ? raw.notes : null;
    if (rawNotes) {
      // If in future we bump versions, this is where we'd migrate from raw.version -> STORAGE_VERSION.
      // For now, we normalize and clamp to current version.
      return { version: STORAGE_VERSION, notes: rawNotes.map(normalizeNote) };
    }
    // Object but not our shape -> reset.
    return makeInitialEnvelope();
  }

  return makeInitialEnvelope();
}

function fileSafeName(name) {
  const base = (name ?? "").trim() || "ocean-notes";
  return base
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// PUBLIC_INTERFACE
export function useNotes() {
  /** Manage notes (CRUD) + derived views (search/sort) + import/export. Notes persist to localStorage with versioned schema. */
  const [envelope, setEnvelope] = useLocalStorage(STORAGE_KEY, makeInitialEnvelope());

  // Always coerce so malformed localStorage never breaks runtime (robust local-first behavior).
  const notes = useMemo(() => coerceEnvelope(envelope).notes, [envelope]);

  const setNotes = useCallback(
    (updater) => {
      setEnvelope((prev) => {
        const current = coerceEnvelope(prev);
        const nextNotes = typeof updater === "function" ? updater(current.notes) : updater;

        // Safe fallback: if updater returns something unexpected, keep current notes.
        const nextArray = Array.isArray(nextNotes) ? nextNotes : current.notes;

        return { version: STORAGE_VERSION, notes: nextArray.map(normalizeNote) };
      });
    },
    [setEnvelope]
  );

  const createNote = useCallback(() => {
    const now = Date.now();
    const newNote = normalizeNote({
      id: uuidV4(),
      title: "Untitled note",
      body: "",
      createdAt: now,
      updatedAt: now,
      pinned: false,
    });

    setNotes((prev) => [newNote, ...(prev ?? [])]);
    return newNote;
  }, [setNotes]);

  const updateNote = useCallback(
    (id, patch) => {
      const now = Date.now();
      setNotes((prev) =>
        (prev ?? []).map((n) =>
          n.id === id
            ? normalizeNote({
                ...n,
                ...patch,
                id: n.id,
                createdAt: n.createdAt,
                updatedAt: now,
              })
            : n
        )
      );
    },
    [setNotes]
  );

  const togglePinned = useCallback(
    (id) => {
      const now = Date.now();
      setNotes((prev) =>
        (prev ?? []).map((n) =>
          n.id === id
            ? normalizeNote({
                ...n,
                pinned: !n.pinned,
                // Pin/unpin should not make the note "jump" via updatedAt; keep timestamps stable.
                updatedAt: n.updatedAt ?? now,
              })
            : n
        )
      );
    },
    [setNotes]
  );

  const duplicateNote = useCallback(
    (id) => {
      const source = (notes ?? []).find((n) => n.id === id);
      if (!source) return null;

      const now = Date.now();
      const baseTitle = (source.title ?? "").trim() || "Untitled note";
      const copy = normalizeNote({
        id: uuidV4(),
        title: `Copy of ${baseTitle}`,
        body: source.body ?? "",
        createdAt: now,
        updatedAt: now,
        pinned: false,
      });

      setNotes((prev) => [copy, ...(prev ?? [])]);
      return copy;
    },
    [notes, setNotes]
  );

  const deleteNote = useCallback(
    (id) => {
      setNotes((prev) => (prev ?? []).filter((n) => n.id !== id));
    },
    [setNotes]
  );

  const getNoteById = useCallback(
    (id) => {
      return (notes ?? []).find((n) => n.id === id) ?? null;
    },
    [notes]
  );

  const sortedNotes = useMemo(() => {
    // Pinned notes first, then by updatedAt desc.
    return [...(notes ?? [])].sort((a, b) => {
      const ap = a.pinned ? 1 : 0;
      const bp = b.pinned ? 1 : 0;
      if (ap !== bp) return bp - ap;
      return (b.updatedAt ?? 0) - (a.updatedAt ?? 0);
    });
  }, [notes]);

  const searchNotes = useCallback(
    (query) => {
      const q = (query ?? "").trim().toLowerCase();
      if (!q) return sortedNotes;

      return sortedNotes.filter((n) => {
        const title = (n.title ?? "").toLowerCase();
        const body = (n.body ?? "").toLowerCase();
        return title.includes(q) || body.includes(q);
      });
    },
    [sortedNotes]
  );

  const exportNotesToJsonString = useCallback(() => {
    const current = coerceEnvelope(envelope);
    return JSON.stringify({ version: STORAGE_VERSION, notes: current.notes.map(normalizeNote) }, null, 2);
  }, [envelope]);

  const exportNotesToFile = useCallback(() => {
    const json = exportNotesToJsonString();
    const blob = new Blob([json], { type: "application/json" });

    const ts = new Date().toISOString().slice(0, 10);
    const filename = `${fileSafeName("ocean-notes")}-${ts}.json`;

    const url = URL.createObjectURL(blob);
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      URL.revokeObjectURL(url);
    }
  }, [exportNotesToJsonString]);

  const importNotesFromJsonText = useCallback(
    (jsonText) => {
      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch (e) {
        return { ok: false, error: "Invalid JSON file." };
      }

      // Migration/validation uses the same envelope coercion logic as runtime localStorage.
      const coerced = coerceEnvelope(parsed);

      if (!coerced?.notes || !Array.isArray(coerced.notes)) {
        return { ok: false, error: "JSON does not contain a valid notes array." };
      }

      // Normalize & store (dedupe by id: imported wins)
      const normalized = coerced.notes.map(normalizeNote);
      const byId = new Map();
      for (const n of normalized) byId.set(n.id, n);

      setEnvelope({ version: STORAGE_VERSION, notes: Array.from(byId.values()) });
      return { ok: true, count: byId.size };
    },
    [setEnvelope]
  );

  return {
    notes,
    sortedNotes,
    createNote,
    updateNote,
    togglePinned,
    duplicateNote,
    deleteNote,
    getNoteById,
    searchNotes,
    exportNotesToFile,
    importNotesFromJsonText,
  };
}
