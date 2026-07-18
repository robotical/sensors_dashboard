import { createElement, useCallback, useEffect, useRef, useState } from "react";
import GraphArea from "../GraphArea";
import styles from "./styles.module.css";
import { FaPlus, FaChartLine, FaPlug, FaCheckCircle } from "react-icons/fa";
import modalState from "../../state-observables/modal/ModalState";
import NewGraphModal from "../modals/NewGraphModal";
import RAFT from "@robotical/webapp-types/dist-types/src/application/RAFTs/RAFT";
import { resolveRaftDisplayName } from "../../utils/raft-display-name";

interface GraphObj {
  graphId: string;
  element: React.ReactNode;
}

type Props = {
  mainRef: React.RefObject<HTMLDivElement>;
}

type ConnectionPhase = "idle" | "connecting" | "error";

function MainContent({ mainRef }: Props) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionPhase, setConnectionPhase] = useState<ConnectionPhase>("idle");
  const [connectionMessage, setConnectionMessage] = useState("");
  const [, triggerRerender] = useState(0);
  // Track per-graph disconnect callbacks to allow cleanup when a graph is removed manually
  const graphSubRefs = useRef<Record<string, { raftId: string; callback: () => void }>>({});

  const removeGraph = (graphId: string) => {
    // If this graph had a disconnect callback, unsubscribe it to avoid leaks
    const subRef = graphSubRefs.current[graphId];
    if (subRef) {
      const mgr = getRaftDisconnectManagerIfExists(subRef.raftId);
      if (mgr) {
        mgr.unsubscribe(subRef.callback);
      }
      delete graphSubRefs.current[graphId];
    }
    const graphsUpdated = graphs.current.filter((graph) => graph.graphId !== graphId);
    graphs.current = graphsUpdated;
    triggerRerender(old => old + 1);
  };

  const graphs = useRef<GraphObj[]>([]);

  const syncConnectionState = useCallback(() => {
    const connectedRafts = window.applicationManager?.connectedRafts || {};
    const connected = Object.keys(connectedRafts).length > 0;
    setIsConnected(connected);
    if (connected) {
      setConnectionPhase("idle");
      setConnectionMessage("");
    }
    return connected;
  }, []);

  useEffect(() => {
    syncConnectionState();
    const connectedRaftInterval = setInterval(() => {
      syncConnectionState();
    }, 750);
    return () => {
      clearInterval(connectedRaftInterval);
    }
  }, [syncConnectionState]);

  const connectRobot = async () => {
    if (!window.applicationManager) {
      setConnectionPhase("error");
      setConnectionMessage("Device connections are not available in this view.");
      return;
    }

    setConnectionPhase("connecting");
    setConnectionMessage("Choose your device in the connection window.");

    try {
      await window.applicationManager.connectGeneric(() => {
        syncConnectionState();
      });
      const connected = syncConnectionState();
      if (!connected) {
        setConnectionPhase("idle");
        setConnectionMessage("No device was connected. You can try again when you are ready.");
      }
    } catch (error) {
      console.error("Unable to connect robot", error);
      setConnectionPhase("error");
      setConnectionMessage("We could not connect to the device. Please try again.");
    }
  };

  const addGraphHandler = async () => {
    const raftId = await modalState.setModal(createElement(NewGraphModal, {}), "Add new graph");
    if (!raftId) {
      return;
    }
    const raft = window.applicationManager.connectedRafts[raftId];
    if (!raft) {
      return;
    }
    const deviceName = await resolveRaftDisplayName(
      raft,
      window.applicationManager.connectedRaftsContext || []
    );

    const graphsUpdated = [...graphs.current];
    const GRAPH_ID = new Date().getTime().toString();

    // Subscribe (one shared subscription per raft) to remove this graph when the raft disconnects
    console.log("Registering disconnect fan-out for raft to remove the graph if it disconnects");
    const mgr = getOrCreateRaftDisconnectManager(raftId, raft);
    const disconnectCb = () => {
      console.log("Raft disconnected, removing graph", GRAPH_ID);
      removeGraph(GRAPH_ID);
    };
    mgr.subscribe(disconnectCb);
    graphSubRefs.current[GRAPH_ID] = { raftId, callback: disconnectCb };


    graphsUpdated.push({
      graphId: GRAPH_ID,
      element: (
        <GraphArea
          raft={raft}
          deviceName={deviceName}
          mainRef={mainRef}
          graphId={GRAPH_ID}
          removeGraph={removeGraph}
          key={GRAPH_ID}
        />
      ),
    });
    graphs.current = graphsUpdated;
    triggerRerender(old => old + 1);
  };

  if (!isConnected) {
    return (
      <section className={styles.connectEmptyState} aria-labelledby="connect-empty-title">
        <div className={styles.connectEmptyHero}>
          <div className={styles.emptyStateIcon} aria-hidden="true">
            <FaPlug />
          </div>
          <p className={styles.emptyStateEyebrow}>Start here</p>
          <h2 id="connect-empty-title">Connect a device to see its sensors</h2>
          <p className={styles.emptyStateDescription}>
            Pair Marty or Cog, then choose the signals you want to turn into a live graph.
          </p>
          <button
            type="button"
            className={styles.connectButton}
            onClick={connectRobot}
            disabled={connectionPhase === "connecting"}
          >
            <FaPlug aria-hidden="true" />
            <span>{connectionPhase === "connecting" ? "Connecting…" : "Connect device"}</span>
          </button>
          {connectionMessage && (
            <p
              className={`${styles.connectionFeedback} ${connectionPhase === "error" ? styles.connectionError : ""}`}
              role={connectionPhase === "error" ? "alert" : "status"}
              aria-live="polite"
            >
              {connectionMessage}
            </p>
          )}
        </div>
        <ol className={styles.quickJourney} aria-label="Dashboard setup steps">
          <li>
            <span>1</span>
            <div><strong>Connect</strong><small>Pair Marty or Cog.</small></div>
          </li>
          <li>
            <span>2</span>
            <div><strong>Add a graph</strong><small>Choose the connected device.</small></div>
          </li>
          <li>
            <span>3</span>
            <div><strong>Pick signals</strong><small>Start recording live data.</small></div>
          </li>
        </ol>
      </section>
    );
  }

  const hasGraphs = graphs.current.length > 0;

  return (
    <div className={styles.mainContent}>
      <div className={styles.graphsToolbar}>
        <div>
          <p className={styles.toolbarEyebrow}>
            <FaCheckCircle aria-hidden="true" /> Robot connected
          </p>
          <h2>Graphs</h2>
          <p>{hasGraphs ? `${graphs.current.length} live workspace${graphs.current.length === 1 ? "" : "s"}` : "Create a graph to begin exploring sensor data."}</p>
        </div>
        <button
          type="button"
          onClick={addGraphHandler}
          className={styles.addGraphBtn}
        >
          <FaPlus aria-hidden="true" />
          <span>Add graph</span>
          <FaChartLine aria-hidden="true" />
        </button>
      </div>
      <div className={styles.graphsArea}>
        {graphs.current.map((graphArea) => {
          return graphArea.element;
        })}
      </div>
      {!hasGraphs && (
        <section className={styles.addNewGraphMessage} aria-labelledby="add-first-graph-title">
          <FaChartLine aria-hidden="true" />
          <div>
            <p className={styles.emptyStateEyebrow}>Your workspace is ready</p>
            <h3 id="add-first-graph-title">Build your first live graph</h3>
            <p>Select <strong>Add graph</strong>, choose a robot, then pick one or more signals.</p>
          </div>
        </section>
      )}
    </div>
  );
}

