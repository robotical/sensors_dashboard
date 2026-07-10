import { render, screen } from "@testing-library/react";
import type RAFT from "@robotical/webapp-types/dist-types/src/application/RAFTs/RAFT";
import GraphArea from ".";

jest.mock("@robotical/webapp-types/dist-types/src/types/raft", () => ({
  RaftTypeE: {
    COG: "Cog",
    MARTY: "Marty",
  },
}));
jest.mock("../../utils/get-addons-list", () => () => []);
jest.mock("../../app-bridge/MartyInterface", () => jest.fn());
jest.mock("../../app-bridge/CogInterface", () => jest.fn());
jest.mock("../../app-bridge/mocks/MockMartyInterface", () => jest.fn());
jest.mock("../../app-bridge/mocks/MockCogInterface", () => jest.fn());
jest.mock("../../mock/MockApplicationManager", () => ({
  isMockRaft: () => false,
}));
jest.mock("../AddonsList", () => () => <div />);
jest.mock("../Graph", () => () => <div />);
jest.mock("../GraphControls", () => () => <div />);
jest.mock("react-csv", () => ({
  CSVLink: ({ children }: { children: React.ReactNode }) => <a href="#csv">{children}</a>,
}));

describe("GraphArea", () => {
  it("labels the graph with its device name", () => {
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
  });
});
