import { createElement, useCallback, useEffect, useRef, useState } from "react";
import GraphArea from "../GraphArea";
import styles from "./styles.module.css";
import {
  FaPlus,
  FaChartLine,
  FaPlug,
  FaCheckCircle,
  FaUnlink,
} from "react-icons/fa";
import MicroBitIcon from "../../assets/connect-button/microbit-small.svg";
import modalState from "../../state-observables/modal/ModalState";
import NewGraphModal from "../modals/NewGraphModal";
import RAFT from "@robotical/webapp-types/dist-types/src/application/RAFTs/RAFT";
import { resolveRaftDisplayName } from "../../utils/raft-display-name";
import MicroBitWebBluetooth, {
  isMicroBitDevice,
  isMicroBitWebBluetoothSupported,
} from "../../microbit/MicroBitWebBluetooth";

interface GraphObj {
  graphId: string;
  element: React.ReactNode;
}

type Props = {
  mainRef: React.RefObject<HTMLDivElement>;
}

type ConnectionPhase = "idle" | "connecting" | "error";

function MainContent({ mainRef }: Props) {
  const [hasConnectedRafts, setHasConnectedRafts] = useState(false);
  const [connectionPhase, setConnectionPhase] = useState<ConnectionPhase>("idle");
  const [connectionMessage, setConnectionMessage] = useState("");
  const [microBit, setMicroBit] = useState<MicroBitWebBluetooth | null>(null);
  const [microBitPhase, setMicroBitPhase] = useState<ConnectionPhase>("idle");
  const [microBitMessage, setMicroBitMessage] = useState("");
  const [, triggerRerender] = useState(0);
  const graphs = useRef<GraphObj[]>([]);
  const graphSubRefs = useRef<Record<string, () => void>>({});
  const microBitRef = useRef<MicroBitWebBluetooth | null>(null);
  const pendingMicroBitRef = useRef<MicroBitWebBluetooth | null>(null);
  const microBitDisconnectCleanup = useRef<(() => void) | null>(null);
  const isMounted = useRef(true);
  const isConnected = hasConnectedRafts || Boolean(microBit);
  const canConnectMicroBit = isMicroBitWebBluetoothSupported();

  const removeGraph = (graphId: string) => {
    const cleanup = graphSubRefs.current[graphId];
    if (cleanup) {
      cleanup();
      delete graphSubRefs.current[graphId];
    }
    const graphsUpdated = graphs.current.filter((graph) => graph.graphId !== graphId);
    graphs.current = graphsUpdated;
    triggerRerender(old => old + 1);
  };

  const syncConnectionState = useCallback(() => {
    const connectedRafts = window.applicationManager?.connectedRafts || {};
    const connected = Object.keys(connectedRafts).length > 0;
    setHasConnectedRafts(connected);
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

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      Object.values(graphSubRefs.current).forEach((cleanup) => cleanup());
      graphSubRefs.current = {};
      microBitDisconnectCleanup.current?.();
      microBitDisconnectCleanup.current = null;
      microBitRef.current?.disconnect();
      pendingMicroBitRef.current?.disconnect();
      microBitRef.current = null;
      pendingMicroBitRef.current = null;
    };
  }, []);

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

  const connectMicroBit = async () => {
    if (!isMicroBitWebBluetoothSupported()) {
      setMicroBitPhase("error");
      setMicroBitMessage("Web Bluetooth is not available in this browser.");
      return;
    }
    if (microBitRef.current?.isConnected() || pendingMicroBitRef.current) {
      return;
    }

    const candidate = new MicroBitWebBluetooth();
    pendingMicroBitRef.current = candidate;
    setMicroBitPhase("connecting");
    setMicroBitMessage("Choose your micro:bit in the Bluetooth window.");

    try {
      await candidate.connect();
      if (!isMounted.current || pendingMicroBitRef.current !== candidate) {
        candidate.disconnect();
        return;
      }
      if (!candidate.isConnected()) {
        throw new Error("The micro:bit disconnected while connecting.");
      }

      const unsubscribeDisconnect = candidate.addDisconnectListener(
        (disconnectedMicroBit) => {
          if (microBitRef.current !== disconnectedMicroBit) return;
          microBitDisconnectCleanup.current?.();
          microBitDisconnectCleanup.current = null;
          microBitRef.current = null;
          if (isMounted.current) {
            setMicroBit(null);
            setMicroBitPhase("idle");
            setMicroBitMessage("micro:bit disconnected.");
          }
        }
      );
      microBitDisconnectCleanup.current = unsubscribeDisconnect;
      microBitRef.current = candidate;
      setMicroBit(candidate);
      setMicroBitPhase("idle");
      setMicroBitMessage("");
    } catch (error) {
      if (!isMounted.current) return;
      const wasCancelled =
        (error as { name?: string } | null)?.name === "NotFoundError";
      setMicroBitPhase(wasCancelled ? "idle" : "error");
      setMicroBitMessage(
        wasCancelled
          ? "No micro:bit was selected."
          : "Could not connect. Check that the micro:bit is powered on and running the Robotical firmware."
      );
    } finally {
      if (pendingMicroBitRef.current === candidate) {
        pendingMicroBitRef.current = null;
      }
    }
  };

  const disconnectMicroBit = () => {
    const connectedMicroBit = microBitRef.current;
    if (!connectedMicroBit) return;

    microBitDisconnectCleanup.current?.();
    microBitDisconnectCleanup.current = null;
    microBitRef.current = null;
    setMicroBit(null);
    setMicroBitPhase("idle");
    setMicroBitMessage("micro:bit disconnected.");
    connectedMicroBit.disconnect();
  };

  const addGraphHandler = async () => {
    const deviceId = await modalState.setModal(
      createElement(NewGraphModal, { microBit }),
      "Add new graph"
    );
    if (!deviceId) {
      return;
    }
    const device =
      microBit?.id === deviceId
        ? microBit
        : window.applicationManager?.connectedRafts?.[deviceId];
    if (!device) {
      return;
    }
    if (isMicroBitDevice(device) && !device.isConnected()) {
      setMicroBitMessage("The micro:bit disconnected before the graph was created.");
      return;
    }
    const deviceName = isMicroBitDevice(device)
      ? device.getFriendlyName()
      : await resolveRaftDisplayName(
          device,
          window.applicationManager?.connectedRaftsContext || []
        );

    const graphsUpdated = [...graphs.current];
    const GRAPH_ID = new Date().getTime().toString();

    const disconnectCb = () => {
      removeGraph(GRAPH_ID);
    };
    if (isMicroBitDevice(device)) {
      graphSubRefs.current[GRAPH_ID] = device.addDisconnectListener(disconnectCb);
    } else {
      const mgr = getOrCreateRaftDisconnectManager(deviceId, device);
      mgr.subscribe(disconnectCb);
      graphSubRefs.current[GRAPH_ID] = () => mgr.unsubscribe(disconnectCb);
    }

    graphsUpdated.push({
      graphId: GRAPH_ID,
      element: (
        <GraphArea
          raft={device}
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
            Pair Marty, Cog, or a micro:bit, then choose the signals you want to turn into a live graph.
          </p>
          <div className={styles.connectActions}>
            <button
              type="button"
              className={styles.connectButton}
              onClick={connectRobot}
              disabled={connectionPhase === "connecting"}
            >
              <FaPlug aria-hidden="true" />
              <span>{connectionPhase === "connecting" ? "Connecting…" : "Connect Marty or Cog"}</span>
            </button>
            <button
              type="button"
              className={`${styles.connectButton} ${styles.secondaryButton}`}
              onClick={connectMicroBit}
              disabled={microBitPhase === "connecting"}
              title={!canConnectMicroBit ? "Web Bluetooth is unavailable" : undefined}
            >
              <img
                src={MicroBitIcon}
                alt=""
                aria-hidden="true"
                className={styles.microBitButtonIcon}
              />
              <span>{microBitPhase === "connecting" ? "Connecting…" : "Connect micro:bit"}</span>
            </button>
          </div>
          {connectionMessage && (
            <p
              className={`${styles.connectionFeedback} ${connectionPhase === "error" ? styles.connectionError : ""}`}
              role={connectionPhase === "error" ? "alert" : "status"}
              aria-live="polite"
            >
              {connectionMessage}
            </p>
          )}
          {microBitMessage && (
            <p
              className={`${styles.connectionFeedback} ${microBitPhase === "error" ? styles.connectionError : ""}`}
              role={microBitPhase === "error" ? "alert" : "status"}
              aria-live="polite"
            >
              {microBitMessage}
            </p>
          )}
        </div>
        <ol className={styles.quickJourney} aria-label="Dashboard setup steps">
          <li>
            <span>1</span>
            <div><strong>Connect</strong><small>Pair Marty, Cog, or micro:bit.</small></div>
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
            <FaCheckCircle aria-hidden="true" /> Device connected
          </p>
          <h2>Graphs</h2>
          <p>{hasGraphs ? `${graphs.current.length} live workspace${graphs.current.length === 1 ? "" : "s"}` : "Create a graph to begin exploring sensor data."}</p>
        </div>
        <div className={styles.toolbarActions}>
          {microBit ? (
            <button
              type="button"
              onClick={disconnectMicroBit}
              className={styles.deviceActionButton}
            >
              <FaUnlink aria-hidden="true" />
              <span>Disconnect {microBit.getFriendlyName()}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={connectMicroBit}
              className={styles.deviceActionButton}
              disabled={microBitPhase === "connecting"}
              title={!canConnectMicroBit ? "Web Bluetooth is unavailable" : undefined}
            >
              <img
                src={MicroBitIcon}
                alt=""
                aria-hidden="true"
                className={styles.microBitButtonIcon}
              />
              <span>{microBitPhase === "connecting" ? "Connecting…" : "Connect micro:bit"}</span>
            </button>
          )}
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
      </div>
      {microBitMessage && (
        <p
          className={`${styles.toolbarFeedback} ${microBitPhase === "error" ? styles.connectionError : ""}`}
          role={microBitPhase === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          {microBitMessage}
        </p>
      )}
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
            <p>Select <strong>Add graph</strong>, choose a device, then pick one or more signals.</p>
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
