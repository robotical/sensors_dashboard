import { useState } from "react";
import GraphArea from "../GraphArea";

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
      element: <GraphArea graphId={GRAPH_ID} removeGraph={removeGraph} key={GRAPH_ID}/>,
    });
    setGraphs(graphsUpdated);
  };

  return (
    <>
      {graphs.map((graphArea) => {
        return graphArea.element;
      })}
      <div onClick={addGraphHandler}>Add Graph</div>
    </>
  );
}
