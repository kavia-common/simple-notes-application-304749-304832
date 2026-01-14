import { render, screen, within } from "@testing-library/react";
import App from "./App";

test("renders Ocean Notes header", () => {
  render(<App />);

  // Disambiguate from seeded note title "Welcome to Ocean Notes"
  const header = screen.getByRole("banner");
  expect(within(header).getByRole("heading", { name: "Ocean Notes" })).toBeInTheDocument();
});
