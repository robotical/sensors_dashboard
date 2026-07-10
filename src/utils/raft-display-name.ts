import type RAFT from "@robotical/webapp-types/dist-types/src/application/RAFTs/RAFT";
import type { ConnectedRaftItem } from "@robotical/webapp-types/dist-types/src/store/SelectedRaftContext";

const normaliseName = (name?: string) => name?.trim() || "";

export async function resolveRaftDisplayName(
  raft: RAFT,
  connectedRafts: ConnectedRaftItem[]
) {
  const connectedRaftName = normaliseName(
    connectedRafts.find((connectedRaft) => connectedRaft.id === raft.id)?.name
  );
  if (connectedRaftName) return connectedRaftName;

  const friendlyName = normaliseName(raft.getFriendlyName());
  if (friendlyName) return friendlyName;

  try {
    const raftName = normaliseName(await raft.getRaftName());
    if (raftName) return raftName;
  } catch {
    // The graph can still be identified by its stable RAFT id.
  }

  return raft.id;
}
