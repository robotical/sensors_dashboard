import { GraphDataType, TraceData, TraceIdType } from "../GraphArea";
import styles from "./styles.module.css";
import { motorPosDifferentiation, rgbColorTraceName } from "../../utils/graph/trace-name";
import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { AQUA_BLUE_025, MAIN_BLUE, PALE_WHITE } from "../../styles/colors";

interface GraphProps {
  data: GraphDataType;
  maxDataXValue: number;
  autoScrollEnabled: boolean;
  mainRef: React.RefObject<HTMLDivElement>;
}

export default function Graph({ data, maxDataXValue, autoScrollEnabled, mainRef }: GraphProps) {
  const [plotLayout, setPlotLayout] = useState<Partial<Plotly.Layout>>({
    showlegend: true,
    xaxis: {
      linecolor: MAIN_BLUE,
      linewidth: 2,
      mirror: true,
      zeroline: false,
      showgrid: true,
      gridcolor: AQUA_BLUE_025,
      title: {
        text: "Time (seconds)",
        font: {
          family: 'Lato Regular',
          size: 16,
          color: MAIN_BLUE
        }
      },
      tickfont: {
        family: 'Lato Regular',
        size: 12,
        color: MAIN_BLUE
      },
      range: (maxDataXValue > 50 && autoScrollEnabled) ? [maxDataXValue - 50, maxDataXValue] : [],
    },
    yaxis: {
      linecolor: MAIN_BLUE,
      linewidth: 2,
      mirror: true,
      zeroline: false,
      showgrid: true,
      gridcolor: AQUA_BLUE_025,
      title: {
        text: "Sensor value",
        font: {
          family: 'Lato Regular',
          size: 16,
          color: MAIN_BLUE
        }
      },
      tickfont: {
        family: 'Lato Regular',
        size: 12,
        color: MAIN_BLUE
      }
    },
    margin: {
      l: 60,
      r: 40,
      b: 60,
      t: 40,
      pad: 4,
    },
    plot_bgcolor: PALE_WHITE,
    // paper_bgcolor: WHITE,
    legend: {
      font: {
        family: 'Lato Regular',
        size: 12,
        color: MAIN_BLUE
      }
    }
  }
  );

  useEffect(() => {
    if (!mainRef.current) return;

    const handleResize = (entries: any) => {

      for (let entry of entries) {
        const { width } = entry.contentRect;
        const hideControls = width < 500;
        setPlotLayout((oldV) => {
          return {
            ...oldV,
            width: width * (hideControls ? 1 : 0.66),
          };
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mainRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [mainRef]);

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
    } catch (e) { }
  }
  return (
    <Plot
      className={styles.graph}
      key={new Date().getTime()}
      data={traces}
      layout={plotLayout}
    />
  );
}
