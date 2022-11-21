import { GraphDataType, TraceData } from "../GraphArea";
import styles from "./styles.module.css";
import Plot from "react-plotly.js";

interface GraphProps {
  data: GraphDataType;
}

export default function Graph({ data }: GraphProps) {
  const traces: TraceData[] = [];
  for (const traceKey in data) {
    try {
      const trace = {
        x: data[traceKey].x,
        y: data[traceKey].y,
        type: "scatter",
        mode: "lines",
      };
      traces.push(trace);
    } catch (e) {}
  }
  console.log(traces);
  return (
    <Plot
    key={new Date().getTime()}
      data={traces}
      layout={{ width: 320, height: 240}}
    />
  );
}
