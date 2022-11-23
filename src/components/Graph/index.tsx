import { GraphDataType, TraceData } from "../GraphArea";
import styles from "./styles.module.css";
import Plot from "react-plotly.js";

interface GraphProps {
  data: GraphDataType;
  maxDataLen: number;
  autoScrollEnabled: boolean;
}

export default function Graph({ data, maxDataLen, autoScrollEnabled}: GraphProps) {
    
  const traces: TraceData[] = [];
  for (const traceKey in data) {
    try {
      const trace = {
        x: data[traceKey].x,
        y: data[traceKey].y,
        type: "scatter",
        mode: "lines",
        name: traceKey
      };
      traces.push(trace);
    } catch (e) {}
  }
  return (
    <Plot
      key={new Date().getTime()}
      data={traces}
      layout={{
        xaxis: {
          linecolor: "black",
          linewidth: 2,
          mirror: true,
          zeroline: false,
          showgrid: false,
          title: "Time",
          range: (maxDataLen > 10 && autoScrollEnabled) ? [maxDataLen -10, maxDataLen] : [],
        },
        yaxis: {
          linecolor: "black",
          linewidth: 2,
          mirror: true,
          zeroline: false,
          showgrid: false,
          title: "Sensor value"
        },
        margin: {
          l: 50,
          r: 50,
          b: 50,
          t: 50,
          pad: 4,
        },
        // plot_bgcolor: "#444",
        paper_bgcolor: "#eee",
      }}
    />
  );
}
