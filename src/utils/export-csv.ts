import { GraphDataType, TraceIdType } from "../components/GraphArea";

export async function prepareCSVData(data: GraphDataType) {
  const mergedX = mergeX(data);
  const mergedYs = await mergeY(data, mergedX);
  const csvData = createCSVData(mergedX, mergedYs);
  return csvData;
}

export function prepareTitles(data: GraphDataType, xAxisTitle: string) {
  const titles: string[] = [];
  titles.push(xAxisTitle);
  for (const traceKey in data) {
    titles.push(traceKey.split("=>")[1]);
  }
  return titles;
}

export const getCSVTitle = (data: GraphDataType) => {
  const tracesTitles: string[] = [];
  for (const trace in data) {
    const traceTitle = trace.split("=>")[0];
    if (!tracesTitles.includes(traceTitle)) {
      tracesTitles.push(traceTitle);
    }
  }
  return `${tracesTitles.join("_")}_Data.csv`;
};

const mergeX = (data: GraphDataType) => {
  // merge all x's into one array
  const mergedX: number[] = [];
  for (const traceKey in data) {
    const trace = data[traceKey as TraceIdType];
    const { x } = trace;
    for (const xVal of x) {
      if (!mergedX.includes(xVal)) {
        mergedX.push(xVal);
      }
    }
  }
  return mergedX.sort((a, b) => a - b);
};

const mergeY = async (data: GraphDataType, mergedX: number[]) => {
  // async because it'll be a time consuming process so better we do it in parallel
  // go through y's of each trace and add to csvData
  const ysPromises: Promise<number[]>[] = [];
  for (const traceKey in data) {
    const promise = new Promise<number[]>((resolve, reject) => {
      const mergedY: number[] = new Array(mergedX.length).fill(NaN);
      const trace = data[traceKey as TraceIdType];
      const { x, y } = trace;
      for (let i = 0; i < y.length; i++) {
        const yVal = y[i];
        const xVal = x[i];
        const xIndex = mergedX.indexOf(xVal);
        mergedY[xIndex] = yVal;
      }
      resolve(mergedY);
    });
    ysPromises.push(promise);
  }
  return Promise.all(ysPromises);
};

const createCSVData = (mergedX: number[], mergedYs: number[][]) => {
  const csvData: number[][] = [];
  for (let i = 0; i < mergedX.length; i++) {
    const xVal = mergedX[i];
    const yVals = mergedYs.map((y) => y[i]);
    csvData.push([xVal, ...yVals]);
  }
  return csvData;
};
