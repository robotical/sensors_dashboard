import { GraphDataType, TraceIdType } from "../GraphAreaLogisticRegression";
import Plot from "react-plotly.js";
import LogisticPreprocessing from "../../utils/logistic-regression/Preprocessing";
import LogisticModel from "../../utils/logistic-regression/Model";
import { useState } from "react";

interface GraphLogisticRegressionProps {
  data: GraphDataType;
}

const EMPTY_PRED_VALS = {x: [], y: []};

export default function GraphLogisticRegression({
  data,
}: GraphLogisticRegressionProps) {
  const [predictedValues, setPredictedValues] = useState(EMPTY_PRED_VALS);

    data = {"IRFoot=>Val": {
        x: [
            3,
3,
4,
3,
3,
3,
3,
1,
1,
2,
2,
2,
2,
2,
2,
2,
2,
3,
3,
3,
4,
4,
4,
4,
4,
4,
4,
4,
4,
2,
2,
2,
2,
2,
2,
1,
1,
8,
8,
7,
7,
7,
7,
6,
8,
7,
7,
7,
4,
1,
3,
3,
2,
2,
2,
2,
5,
5,
4,
4,
4,
3,
4,
4,
2,
2,
3,
3,
2,
2,
2,
2,
6,
6,
11,
11,
11,
11,
11,
11,
11,
11,
11,
11,
1,
1,
1,
1,
1,
3,
2,
2,
3,
4,
4,
3,
4,
4,
3,
3,
4,
4,
4,
4,
4,
4,
5,
5,
5,
5,
4,
4,
4,
4,
4,
4,
3,
3,
4,
4,
1,
1,
2,
1,
2,
2,
1,
1,
2,
2,
2,
2,
2,
2,
2,
2,
2,
2,
6,
6,
6,
6,
6,
6,
5,
5,
1,
1,
3,
3,
2,
2,
3,
4,
4,
4,
4,
2,
2,
3,
3,
3,
2,
3,
3,
2,
2,
1,
5,
6,
6,
6,
6,
6,
6,
6,
6,
5,
5,
3,
3,
1,
1,
1,
1,
1,
1,
2,
2,
2,
2,
4,
3,
4,
4,
3,
3,
3,
3,
4,
4,
3,
3,
3,
3,
3,
3,
3,
2,
2,
1,
1,
1,
2,
2,
1,
1,
2,
2,
2,
3,
3,
3,
3,
3,
3,
3,
3,
3,
        ],
        y: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    }}

  const traces: any[] = [];
  
  for (const traceKey in data) {

    if (data[traceKey as TraceIdType].x.length === 229 && predictedValues.x.length === 0) {
      const preproData = LogisticPreprocessing.trasformData(
        data[traceKey as TraceIdType]
      );
      const lm = new LogisticModel();
      lm.trainLogisticRegression(
        1,
        preproData.trainDs,
        preproData.validDs
      ).then((model) => {
        const { preds } = lm.getPredictions(preproData.xTest);
        // @ts-ignore
        console.log(preds.arraySync());
        // @ts-ignore
        const predY1D = preds.arraySync().map((predArr) => predArr[1]);
        const predX1D = preproData.xTest
          .arraySync()
          // @ts-ignore
          .map((predArr) => predArr[0]);
        setPredictedValues({ x: predX1D, y: predY1D });
        console.log({ x: predX1D, y: predY1D });
      });
    }
    try {
      const trace = {
        x: data[traceKey as TraceIdType].x,
        y: data[traceKey as TraceIdType].y,
        type: "scatter",
        mode: "markers",
        name: traceKey.split("=>")[1], // + "True",
      };
      traces.push(trace);
    } catch (e) {}
  }

  if (predictedValues.x.length) {
    const predictedValuesTrace = {
      x: predictedValues.x,
      y: predictedValues.y,
      type: "scatter",
      mode: "line",
      name: "Predicted",
    };
    traces.push(predictedValuesTrace);
  }
  if (traces.length === 0 && predictedValues.x.length !== 0) setPredictedValues(EMPTY_PRED_VALS);

  return (
    <Plot
      style={{ justifySelf: "center", maxWidth: "66vw" }}
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
          title: "Sensor value",
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
