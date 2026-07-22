import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import modalState from "../../../state-observables/modal/ModalState";
import NewGraphModal from ".";
import MicroBitWebBluetooth from "../../../microbit/MicroBitWebBluetooth";

jest.mock("../../../state-observables/modal/ModalState", () => ({
  __esModule: true,
  default: {
    closeModal: jest.fn(),
  },
}));

jest.mock("@robotical/webapp-types/dist-types/src/store/SelectedRaftContext", () => ({
  NewRobotIdE: {
    NEW: "=+__new__+=",
  },
}));

jest.mock("@robotical/webapp-types/dist-types/src/types/raft", () => ({
  RaftTypeE: {
    COG: "Cog",
    MARTY: "Marty",
  },
}));

const mockCloseModal = modalState.closeModal as jest.Mock;

describe("NewGraphModal", () => {
  beforeEach(() => {
    mockCloseModal.mockClear();
    Object.defineProperty(window, "applicationManager", {
      configurable: true,
      value: {
        connectedRaftsContext: [
          {
            id: "marty-1",
            isSelected: true,
            name: "Classroom Marty",
            type: "Marty",
          },
        ],
      },
    });
  });

  it("exposes the robot picker and close action as keyboard-operable buttons", () => {
    render(<NewGraphModal />);

    const robotButton = screen.getByRole("button", {
      name: "Create graph for Classroom Marty",
    });
    robotButton.focus();
    userEvent.type(robotButton, "{enter}");

    expect(mockCloseModal).toHaveBeenCalledWith("marty-1");

    userEvent.click(screen.getByRole("button", { name: "Close add graph dialog" }));
    expect(mockCloseModal).toHaveBeenCalledWith();
  });

  it("lists a dashboard-owned micro:bit as a graph source", () => {
    const microBit = {
      id: "microbit-1",
      getFriendlyName: () => "BBC micro:bit",
      isConnected: () => true,
      addDisconnectListener: () => jest.fn(),
    } as unknown as MicroBitWebBluetooth;

    render(<NewGraphModal microBit={microBit} />);
    userEvent.click(
      screen.getByRole("button", { name: "Create graph for BBC micro:bit" })
    );

    expect(mockCloseModal).toHaveBeenCalledWith("microbit-1");
  });

  it("removes a micro:bit that disconnects while the picker is open", () => {
    window.applicationManager.connectedRaftsContext = [];
    let disconnectListener: (() => void) | null = null;
    const unsubscribe = jest.fn();
    const microBit = {
      id: "microbit-1",
      getFriendlyName: () => "BBC micro:bit",
      isConnected: () => true,
      addDisconnectListener: jest.fn((listener: () => void) => {
        disconnectListener = listener;
        return unsubscribe;
      }),
    } as unknown as MicroBitWebBluetooth;

    const { unmount } = render(<NewGraphModal microBit={microBit} />);
    expect(
      screen.getByRole("button", { name: "Create graph for BBC micro:bit" })
    ).not.toBeNull();

    act(() => disconnectListener?.());

    expect(
      screen.queryByRole("button", { name: "Create graph for BBC micro:bit" })
    ).toBeNull();
    expect(screen.getByText(/No devices are connected/)).not.toBeNull();

    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
