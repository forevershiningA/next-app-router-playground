import * as React from 'react';
import * as tf from '@tensorflow/tfjs';
import { showLoader, hideLoader } from './loader.js';
import { getPath } from './path.js';
import { updateData } from './admin.js';
import { getRef, getRefObj } from './dselect.js';

let itemData;
let training = true;
let _model;
let _designMapping;
let type = "Plaque";
let style = "Bronze";
let motif = "Aquatic";
let data;

const path = getPath();
const url = `${path}/design/saved-designs/json/ml/ml.json`;

export const updateParams = () => {
  if (getRef().types) {
    type = getRefObj().types.value;
  }
  if (getRef().styles) {
    style = getRefObj().styles.value;
  }
  if (getRef().motifs) {
    motif = getRefObj().motifs.value;
  }
  console.log(`Updated params - Type: ${type}, Style: ${style}, Motif: ${motif}`);
  predictDesign(type, style, motif);
};

// Load data from URL
async function getData() {
  const mlDataResponse = await fetch(url);
  const mlData = await mlDataResponse.json();

  const cleaned = mlData.map(dat => ({
    type: dat.ml_type,
    style: dat.ml_style,
    motif: dat.ml_motif,
    design: dat.design_stampid,
    preview: dat.preview
  }));

  console.log("Loaded data:", cleaned);
  return cleaned;
}

// Load model and metadata
export async function load() {
  training = false;
  const model = await tf.loadLayersModel(`${path}/design/saved-designs/json/ml/my-model.json`);
  _model = model;
  await loadMetadata();
}

// Load metadata and make an initial prediction
const loadMetadata = async () => {
  data = await getData();
  predictDesign(type, style, motif);
};

// Encode features and normalize them
const encodeFeatures = (data) => {
  const types = [...new Set(data.map(item => item.type))];
  const styles = [...new Set(data.map(item => item.style))];
  const motifs = [...new Set(data.map(item => item.motif))];

  const encodedData = data.map(item => ({
    type: types.indexOf(item.type) / types.length,
    style: styles.indexOf(item.style) / styles.length,
    motif: motifs.indexOf(item.motif) / motifs.length,
    design: item.design,
    preview: item.preview
  }));

  return { encodedData, types, styles, motifs };
};

// Predict design based on input type, style, and motif
const predictDesign = (type, style, motif, topN = 15) => {
  if (!_model || !data) {
    console.log("Model or data not loaded");
    return;
  }

  const { encodedData, types, styles, motifs } = encodeFeatures(data);

  const input = tf.tensor2d([
    [
      types.indexOf(type) / types.length,
      styles.indexOf(style) / styles.length,
      motifs.indexOf(motif) / motifs.length
    ]
  ]);

  console.log(`Predicting for input: Type: ${type}, Style: ${style}, Motif: ${motif}`);
  console.log("Input tensor:", input.arraySync());

  const predictions = _model.predict(input).dataSync();
  console.log("Predictions:", predictions);

  // Get top N predictions
  const shuffledIndices = getRandomIndices(predictions, topN);
  const predictedDesigns = shuffledIndices.map(index => data[index]);

  console.log("Predicted designs:", predictedDesigns);

  hideLoader();

  itemData = [];
  predictedDesigns.forEach(item => {
    itemData.push({
      img: `${path}design/${item.preview}`,
      title: item.style + ' ' + item.type,
      author: item.motif + ' - ' + item.design
    });
  });

  updateData(itemData);
};

// Save the trained model
const saveModel = async () => {
  if (_model) {
    await _model.save('downloads://my-model');
    console.log('Model saved');
  } else {
    console.log('Model is not loaded yet');
  }
};

// Run training process
export async function run() {
  training = true;
  showLoader();

  data = await getData();

  const { encodedData, types, styles, motifs } = encodeFeatures(data);

  const inputs = encodedData.map(item => [item.type, item.style, item.motif]);
  const labels = encodedData.map(item => Number(item.design));

  const inputTensor = tf.tensor2d(inputs);
  const labelTensor = tf.tensor1d(labels, 'float32');

  console.log("Training data inputs:", inputs);
  console.log("Training data labels:", labels);

  buildModel(encodedData.length); // Passing the number of design categories
  await trainModel(inputTensor, labelTensor);
  predictDesign(type, style, motif);
}

// Build the model with leakyReLU activation
const buildModel = (outputUnits) => {
  const model = tf.sequential();
  model.add(tf.layers.dense({
    inputShape: [3],
    units: 50,
    activation: 'linear',
    kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
  }));
  model.add(tf.layers.leakyReLU({ alpha: 0.01 }));
  model.add(tf.layers.dropout({ rate: 0.3 }));
  model.add(tf.layers.dense({
    units: 50,
    activation: 'linear',
    kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
  }));
  model.add(tf.layers.leakyReLU({ alpha: 0.01 }));
  model.add(tf.layers.dropout({ rate: 0.3 }));
  model.add(tf.layers.dense({ units: outputUnits, activation: 'softmax' }));
  model.compile({ optimizer: 'adam', loss: 'sparseCategoricalCrossentropy' });
  _model = model;
}

// Train the model with adjusted hyperparameters
const trainModel = async (inputs, labels) => {
  await _model.fit(inputs, labels, {
    epochs: 200,
    batchSize: 32,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
      }
    }
  });
  console.log('Training complete');
  saveModel();
  hideLoader();
};

// Function to get random indices based on predictions
const getRandomIndices = (predictions, topN) => {
  const indices = Array.from(predictions.keys());
  // Shuffle indices array
  /*
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  */
  // Return top N shuffled indices
  return indices.slice(0, topN);
};
