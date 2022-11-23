import { useState } from "react";
import GraphArea from "../GraphArea";
import styles from "./styles.module.css";

interface GraphObj {
  graphId: string;
  element: React.ReactNode;
}

export default function MainContent() {
  const [graphs, setGraphs] = useState<GraphObj[]>([]);

  const removeGraph = (graphId: string) => {
    const graphsUpdated = graphs.filter((graph) => graph.graphId !== graphId);
    setGraphs(graphsUpdated);
  };

  const addGraphHandler = () => {
    const graphsUpdated = [...graphs];
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
    setGraphs(graphsUpdated);
  };

  return (
    <>
    <div className={styles.graphsArea}>
      {graphs.map((graphArea) => {
        return graphArea.element;
      })}
      </div>
      <div className={styles.container}>
        <div onClick={addGraphHandler} className={styles.addGraphBtn}>
          Add Graph
        </div>
      </div>
    </>
  );
}
