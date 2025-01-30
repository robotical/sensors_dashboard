import { GraphDataType, TraceData, TraceIdType } from "../GraphArea";
import styles from "./styles.module.css";
import { motorPosDifferentiation, rgbColorTraceName } from "../../utils/graph/trace-name";
import { useEffect, useState, useMemo, useRef } from "react";
import Plot from "react-plotly.js";
import { AQUA_BLUE_025, MAIN_BLUE, PALE_WHITE } from "../../styles/colors";

interface GraphProps {
  data: GraphDataType;
  maxDataXValue: number;
  autoScrollEnabled: boolean;
  mainRef: React.RefObject<HTMLDivElement>;
}
const SCROLL_THRESHOLD = 5;
export default function Graph({ data, maxDataXValue, autoScrollEnabled, mainRef }: GraphProps) {
  const [plotWidth, setPlotWidth] = useState<number | undefined>(undefined);
  const shouldScroll = useMemo(() => maxDataXValue > SCROLL_THRESHOLD && autoScrollEnabled, [maxDataXValue, autoScrollEnabled]);

  const plotLayout = useMemo(() => ({
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
      range: shouldScroll ? [maxDataXValue - SCROLL_THRESHOLD, maxDataXValue] : undefined,
    },
    yaxis2: {
      linecolor: MAIN_BLUE,
      linewidth: 2,
      mirror: true,
      zeroline: false,
      showgrid: true,
      gridcolor: AQUA_BLUE_025,
      title: {
        text: "",
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
      side: 'right',
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
      },
      x: 1.09,
    },
    width: plotWidth,
    hovermode: 'x unified',
  }), [maxDataXValue, autoScrollEnabled, plotWidth]);

  useEffect(() => {
    if (!mainRef.current) return;

    const handleResize = (entries: any) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        const hideControls = width < 500;
        setPlotWidth(width * (hideControls ? 1 : 0.66));
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
      const y0ORy2 = traceName.includes("?") ? "y2" : "y";
      const trace = {
        x: data[traceKey as TraceIdType].x,
        y: traceName.includes("?") ? data[traceKey as TraceIdType].y.map(y => y) : data[traceKey as TraceIdType].y.map((y: number) => Math.round(y * 100) / 100),
        yaxis: y0ORy2,
        type: "scatter",
        mode: "lines",
        name: traceName,
        line: {
          color: rgbColorTraceName(traceName)
        },
        hoverinfo: 'x+y+name',
        hoveron: 'points+lines',
      };
      // @ts-ignore
      traces.push(trace);
    } catch (e) { }
  }

  return (
    <Plot
      className={styles.graph}
      data={traces}
      // @ts-ignore
      layout={plotLayout}
    />
  );
}
