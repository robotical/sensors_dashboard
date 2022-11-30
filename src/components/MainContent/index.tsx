import { useEffect, useRef, useState } from "react";
import mv2Dashboard from "../../app-bridge/mv2-rn";
import GraphArea from "../GraphArea";
import styles from "./styles.module.css";

interface GraphObj {
  graphId: string;
  element: React.ReactNode;
}

export default function MainContent() {
  const [isMartyConnected, setIsMartyConnected] = useState(false);
  const refresh = useState(0)[1];

  const removeGraph = (graphId: string) => {
    console.log(graphs.current);
    console.log(graphId);
    const graphsUpdated = graphs.current.filter((graph) => graph.graphId !== graphId);
    console.log(graphsUpdated);
    graphs.current = graphsUpdated;
    refresh(old => old+1);
  };

  const graphs = useRef<GraphObj[]>([
    {
      graphId: "GRAPH_ID",
      element: (
        <GraphArea
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
    return () => {
      mv2Dashboard.removeEventListener(
        "onIsConnectedChange",
        "",
        onMartyConnectedChanged
      );
    };
  }, []);

  const onMartyConnectedChanged = () => {
    setIsMartyConnected(mv2Dashboard.isConnected);
  };

  const addGraphHandler = () => {
    const graphsUpdated = [...graphs.current];
    const GRAPH_ID = new Date().getTime().toString();
    graphsUpdated.push({
      graphId: GRAPH_ID,
      element: (
        <GraphArea
          graphId={GRAPH_ID}
          removeGraph={removeGraph}
          key={GRAPH_ID}
        />
      ),
    });
    graphs.current = graphsUpdated;
    console.log(graphsUpdated);
    refresh(old => old+1);
  };

  if (!isMartyConnected) {
    return <div className={styles.martyConnectedFallback}>Please connect to your Marty first</div>;
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
            Add Graph
          </div>
        </div>
      )
    </>
  );
}
