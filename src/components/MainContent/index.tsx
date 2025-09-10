import { createElement, useEffect, useRef, useState } from "react";
import GraphArea from "../GraphArea";
import styles from "./styles.module.css";
import { FaPlus, FaChartLine } from "react-icons/fa";
import { Tooltip } from "@mui/material";
import modalState from "../../state-observables/modal/ModalState";
import NewGraphModal from "../modals/NewGraphModal";
import RAFT from "@robotical/webapp-types/dist-types/src/application/RAFTs/RAFT";

interface GraphObj {
  graphId: string;
  element: React.ReactNode;
}

type Props = {
  mainRef: React.RefObject<HTMLDivElement>;
}

function MainContent({ mainRef }: Props) {
  const [isConnected, setIsConnected] = useState(false);
  const connectedRaftsLength = useRef(0);
  const refresh = useState(0)[1];
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
    refresh(old => old + 1);
  };

  const graphs = useRef<GraphObj[]>([]);

  useEffect(() => {
    const connectedRaftInterval = setInterval(() => {
      const allConnectedRafts = window.applicationManager?.connectedRafts || {};
      if (connectedRaftsLength.current !== Object.keys(allConnectedRafts).length) {
        connectedRaftsLength.current = Object.keys(allConnectedRafts).length;
        refresh(old => old + 1);
      }
      if (!allConnectedRafts) {
        setIsConnected(false);
        return;
      }
      setIsConnected(Object.keys(allConnectedRafts).length > 0);
    }, 2000);
    return () => {
      clearInterval(connectedRaftInterval);
    }
  }, []);
  const addGraphHandler = async () => {
    const raftId = await modalState.setModal(createElement(NewGraphModal, {}), "Add new graph");
    if (!raftId) {
      return;
    }
    const raft = window.applicationManager.connectedRafts[raftId];
    if (!raft) {
      return;
    }

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
          raft={window.applicationManager.connectedRafts[raftId]}
          mainRef={mainRef}
          graphId={GRAPH_ID}
          removeGraph={removeGraph}
          key={GRAPH_ID}
        />
      ),
    });
    graphs.current = graphsUpdated;
    refresh(old => old + 1);
  };

  if (!isConnected) {
    return <div className={styles.martyConnectedFallback}>Please connect a robot first</div>;
  }

  return (
    <>
      <div className={styles.graphsArea}>
        {graphs.current.map((graphArea) => {
          return graphArea.element;
        })}
      </div>
      <div className={[styles.addGraphBtnContainer, graphs.current.length === 0 ? styles.buttonMiddleOfScreen : ""].join(" ")}>
        <Tooltip title="Add new graph">
          <div
            onClick={addGraphHandler}
            className={styles.addGraphBtn}
            data-tooltip-id="add-new-graph-tootltip"
            data-tooltip-content="Add new graph"
          >
            <FaPlus /><FaChartLine />
          </div>
        </Tooltip>
      </div>
      {graphs.current.length === 0 && <div className={styles.addNewGraphMessage}>Add a new graph to start</div>}
    </>
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
