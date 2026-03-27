import * as React from 'react';
import * as tf from '@tensorflow/tfjs';
import { showLoader, hideLoader } from './loader.js';

let predicted, state = 0;

export const predictedValue = () => {
    return predicted;
}

export function Tensor() {
    const [model, setModel] = useState(null);

    const predict = (value) => {
    if (model) {
        const prediction = model.predict(tf.tensor2d([value], [1, 1]));
        return prediction.dataSync()[0];
    }
    return null;
    };

    useEffect(() => {
    // Define a simple TensorFlow model
    const simpleModel = tf.sequential();
    simpleModel.add(tf.layers.dense({ units: 1, inputShape: [1] }));
    simpleModel.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });

    // Train the model with some dummy data
    const xs = tf.tensor2d([1, 2, 3, 4], [4, 1]);
    const ys = tf.tensor2d([1, 3, 5, 7], [4, 1]);
    simpleModel.fit(xs, ys, { epochs: 100 }).then(() => {
        setModel(simpleModel);
    });

    predicted = predict(5);

    return () => {
        // Clean up resources
        if (model) {
         model.dispose();
        }
    };
    }, []);

}

/**
 * Get the car data reduced to just the variables we are interested
 * and cleaned of missing data.
 */
async function getData() {
    //const mlDataResponse = await fetch('https://storage.googleapis.com/tfjs-tutorials/mlData.json');
    const mlDataResponse = await fetch('https://headstonesdesigner.com/design/saved-designs/json/ml/ml.json');
    const mlData = await mlDataResponse.json();
    
    const cleaned = mlData.map(dat => ({
      ml_type: dat.ml_type,
      ml_style: dat.ml_style,
    }))
    //.filter(dat => (dat.ml_type != null && dat.ml_style != null));
  
    return cleaned;
  }

export async function stop() {
  tfvis.visor().close();
  state = 1;
}

export async function run() {

    showLoader();

    if (state == 1) {
      tfvis.visor().open();
    }

    // Load and plot the original input data that we are going to train on.
    const data = await getData();
    const values = data.map(d => ({
      x: d.ml_type,
      y: d.ml_style,
    }));
  
    tfvis.render.scatterplot(
      {name: 'Type'},
      {values},
      {
        xLabel: 'Type',
        yLabel: 'Style',
        height: 300
      }
    );
  
    // Create the model
      const model = createModel();
      tfvis.show.modelSummary({name: 'Model Summary'}, model);
  
      // Convert the data to a form we can use for training.
      const tensorData = convertToTensor(data);
      const {inputs, labels} = tensorData;

      hideLoader();
  
      // Train the model
      await trainModel(model, inputs, labels);
      console.log('Done Training');  
      testModel(model, data, tensorData);
  }
  
  function createModel() {
      // Create a sequential model
      const model = tf.sequential();
    
      // Add a single input layer
      model.add(tf.layers.dense({inputShape: [1], units: 1, useBias: true}));
    
      // Add an output layer
      model.add(tf.layers.dense({units: 1, useBias: true}));
    
      return model;
  }
  
  /**
   * Convert the input data to tensors that we can use for machine
   * learning. We will also do the important best practices of _shuffling_
   * the data and _normalizing_ the data
   * MPG on the y-axis.
   */
  function convertToTensor(data) {
      // Wrapping these calculations in a tidy will dispose any
      // intermediate tensors.
    
      return tf.tidy(() => {
        // Step 1. Shuffle the data
        tf.util.shuffle(data);
    
        // Step 2. Convert data to Tensor
        const inputs = data.map(d => d.ml_type)
        const labels = data.map(d => d.ml_style);
    
        const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
        const labelTensor = tf.tensor2d(labels, [labels.length, 1]);
    
        //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
        const inputMax = inputTensor.max();
        const inputMin = inputTensor.min();
        const labelMax = labelTensor.max();
        const labelMin = labelTensor.min();
    
        const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
        const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));
    
        return {
          inputs: normalizedInputs,
          labels: normalizedLabels,
          // Return the min/max bounds so we can use them later.
          inputMax,
          inputMin,
          labelMax,
          labelMin,
        }
      });
  }
  
  async function trainModel(model, inputs, labels) {
      // Prepare the model for training.
      model.compile({
          optimizer: tf.train.adam(),
          loss: tf.losses.meanSquaredError,
          metrics: ['mse'],
      });
  
      const batchSize = 32;
      const epochs = 50;
  
      return await model.fit(inputs, labels, {
          batchSize,
          epochs,
          shuffle: true,
          callbacks: tfvis.show.fitCallbacks(
          { name: 'Training Performance' },
          ['loss', 'mse'],
          { height: 200, callbacks: ['onEpochEnd'] }
          )
      });
  }
  
  function testModel(model, inputData, normalizationData) {

      const {inputMax, inputMin, labelMin, labelMax} = normalizationData;
    
      // Generate predictions for a uniform range of numbers between 0 and 1;
      // We un-normalize the data by doing the inverse of the min-max scaling
      // that we did earlier.
      const [xs, preds] = tf.tidy(() => {
    
        const xsNorm = tf.linspace(0, 1, 100);
        const predictions = model.predict(xsNorm.reshape([100, 1]));
    
        const unNormXs = xsNorm
          .mul(inputMax.sub(inputMin))
          .add(inputMin);
    
        const unNormPreds = predictions
          .mul(labelMax.sub(labelMin))
          .add(labelMin);
    
        // Un-normalize the data
        return [unNormXs.dataSync(), unNormPreds.dataSync()];
      });
    
    
      const predictedPoints = Array.from(xs).map((val, i) => {
        return {x: val, y: preds[i]}
      });
    
      const originalPoints = inputData.map(d => ({
        x: d.ml_type, y: d.ml_style,
      }));
    
    
      tfvis.render.scatterplot(
        {name: 'Model Predictions vs Original Data'},
        {values: [originalPoints, predictedPoints], series: ['original', 'predicted']},
        {
          xLabel: 'Type',
          yLabel: 'Style',
          height: 300
        }
      );
  }