export default MainContent;



type ObserverType = {
  notify: (eventType: string, eventEnum: any, eventName: string, eventData: any) => void;
};

type RaftDisconnectManager = {
  subscribe: (cb: () => void) => void;
  unsubscribe: (cb: () => void) => void;
};

// One subscription per raft, with fan-out to all registered graph callbacks
const raftManagers: Record<string, { callbacks: Set<() => void>; observer: ObserverType; raft: RAFT }> = {};

const getOrCreateRaftDisconnectManager = (raftId: string, raft: RAFT): RaftDisconnectManager => {
  if (!raftManagers[raftId]) {
    const callbacks = new Set<() => void>();
    const observer: ObserverType = {
      notify(eventType: string, eventEnum: any) {
        switch (eventType) {
          case "conn":
            switch (eventEnum) {
              case 3: // BLE_DISCONNECTED
                console.log("Marty Disconnected (fan-out)!!!!!!!!!");
                // Copy to avoid mutation during iteration
                const toCall = Array.from(callbacks);
                callbacks.clear();
                toCall.forEach((cb) => {
                  try { cb(); } catch (e) { console.error(e); }
                });
                // Tear down subscription for this raft
                raft.unsubscribe(observer);
                delete raftManagers[raftId];
                break;
              default:
                break;
            }
            break;
          default:
            break;
        }
      },
    };
    raft.subscribe(observer, ["conn"]);
    raftManagers[raftId] = { callbacks, observer, raft };
  }
  return {
    subscribe: (cb: () => void) => {
      raftManagers[raftId].callbacks.add(cb);
    },
    unsubscribe: (cb: () => void) => {
      const mgr = raftManagers[raftId];
      if (!mgr) return;
      mgr.callbacks.delete(cb);
      if (mgr.callbacks.size === 0) {
        // No more listeners; clean up subscription
        mgr.raft.unsubscribe(mgr.observer);
        delete raftManagers[raftId];
      }
    },
  };
};

const getRaftDisconnectManagerIfExists = (raftId: string): RaftDisconnectManager | null => {
  const mgr = raftManagers[raftId];
  if (!mgr) return null;
  return {
    subscribe: (cb: () => void) => mgr.callbacks.add(cb),
    unsubscribe: (cb: () => void) => {
      mgr.callbacks.delete(cb);
      if (mgr.callbacks.size === 0) {
        mgr.raft.unsubscribe(mgr.observer);
        delete raftManagers[raftId];
      }
    },
  };
};
