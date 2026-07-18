import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import modalState from "../../../state-observables/modal/ModalState";
import NewGraphModal from ".";

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
});
