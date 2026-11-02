import { render, screen } from "@testing-library/react";
import GeneralInfo from ".";

it("explains the Blocks device flow in the embedded guide", () => {
  render(<GeneralInfo isInModal />);

  expect(screen.getByText(/Choose a Device/)).not.toBeNull();
  expect(screen.getByRole("heading", { name: "Connect in Blocks" })).not.toBeNull();
  expect(screen.queryByText(/Connect micro:bit/)).toBeNull();
});

it("keeps the standalone connection guide", () => {
  render(<GeneralInfo />);

  expect(screen.getByText(/Connect micro:bit/)).not.toBeNull();
  expect(screen.queryByText(/Choose a Device/)).toBeNull();
});
