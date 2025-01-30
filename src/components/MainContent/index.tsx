import { createElement, useEffect, useRef, useState } from "react";
import GraphArea from "../GraphArea";
import styles from "./styles.module.css";
import { FaPlus, FaChartLine } from "react-icons/fa";
import { Tooltip } from "@mui/material";
import modalState from "../../state-observables/modal/ModalState";
import NewGraphModal from "../modals/NewGraphModal";

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

  const removeGraph = (graphId: string) => {
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
    const graphsUpdated = [...graphs.current];
    const GRAPH_ID = new Date().getTime().toString();
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
