import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { uuidV4 } from "../utils/uuid";

const STORAGE_KEY = "ocean-notes:v1";

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

// PUBLIC_INTERFACE
export function useNotes() {
  /** Manage notes (CRUD) + derived views (search/sort). Notes persist to localStorage. */
  const [notes, setNotes] = useLocalStorage(STORAGE_KEY, seedNotes());

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
