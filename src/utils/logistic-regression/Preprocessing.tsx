import { oneHot, data as tfdata, tensor } from "@tensorflow/tfjs";
import { TraceData } from "../../components/GraphAreaLogisticRegression";


export default class LogisticPreprocessing {
    static trasformData(dataRaw: TraceData) {
        const dataLen = dataRaw.x.length;
        let maxXValue = 0;
        for (const x of dataRaw.x) {
            if (x > maxXValue) maxXValue = x;
        }
        maxXValue = Math.floor(maxXValue * 1.1);
        const transformedX = dataRaw.x.map(xValue => [xValue]);
        // const transformedX = dataRaw.x;
        const transformedY = dataRaw.y.map(yValue => Array.from(oneHot(yValue, 2).dataSync()));
        // const transformedY = dataRaw.y;

        const ds = tfdata.zip({ xs: tfdata.array(transformedX), ys: tfdata.array(transformedY) });

        const xTest = Array.from(Array(maxXValue).keys()).map(xValue => [xValue]);
        const dataSetDiff = Math.floor(dataLen * .2);
        return {
            // trainDs: ds.take(dataLen).batch(dataLen-dataSetDiff),
            // validDs: ds.skip((dataLen - dataSetDiff) + 1).batch(dataSetDiff),
            trainDs: ds.take(dataLen).batch(dataLen),
            validDs: ds.take(dataLen).batch(dataLen),
            xTest: tensor(xTest),
            yTest: tensor(transformedY)
        }
    }
}