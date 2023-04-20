import { GraphDataType, TraceData, TraceIdType } from "../GraphArea";
import styles from "./styles.module.css";
import { motorPosDifferentiation, rgbColorTraceName } from "../../utils/graph/trace-name";
import { useEffect, useRef, useState } from "react";
import Plot from "react-plotly.js";
import { useMediaQuery } from 'react-responsive';
import { AQUA_BLUE_025, MAIN_BLUE, PALE_WHITE, WHITE } from "../../styles/colors";

interface GraphProps {
  data: GraphDataType;
  maxDataXValue: number;
  autoScrollEnabled: boolean;
}

export default function Graph({ data, maxDataXValue, autoScrollEnabled }: GraphProps) {
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
          family: 'Arial, sans-serif',
          size: 16,
          color: MAIN_BLUE
        }
      },
      tickfont: {
        family: 'Arial, sans-serif',
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
          family: 'Arial, sans-serif',
          size: 16,
          color: MAIN_BLUE
        }
      },
      tickfont: {
        family: 'Arial, sans-serif',
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
        family: 'Arial, sans-serif',
        size: 12,
        color: MAIN_BLUE
      }
    }
  }
  );

  const hideControls = useMediaQuery({ query: '(max-width: 500px)' });
  const shouldNotResize = useMediaQuery({ query: '(max-width: 500px)' });

  useEffect(() => {
    const handleResize = () => {
      if (shouldNotResize && !hideControls) return;
      setPlotLayout((oldV) => {
        return {
          ...oldV,
          width: window.innerWidth * (hideControls ? 1 : .66),
        }
      });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [hideControls, shouldNotResize]);

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
