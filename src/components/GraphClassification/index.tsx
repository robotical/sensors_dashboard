import { GraphDataType, TraceIdType } from "../GraphArea";
import Plot from "react-plotly.js";

interface GraphClassificationProps {
  data: GraphDataType;
}

export default function GraphClassification({ data }: GraphClassificationProps) {
    
  const traces: any[] = [];
  for (const traceKey in data) {
    try {
      const traceY0 = {
        y: data[traceKey as TraceIdType].x,
        type: 'box',
        name: traceKey.split("=>")[1],// + "True",
        marker: {color: "green"}
      };
      const traceY1 = {
        y: data[traceKey as TraceIdType].y,
        type: 'box',
        name: traceKey.split("=>")[1],// + "False",
        marker: {color: "red"}
      }
      traces.push(traceY0);
      traces.push(traceY1);
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
