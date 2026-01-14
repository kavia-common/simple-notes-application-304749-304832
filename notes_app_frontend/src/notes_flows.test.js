import React from "react";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

const STORAGE_KEY = "ocean-notes:v1";

/**
 * Helper: create a minimal storage envelope that useNotes can coerce.
 * We avoid importing internal hook helpers to keep tests app-level and black-box.
 */
function makeEnvelope(notes) {
  return { version: 1, notes };
}

function note({ id, title, body, createdAt, updatedAt }) {
  return {
    id,
    title,
    body,
    createdAt,
    updatedAt,
  };
}

async function flushTimers(ms) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

beforeEach(() => {
  // Deterministic time for updatedAt ordering and predictable tests.
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2025-01-01T12:00:00.000Z"));

  window.localStorage.clear();
});

afterEach(() => {
  // Ensure no pending timers leak between tests (toasts + debounced saves).
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
});

test("creating a new note updates the list and selects it", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  render(<App />);

  const listbox = screen.getByRole("listbox", { name: /notes list/i });
  const initialOptions = within(listbox).getAllByRole("option");
  expect(initialOptions.length).toBeGreaterThanOrEqual(1);

  // Create via sidebar button
  await user.click(screen.getByRole("button", { name: /create new note$/i }));

  const updatedOptions = within(listbox).getAllByRole("option");
  expect(updatedOptions.length).toBe(initialOptions.length + 1);

  // Newly created note is inserted at top and should be selected immediately
  expect(updatedOptions[0]).toHaveAttribute("aria-selected", "true");
  expect(within(updatedOptions[0]).getByText(/untitled note/i)).toBeInTheDocument();

  // Editor should now show the selected note title input with "Untitled note"
  expect(screen.getByRole("textbox", { name: /note title/i })).toHaveValue("Untitled note");
});

test("search filters the sidebar list by title and by body", async () => {
  // Seed notes with known content (no dependence on default seed note).
  const seeded = makeEnvelope([
    note({
      id: "a",
      title: "Alpha title",
      body: "Some body text",
      createdAt: Date.now() - 10000,
      updatedAt: Date.now() - 9000,
    }),
    note({
      id: "b",
      title: "Beta note",
      body: "Contains KEYWORD in the body",
      createdAt: Date.now() - 8000,
      updatedAt: Date.now() - 7000,
    }),
    note({
      id: "c",
      title: "Gamma",
      body: "Nothing interesting here",
      createdAt: Date.now() - 6000,
      updatedAt: Date.now() - 5000,
    }),
  ]);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));

  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<App />);

  const listbox = screen.getByRole("listbox", { name: /notes list/i });

  // Filter by title
  await user.type(screen.getByRole("textbox", { name: /search notes/i }), "beta");
  expect(within(listbox).getAllByRole("option")).toHaveLength(1);
  expect(within(listbox).getByText("Beta note")).toBeInTheDocument();

  // Clear search
  await user.click(screen.getByRole("button", { name: /clear search/i }));
  expect(within(listbox).getAllByRole("option")).toHaveLength(3);

  // Filter by body
  await user.type(screen.getByRole("textbox", { name: /search notes/i }), "keyword");
  expect(within(listbox).getAllByRole("option")).toHaveLength(1);
  expect(within(listbox).getByText("Beta note")).toBeInTheDocument();
});

test("editing content triggers autosave badge state changes (Saving… then Saved)", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<App />);

  // Badge lives in the editor toolbar; it starts as "Autosave"
  expect(screen.getByText("Autosave")).toBeInTheDocument();

  // Edit the note body. This should:
  // - immediately set savingState to "idle" -> badge remains "Autosave"
  // - after 450ms debouncedSave -> "Saving…"
  // - after +350ms debouncedMarkSaved -> "Saved"
  await user.clear(screen.getByRole("textbox", { name: /note body/i }));
  await user.type(screen.getByRole("textbox", { name: /note body/i }), "Hello autosave");

  // Run debounce timers deterministically
  await flushTimers(450);
  expect(screen.getByText("Saving…")).toBeInTheDocument();

  await flushTimers(350);
  expect(screen.getByText("Saved")).toBeInTheDocument();
});

test("delete confirmation removes the selected note and selects a sensible neighbor", async () => {
  // Seed 3 notes with deterministic ordering by updatedAt.
  // sortedNotes sorts by updatedAt descending.
  const seeded = makeEnvelope([
    note({
      id: "n1",
      title: "First",
      body: "",
      createdAt: Date.now() - 30000,
      updatedAt: Date.now() - 1000, // newest -> initially selected
    }),
    note({
      id: "n2",
      title: "Second",
      body: "",
      createdAt: Date.now() - 20000,
      updatedAt: Date.now() - 2000,
    }),
    note({
      id: "n3",
      title: "Third",
      body: "",
      createdAt: Date.now() - 10000,
      updatedAt: Date.now() - 3000, // oldest
    }),
  ]);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));

  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<App />);

  const listbox = screen.getByRole("listbox", { name: /notes list/i });
  const optionsBefore = within(listbox).getAllByRole("option");
  expect(optionsBefore).toHaveLength(3);

  // Ensure "First" is selected initially (newest by updatedAt)
  const firstRow = optionsBefore.find((o) => within(o).queryByText("First"));
  expect(firstRow).toBeTruthy();
  expect(firstRow).toHaveAttribute("aria-selected", "true");

  // Open delete modal
  await user.click(screen.getByRole("button", { name: /delete note/i }));
  expect(screen.getByRole("dialog", { name: /delete note\?/i })).toBeInTheDocument();

  // Confirm delete
  await user.click(screen.getByRole("button", { name: /^delete$/i }));

  // List should shrink and selection should move to the next sensible neighbor.
  // App selects first note in sortedNotes when selection disappears => should now select "Second".
  const optionsAfter = within(listbox).getAllByRole("option");
  expect(optionsAfter).toHaveLength(2);
  expect(within(listbox).queryByText("First")).not.toBeInTheDocument();

  const secondRow = optionsAfter.find((o) => within(o).queryByText("Second"));
  expect(secondRow).toBeTruthy();
  expect(secondRow).toHaveAttribute("aria-selected", "true");

  // Editor should also reflect the new selection
  expect(screen.getByRole("textbox", { name: /note title/i })).toHaveValue("Second");
});
