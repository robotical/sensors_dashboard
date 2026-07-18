import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import modalState from "../../state-observables/modal/ModalState";
import Modal from ".";

jest.mock("../../state-observables/modal/ModalState", () => ({
  __esModule: true,
  default: {
    closeModal: jest.fn(),
  },
}));

const mockCloseModal = modalState.closeModal as jest.Mock;

describe("Modal", () => {
  let opener: HTMLButtonElement;
  let background: HTMLElement;

  beforeEach(() => {
    jest.useFakeTimers();
    mockCloseModal.mockClear();
    window.scrollTo = jest.fn();

    background = document.createElement("main");
    opener = document.createElement("button");
    opener.textContent = "Open dialog";
    background.appendChild(opener);
    document.body.appendChild(background);

    const portalTarget = document.createElement("div");
    portalTarget.id = "sensors-dashboard-modal-main-container";
    document.body.appendChild(portalTarget);
    opener.focus();
  });

  afterEach(() => {
    cleanup();
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    document.body.innerHTML = "";
  });

  it("labels the dialog, traps focus, closes with Escape, and restores focus", () => {
    const { unmount } = render(
      <Modal
        title="Add new graph"
        shouldCloseModal={false}
        modalResetter={jest.fn()}
        withLogo={false}
      >
        <button type="button">First action</button>
        <button type="button" data-modal-initial-focus>Preferred action</button>
        <button type="button">Last action</button>
      </Modal>
    );

    const dialog = screen.getByRole("dialog", { name: "Add new graph" });
    const firstAction = screen.getByRole("button", { name: "First action" });
    const preferredAction = screen.getByRole("button", { name: "Preferred action" });
    const lastAction = screen.getByRole("button", { name: "Last action" });

    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(preferredAction).toHaveFocus();

    lastAction.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(firstAction).toHaveFocus();

    firstAction.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(lastAction).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(mockCloseModal).toHaveBeenCalledTimes(1);

    const focusSpy = jest.spyOn(opener, "focus");
    background.setAttribute("inert", "");
    unmount();
    expect(focusSpy).not.toHaveBeenCalled();

    background.removeAttribute("inert");
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(opener).toHaveFocus();
  });
});
