import React from "react";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

const STORAGE_KEY = "ocean-notes:v1";

function makeEnvelope(notes) {
  return { version: 1, notes };
}

function note({ id, title, body, createdAt, updatedAt, pinned }) {
  return {
    id,
    title,
    body,
    createdAt,
    updatedAt,
    pinned,
  };
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2025-01-01T12:00:00.000Z"));
  window.localStorage.clear();
});

afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
});

test("pinning a note keeps it at the top of the list", async () => {
  const seeded = makeEnvelope([
    note({
      id: "a",
      title: "Older",
      body: "",
      createdAt: Date.now() - 10000,
      updatedAt: Date.now() - 9000,
      pinned: false,
    }),
    note({
      id: "b",
      title: "Newer",
      body: "",
      createdAt: Date.now() - 8000,
      updatedAt: Date.now() - 1000,
      pinned: false,
    }),
  ]);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));

  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<App />);

  const listbox = screen.getByRole("listbox", { name: /notes list/i });
  let options = within(listbox).getAllByRole("option");
  expect(within(options[0]).getByText("Newer")).toBeInTheDocument();

  // Pin "Older" via its pin button; it should now appear first.
  const olderRow = options.find((o) => within(o).queryByText("Older"));
  expect(olderRow).toBeTruthy();

  // Pin button is outside the option button but within the row wrapper, so search from the list container.
  const pinButtons = screen.getAllByRole("button", { name: /pin note|unpin note/i });
  // Click the pin button that corresponds to the "Older" row wrapper (closest).
  const olderWrapper = olderRow.closest(".kv-list-item-wrap");
  const olderPin = within(olderWrapper).getByRole("button", { name: /pin note/i });
  await user.click(olderPin);

  options = within(listbox).getAllByRole("option");
  expect(within(options[0]).getByText("Older")).toBeInTheDocument();
  expect(within(options[0]).getByText(/pinned/i)).toBeInTheDocument();
});

test("duplicate note creates a copy and selects it", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<App />);

  // Duplicate current selected note from editor toolbar
  await user.click(screen.getByRole("button", { name: /duplicate note/i }));

  // Newly duplicated note should be selected and have "Copy of" title
  expect(screen.getByRole("textbox", { name: /note title/i }).value).toMatch(/^Copy of /i);
});
