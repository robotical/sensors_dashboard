import {
  sequential,
  Sequential,
  train,
  layers,
  TensorContainer,
  Logs,
  Tensor,
  Rank,
  regularizers,
} from "@tensorflow/tfjs";
import { Dataset } from "@tensorflow/tfjs-layers/dist/engine/dataset_stub";

export default class LogisticModel {

    public model: Sequential | null = null;

  async trainLogisticRegression(
    featureCount: number,
    trainDs: Dataset<TensorContainer>,
    validDs: Dataset<TensorContainer>
  ) {
    const model = sequential();
    model.add(
      layers.dense({
        units: 2,
        activation: "sigmoid",
        inputShape: [featureCount],
        useBias: true,
        kernelRegularizer: regularizers.l2({l2: 0.01}),
        biasRegularizer: regularizers.l2({l2: 0.01})
      })
    );
    const optimizer = train.adam(0.1);
    model.compile({
      optimizer: optimizer,
      loss: "binaryCrossentropy",
      metrics: ["accuracy"],
    });
    const trainLogs: Logs[] = [];
    console.log("Training...");
    await model.fitDataset(trainDs, {
      epochs: 50,
      validationData: validDs,
      callbacks: {
        onEpochEnd: async (epoch, logs) => {
          logs && trainLogs.push(logs);
          console.log(epoch);
        },
      },
    });
    this.model = model;
    return model;
  }

  getPredictions(xTest: Tensor<Rank>, yTest?: Tensor<Rank>) {
    if (!this.model) throw new Error("Model has not been trained yet");
    const preds = this.model.predict(xTest);
    if (yTest) {
        const labels = yTest.argMax(-1);
        return {preds, labels};
    }
    return {preds};
  }
}
