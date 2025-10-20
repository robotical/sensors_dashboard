import { NewRobotIdE, type ConnectedRaftItem } from "@robotical/webapp-types/dist-types/src/store/SelectedRaftContext";
import { RaftTypeE } from "@robotical/webapp-types/dist-types/src/types/raft";
import type RAFT from "@robotical/webapp-types/dist-types/src/application/RAFTs/RAFT";
import type { ApplicationManager } from "@robotical/webapp-types/dist-types/types-package/application-manager";

type MockObserver = {
  notify: (eventType: string, eventEnum: any, eventName: string, eventData: any) => void;
};

export type MockRaft = RAFT & {
  name: string;
  isMock: true;
  mockRobotType: "marty" | "cog";
  subscribe(observer: MockObserver, topics: Array<string>): void;
  unsubscribe(observer: MockObserver): void;
  emit(eventType: string, eventEnum: any, eventName: string, eventData: any): void;
  getBatteryStrength(): number;
  getRSSI(): number;
  getRaftName(): Promise<string>;
};

const createMockRaftId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const mutateNumber = (value: number, min: number, max: number, maxDelta: number) => {
  const delta = (Math.random() * 2 - 1) * maxDelta;
  const next = value + delta;
  return Math.round(clamp(next, min, max));
};

const createMockRaft = (type: RaftTypeE, name: string) => {
  const observers = new Map<string, Set<MockObserver>>();
  const robotType: "marty" | "cog" = type === RaftTypeE.MARTY ? "marty" : "cog";
  let batteryLevel = type === RaftTypeE.MARTY ? 82 : 88;
  let rssiLevel = -60;

  const raft: MockRaft = {
    id: createMockRaftId(robotType),
    type,
    name,
    isMock: true,
    mockRobotType: robotType,
    subscribe(observer: MockObserver, topics: Array<string>) {
      topics.forEach((topic) => {
        if (!observers.has(topic)) {
          observers.set(topic, new Set());
        }
        observers.get(topic)!.add(observer);
      });
    },
    unsubscribe(observer: MockObserver) {
      observers.forEach((set) => {
        set.delete(observer);
      });
    },
    emit(eventType: string, eventEnum: any, eventName: string, eventData: any) {
      const observersForTopic = observers.get(eventType);
      if (!observersForTopic) return;
      observersForTopic.forEach((observer) => {
        try {
          observer.notify(eventType, eventEnum, eventName, eventData);
        } catch (error) {
          console.error("[MockRaft] Observer notify failed", error);
        }
      });
    },
    getBatteryStrength() {
      batteryLevel = mutateNumber(batteryLevel, 40, 100, 3);
      return batteryLevel;
    },
    getRSSI() {
      rssiLevel = mutateNumber(rssiLevel, -90, -45, 4);
      return rssiLevel;
    },
    async getRaftName() {
      return name;
    },
    // The following are stubs to satisfy consumers that might call them.
    getRaftVersion() {
      return "mock-1.0.0";
    },
    getSerialNumber() {
      return "MOCK-RA0B0T";
    },
    getFriendlyName() {
      return name;
    },
  } as unknown as MockRaft;

  return raft;
};

export const isMockRaft = (raft: RAFT): raft is MockRaft =>
  Boolean((raft as Partial<MockRaft>).isMock);

export default class MockApplicationManager {
  connectedRafts: Record<string, RAFT> = {};
  connectedRaftsContext: ConnectedRaftItem[] = [
    {
      id: NewRobotIdE.NEW,
      name: "Connect a robot",
      type: RaftTypeE.MARTY,
      isSelected: false,
    },
  ];

  private mockCounters = {
    marty: 1,
    cog: 1,
  };

  private mockTypeOrder: RaftTypeE[] = [RaftTypeE.MARTY, RaftTypeE.COG];
  private nextTypeIndex = 0;

  async connectGeneric(afterRaftConnectedCb?: (raft: RAFT) => void): Promise<void> {
    const type = this.mockTypeOrder[this.nextTypeIndex % this.mockTypeOrder.length];
    this.nextTypeIndex += 1;

    const name =
      type === RaftTypeE.MARTY
        ? `Mock Marty ${this.mockCounters.marty++}`
        : `Mock Cog ${this.mockCounters.cog++}`;
    const raft = createMockRaft(type, name);
    this.connectedRafts[raft.id] = raft;
    this.refreshConnectedContext(raft.id);
    afterRaftConnectedCb?.(raft);
  }

  async disconnectGeneric(raft: RAFT, afterRaftDisconnectedCb?: () => void): Promise<void> {
    const mockRaft = raft as MockRaft;
    delete this.connectedRafts[mockRaft.id];
    mockRaft.emit("conn", 3, "BLE_DISCONNECTED", null);
    this.refreshConnectedContext();
    afterRaftDisconnectedCb?.();
  }

  private refreshConnectedContext(selectedId?: string) {
    const baseEntry: ConnectedRaftItem = {
      id: NewRobotIdE.NEW,
      name: "Connect a robot",
      type: RaftTypeE.MARTY,
      isSelected: false,
    };
    const connectedEntries = Object.values(this.connectedRafts).map((raft, index) => {
      const typedRaft = raft as MockRaft;
      return {
        id: typedRaft.id,
        name: typedRaft.name,
        type: typedRaft.type,
        isSelected: selectedId ? typedRaft.id === selectedId : index === 0,
      };
    });
    this.connectedRaftsContext = [baseEntry, ...connectedEntries];
  }
}

export const setupMockEnvironment = () => {
  if (typeof window === "undefined") return;
  if (window.applicationManager) return;
  const mockManager = new MockApplicationManager();
  window.applicationManager = mockManager as unknown as ApplicationManager;
  console.info("[MockApplicationManager] No application manager detected, using mock robots.");
};
