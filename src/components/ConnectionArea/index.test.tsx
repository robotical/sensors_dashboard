import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConnectionArea from ".";

jest.mock("@robotical/webapp-types/dist-types/src/store/SelectedRaftContext", () => ({
  NewRobotIdE: {
    NEW: "=+__new__+=",
  },
}));

jest.mock("./RobotButton", () => ({
  __esModule: true,
  default: ({ connectedRaft }: { connectedRaft: { id: string } }) => (
    <div>Connected robot {connectedRaft.id}</div>
  ),
}));

const setApplicationManager = (applicationManager: Record<string, unknown>) => {
  Object.defineProperty(window, "applicationManager", {
    configurable: true,
    value: applicationManager,
  });
};

describe("ConnectionArea", () => {
  it("keeps the legacy connect tile as a semantic button", async () => {
    const connectGeneric = jest.fn(
      async (afterConnected?: (raft: { id: string }) => void) => {
        afterConnected?.({ id: "marty-1" });
      }
    );
    setApplicationManager({
      connectedRafts: {},
      connectGeneric,
      disconnectGeneric: jest.fn(),
    });

    render(<ConnectionArea isNavMenuMinimized={false} />);

    const connectButton = screen.getByRole("button", { name: "Connect device" });
    expect(connectButton.tagName).toBe("BUTTON");
    userEvent.click(connectButton);

    await waitFor(() => expect(connectGeneric).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("status").textContent).toBe(
      "Ready to connect a device."
    );
  });

  it("shows the legacy add control when a robot is connected", async () => {
    const connectGeneric = jest.fn(async () => undefined);
    setApplicationManager({
      connectedRafts: {
        "marty-1": {
          id: "marty-1",
          type: "Marty",
        },
      },
      connectGeneric,
      disconnectGeneric: jest.fn(),
    });

    render(<ConnectionArea isNavMenuMinimized={false} />);

    expect(screen.getByText("Connected robot marty-1")).toBeTruthy();
    const addButton = screen.getByRole("button", {
      name: "Connect another robot",
    });
    userEvent.click(addButton);

    await waitFor(() => expect(connectGeneric).toHaveBeenCalledTimes(1));
  });
});
