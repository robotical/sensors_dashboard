import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RobotButton from ".";

jest.mock("@robotical/webapp-types/dist-types/src/types/raft", () => ({
  RaftTypeE: {
    COG: "Cog",
    MARTY: "Marty",
  },
}));

jest.mock("../RaftSignal", () => () => (
  <span role="img" aria-label="Signal strength unavailable" />
));

jest.mock("../RaftBattery", () => () => (
  <span role="img" aria-label="Battery level unavailable" />
));

describe("RobotButton", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("uses the resolved robot name for its accessible disconnect action", async () => {
    jest.useFakeTimers();
    const onClickDisconnect = jest.fn(async () => undefined);
    const connectedRaft = {
      id: "marty-1",
      getBatteryStrength: jest.fn(() => 83),
      getRSSI: jest.fn(() => -62),
      getRaftName: jest.fn(async () => "Marty_90188a"),
    };

    render(
      <RobotButton
        robotType={"Marty" as never}
        connectedRaft={connectedRaft as never}
        onClickDisconnect={onClickDisconnect}
      />
    );

    await act(async () => {
      jest.advanceTimersByTime(500);
      await Promise.resolve();
    });

    const disconnectButton = await screen.findByRole("button", {
      name: "Disconnect Marty_90188a",
    });
    expect(disconnectButton.getAttribute("title")).toBe(
      "Disconnect Marty_90188a"
    );
    expect(screen.getByTitle("Marty_90188a").textContent).toBe("Marty_90188a");

    await act(async () => {
      userEvent.click(disconnectButton);
      await Promise.resolve();
    });
    expect(onClickDisconnect).toHaveBeenCalledWith("marty-1");
  });
});
