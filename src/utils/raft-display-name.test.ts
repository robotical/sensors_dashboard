import type RAFT from "@robotical/webapp-types/dist-types/src/application/RAFTs/RAFT";
import type { ConnectedRaftItem } from "@robotical/webapp-types/dist-types/src/store/SelectedRaftContext";
import { resolveRaftDisplayName } from "./raft-display-name";

const makeRaft = ({
  id = "raft-1",
  friendlyName,
  raftName = "Runtime name",
  getRaftName = jest.fn().mockResolvedValue(raftName),
}: {
  id?: string;
  friendlyName?: string;
  raftName?: string;
  getRaftName?: jest.Mock;
} = {}) =>
  ({
    id,
    getFriendlyName: () => friendlyName,
    getRaftName,
  } as unknown as RAFT);

describe("resolveRaftDisplayName", () => {
  it("uses the name displayed in the connected-device picker", async () => {
    const raft = makeRaft({ friendlyName: "Friendly name" });
    const connectedRafts = [
      { id: "raft-1", name: "Classroom Marty" },
    ] as ConnectedRaftItem[];

    await expect(resolveRaftDisplayName(raft, connectedRafts)).resolves.toBe(
      "Classroom Marty"
    );
  });

  it("falls back through the RAFT names and then its id", async () => {
    const friendlyRaft = makeRaft({ friendlyName: "  Friendly Marty  " });
    await expect(resolveRaftDisplayName(friendlyRaft, [])).resolves.toBe(
      "Friendly Marty"
    );

    const runtimeRaft = makeRaft({ raftName: "  Runtime Marty  " });
    await expect(resolveRaftDisplayName(runtimeRaft, [])).resolves.toBe(
      "Runtime Marty"
    );

    const unidentifiedRaft = makeRaft({
      getRaftName: jest.fn().mockRejectedValue(new Error("Unavailable")),
    });
    await expect(resolveRaftDisplayName(unidentifiedRaft, [])).resolves.toBe(
      "raft-1"
    );
  });
});
