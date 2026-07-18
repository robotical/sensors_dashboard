import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type RAFT from "@robotical/webapp-types/dist-types/src/application/RAFTs/RAFT";
import Addon from "../../models/addons/Addon";
import AddonSub from "../../models/addons/AddonSub";
import getAllAddonsList from "../../utils/get-addons-list";
import GraphArea from ".";

jest.mock("@robotical/webapp-types/dist-types/src/types/raft", () => ({
  RaftTypeE: {
    COG: "Cog",
    MARTY: "Marty",
  },
}));
jest.mock("../../utils/get-addons-list", () => jest.fn());
jest.mock("../../app-bridge/MartyInterface", () => ({
  MartyInterface: class {
    addEventListener() {}
    removeEventListener() {}
    unsubscribeFromPublishedData() {}
  },
}));
jest.mock("../../app-bridge/CogInterface", () => jest.fn());
jest.mock("../../app-bridge/mocks/MockMartyInterface", () => jest.fn());
jest.mock("../../app-bridge/mocks/MockCogInterface", () => jest.fn());
jest.mock("../../mock/MockApplicationManager", () => ({
  isMockRaft: () => false,
}));
jest.mock("../AddonsList", () => ({
  __esModule: true,
  default: ({
    addons,
  }: {
    addons: Array<{ addonInputs: Array<{ selectedListener?: () => void }> }>;
  }) => (
    <button
      type="button"
      disabled={!addons[0]}
      onClick={() => addons[0]?.addonInputs[0]?.selectedListener?.()}
    >
      Toggle test signal
    </button>
  ),
}));
jest.mock("../Graph", () => () => <div />);
jest.mock("../GraphControls", () => ({
  __esModule: true,
  default: ({
    recordingState,
    onClickPlay,
    onClickPause,
    onClickStop,
    mode = "all",
  }: {
    recordingState: string;
    onClickPlay: () => void;
    onClickPause: () => void;
    onClickStop: () => void;
    mode?: "all" | "primary" | "advanced";
  }) => (
    <div>
      {mode !== "advanced" && (
        <>
          <span data-testid="control-state">{recordingState}</span>
          <button type="button" onClick={onClickPlay}>Test record</button>
          <button type="button" onClick={onClickPause}>Test pause</button>
          <button type="button" onClick={onClickStop}>Test reset</button>
        </>
      )}
    </div>
  ),
}));

describe("GraphArea", () => {
  beforeEach(() => {
    (getAllAddonsList as jest.MockedFunction<typeof getAllAddonsList>).mockReturnValue([]);
  });

  it("labels the graph and exposes an honest initial state", () => {
    const raft = { id: "raft-1", type: "unsupported-test-type" } as unknown as RAFT;

    render(
      <GraphArea
        graphId="graph-1"
        raft={raft}
        deviceName="Classroom Marty"
        removeGraph={jest.fn()}
        mainRef={{ current: document.createElement("div") }}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Sensor graph — Classroom Marty" })
    ).not.toBeNull();
    expect(
      screen.getByRole("region", { name: "Sensor graph for Classroom Marty" })
    ).not.toBeNull();
    expect(screen.getByText("Choose signals")).not.toBeNull();
    expect(
      (screen.getByRole("button", { name: "CSV" }) as HTMLButtonElement).disabled
    ).toBe(true);
    expect(
      screen.getByText(
        "CSV export becomes available after sensor data has been recorded."
      )
    ).not.toBeNull();
  });

  it("moves through choose, ready, recording, paused, and reset states", async () => {
    const signal = new AddonSub("Temperature", 20);
    (getAllAddonsList as jest.MockedFunction<typeof getAllAddonsList>).mockReturnValue([
      new Addon("Environment", [signal]),
    ]);
    const raft = { id: "raft-2", type: "Marty" } as unknown as RAFT;

    render(
      <GraphArea
        graphId="graph-2"
        raft={raft}
        deviceName="Lab Marty"
        removeGraph={jest.fn()}
        mainRef={{ current: document.createElement("div") }}
      />
    );

    expect(screen.getByTestId("control-state").textContent).toBe("choose-signals");

    await waitFor(() =>
      expect(
        (screen.getByRole("button", {
          name: "Toggle test signal",
        }) as HTMLButtonElement).disabled
      ).toBe(false)
    );
    fireEvent.click(screen.getByRole("button", { name: "Toggle test signal" }));
    expect(screen.getByTestId("control-state").textContent).toBe("ready");

    fireEvent.click(screen.getByRole("button", { name: "Test record" }));
    expect(screen.getByTestId("control-state").textContent).toBe("recording");

    fireEvent.click(screen.getByRole("button", { name: "Test pause" }));
    expect(screen.getByTestId("control-state").textContent).toBe("paused");

    fireEvent.click(screen.getByRole("button", { name: "Test reset" }));
    expect(screen.getByTestId("control-state").textContent).toBe("ready");
    expect(
      (screen.getByRole("button", { name: "CSV" }) as HTMLButtonElement).disabled
    ).toBe(true);
  });
});
