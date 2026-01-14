import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { uuidV4 } from "../utils/uuid";

const STORAGE_KEY = "ocean-notes:v1";
const STORAGE_VERSION = 1;

/**
 * @typedef {import("../types/note").Note} Note
 * @typedef {{ version: number, notes: Note[] }} NotesStorageEnvelope
 */

function normalizeNote(note) {
  const now = Date.now();
  return {
    id: note.id ?? uuidV4(),
    title: note.title ?? "",
    body: note.body ?? "",
    createdAt: typeof note.createdAt === "number" ? note.createdAt : now,
    updatedAt: typeof note.updatedAt === "number" ? note.updatedAt : now,
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

  if (raw && typeof raw === "object") {
    const rawNotes = Array.isArray(raw.notes) ? raw.notes : null;
    if (rawNotes) {
      // If in future we bump versions, this is where we'd migrate from raw.version -> STORAGE_VERSION.
      // For now, we simply normalize and clamp version.
      return { version: STORAGE_VERSION, notes: rawNotes.map(normalizeNote) };
    }
    // Object but not our shape -> reset.
    return makeInitialEnvelope();
  }

  return makeInitialEnvelope();
}

// PUBLIC_INTERFACE
export function useNotes() {
  /** Manage notes (CRUD) + derived views (search/sort). Notes persist to localStorage with versioned schema. */
  const [envelope, setEnvelope] = useLocalStorage(STORAGE_KEY, makeInitialEnvelope());

  const notes = useMemo(() => coerceEnvelope(envelope).notes, [envelope]);

  const setNotes = useCallback(
    (updater) => {
      setEnvelope((prev) => {
        const current = coerceEnvelope(prev);
        const nextNotes = typeof updater === "function" ? updater(current.notes) : updater;
        return { version: STORAGE_VERSION, notes: (nextNotes ?? []).map(normalizeNote) };
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
    return [...(notes ?? [])].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
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

  return {
    notes,
    sortedNotes,
    createNote,
    updateNote,
    deleteNote,
    getNoteById,
    searchNotes,
  };
}
