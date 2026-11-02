import { createRef } from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import MainContent from ".";

jest.mock("../GraphArea", () => () => <div />);
jest.mock("../modals/NewGraphModal", () => () => <div />);

describe("dashboard connection ownership", () => {
  let connectGeneric: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    connectGeneric = jest.fn().mockResolvedValue(undefined);
    window.applicationManager = {
      connectedRafts: {},
      connectGeneric,
    } as any;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("sends Blocks users back to the editor without starting a connection", () => {
    const onReturnToHost = jest.fn();
    render(<MainContent mainRef={createRef()} isInModal onReturnToHost={onReturnToHost} />);

    expect(screen.getByRole("heading", { name: "Connect your device in Blocks" })).not.toBeNull();
    expect(within(screen.getByRole("list", { name: "Connect a device in Blocks" })).getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText(/Choose a Device/)).not.toBeNull();
    expect(screen.queryByRole("button", { name: /connect|extensions/i })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Back to Blocks" }));

    expect(onReturnToHost).toHaveBeenCalledTimes(1);
    expect(connectGeneric).not.toHaveBeenCalled();
  });

  it("detects devices connected in Blocks and returns to guidance after disconnection", () => {
    render(<MainContent mainRef={createRef()} isInModal />);

    act(() => {
      window.applicationManager.connectedRafts = { marty: {} } as any;
      jest.advanceTimersByTime(750);
    });

    expect(screen.getByRole("button", { name: /Add graph/ })).not.toBeNull();
    expect(screen.queryByRole("heading", { name: "Connect your device in Blocks" })).toBeNull();
    expect(screen.queryByRole("button", { name: /connect|extensions/i })).toBeNull();

    act(() => {
      window.applicationManager.connectedRafts = {};
      jest.advanceTimersByTime(750);
    });

    expect(screen.getByRole("heading", { name: "Connect your device in Blocks" })).not.toBeNull();
  });

  it("keeps standalone robot and extension connections available", async () => {
    render(<MainContent mainRef={createRef()} />);

    expect(screen.getByRole("button", { name: /Extensions/ })).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Back to Blocks" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Connect Marty or Cog" }));
    await screen.findByText("No device was connected. You can try again when you are ready.");

    expect(connectGeneric).toHaveBeenCalledTimes(1);
  });
});
