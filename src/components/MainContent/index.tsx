import { useEffect, useRef, useState } from "react";
import mv2Dashboard from "../../app-bridge/mv2-rn";
import GraphArea from "../GraphArea";
import styles from "./styles.module.css";
import { FaPlus, FaChartLine } from "react-icons/fa";

interface GraphObj {
  graphId: string;
  element: React.ReactNode;
}

type Props = {
  mainRef: React.RefObject<HTMLDivElement>;
}

export default function MainContent({ mainRef }: Props) {
  const [isConnected, setIsConnected] = useState(mv2Dashboard.isConnected);
  const [isConnecting, setIsConnecting] = useState(mv2Dashboard.isConnecting);
  const refresh = useState(0)[1];

  const removeGraph = (graphId: string) => {
    const graphsUpdated = graphs.current.filter((graph) => graph.graphId !== graphId);
    graphs.current = graphsUpdated;
    refresh(old => old+1);
  };

  const graphs = useRef<GraphObj[]>([
    {
      graphId: "GRAPH_ID",
      element: (
        <GraphArea
          mainRef={mainRef}
          graphId={"GRAPH_ID"}
          removeGraph={removeGraph}
          key={"GRAPH_ID"}
        />
      ),
    },
  ]);

  useEffect(() => {
    mv2Dashboard.addEventListener(
      "onIsConnectedChange",
      "",
      onMartyConnectedChanged
    );
    mv2Dashboard.addEventListener(
      "onIsConnectingChange",
      "",
      onMartyConnectingChanged
    );
    return () => {
      mv2Dashboard.removeEventListener(
        "onIsConnectedChange",
        "",
        onMartyConnectedChanged
      );
      mv2Dashboard.removeEventListener(
        "onIsConnectingChange",
        "",
        onMartyConnectingChanged
      );
    };
  }, []);

  const onMartyConnectedChanged = () => {
    console.log("got connected event");
    setIsConnected(mv2Dashboard.isConnected);
  };

  const onMartyConnectingChanged = () => {
    console.log("got connecting event");
    setIsConnecting(mv2Dashboard.isConnecting);
  };

  const addGraphHandler = () => {
    const graphsUpdated = [...graphs.current];
    const GRAPH_ID = new Date().getTime().toString();
    graphsUpdated.push({
      graphId: GRAPH_ID,
      element: (
        <GraphArea
          mainRef={mainRef}
          graphId={GRAPH_ID}
          removeGraph={removeGraph}
          key={GRAPH_ID}
        />
      ),
    });
    graphs.current = graphsUpdated;
    refresh(old => old+1);
  };

  if (!isConnected || isConnecting) {
    if (isConnecting) {
      return <div className={styles.martyConnectedFallback}>Connecting...</div>;
    } else {
      return <div className={styles.martyConnectedFallback}>Please connect to your Marty first</div>;
    }
  }

  return (
    <>
      <div className={styles.graphsArea}>
        {graphs.current.map((graphArea) => {
          return graphArea.element;
        })}
      </div>
        <div className={styles.container}>
          <div onClick={addGraphHandler} className={styles.addGraphBtn}>
            <FaPlus /><FaChartLine />
          </div>
        </div>
    </>
  );
}
