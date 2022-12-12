import { GraphDataType, TraceData, TraceIdType } from "../GraphArea";
import styles from "./styles.module.css";
import Plot from "react-plotly.js";
import { motorPosDifferentiation, rgbColorTraceName } from "../../utils/graph/trace-name";

interface GraphProps {
  data: GraphDataType;
  maxDataXValue: number;
  autoScrollEnabled: boolean;
}

export default function Graph({ data, maxDataXValue, autoScrollEnabled}: GraphProps) {
  const traces: TraceData[] = [];
  for (const traceKey in data) {
    try {
      const traceName = motorPosDifferentiation(traceKey);
      const trace = {
        x: data[traceKey as TraceIdType].x,
        y: data[traceKey as TraceIdType].y,
        type: "scatter",
        mode: "lines",
        name: traceName,
        line: {
          color: rgbColorTraceName(traceName)
        }
      };
      traces.push(trace);
    } catch (e) {}
  }
  return (
    <Plot
      style={{justifySelf: "center", maxWidth: "66vw"}}
      key={new Date().getTime()}
      data={traces}
      layout={{
        xaxis: {
          linecolor: "black",
          linewidth: 2,
          mirror: true,
          zeroline: false,
          showgrid: false,
          title: "Time (seconds)",
          range: (maxDataXValue > 50 && autoScrollEnabled) ? [maxDataXValue -50, maxDataXValue] : [],
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
