import * as React from 'react';
import * as tf from '@tensorflow/tfjs';
import { showLoader, hideLoader, setTitle } from './loader.js';
import { getPath } from './path.js';
import { updateData } from './admin.js';
import { getRef, getRefObj } from './dselect.js';
import { types, styles, motifs } from './data.js';

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

// Load model and metadata
export async function load() {
  training = false;
  showLoader();
  const model = await tf.loadLayersModel(`${path}/design/saved-designs/json/ml/my-model.json`);
  _model = model;
  await loadMetadata();
}

// Load metadata and make an initial prediction
const loadMetadata = async () => {
  data = await getData();
  predictDesign(type, style, motif);
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

// Load data from URL
async function getData() {
  const mlDataResponse = await fetch(url);
  const mlData = await mlDataResponse.json();

  const data = mlData.map(dat => ({
    type: dat.ml_type,
    style: dat.ml_style,
    motif: dat.ml_motif,
    design: dat.design_stampid,
    preview: dat.preview,
    domain: dat.domain
  }));

  return data;
}

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
    domain: item.domain,
    preview: item.preview
  }));

  return { encodedData, types, styles, motifs };
};

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
    epochs: 1024,
    batchSize: 32,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        setTitle(`Epoch ${epoch}: loss = ${logs.loss}`);
        console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
      }
    }
  });
  setTitle('Training complete');
  console.log('Training complete');
  saveModel();
  hideLoader();
};

// Save the trained model
const saveModel = async () => {
  if (_model) {
    await _model.save('downloads://my-model');
    //console.log('Model saved');
    setTitle('Model saved');
  } else {
    //console.log('Model is not loaded yet');
    setTitle('Model is not loaded yet');
  }
};

// Predict design based on input type, style, and motif
const predictDesign = async (type, style, motif, topN = 15, generate = false) => {

  if (!generate) {
    hideLoader();
  }

  if (!_model || !data) {
    console.log("Model or data not loaded");
    return;
  }

  // Filter the data based on the input type, style, and motif
  const filteredData = data.filter(item =>
    item.type === type &&
    item.style === style &&
    item.motif === motif
  );

  //console.log(`Predicting for input: Type: ${type}, Style: ${style}, Motif: ${motif}`);
  setTitle(`Predicting for input: Type: ${type}, Style: ${style}, Motif: ${motif}`);

  let filename = currentType + "_" + currentStyle + "_" + currentMotif;

  if (filteredData.length === 0) {
    setTitle("No matching data found");
    //console.log("No matching data found");
    if (!generate) {
      hideLoader();
    }
    itemData = [];
    updateData(itemData, generate, filename);
    return;
  }

  const { encodedData, types, styles, motifs } = encodeFeatures(filteredData);

  const input = tf.tensor2d([
    [
      types.indexOf(type) / types.length,
      styles.indexOf(style) / styles.length,
      motifs.indexOf(motif) / motifs.length
    ]
  ]);

  console.log("Input tensor:", input.arraySync());

  const predictions = await _model.predict(input).data();
  //console.log("Predictions:", predictions);

  // Ensure top indices are within the bounds of the filtered data
  const topIndices = Array.from(predictions)
    .map((value, index) => ({ value, index }))
    .sort((a, b) => b.value - a.value)
    .slice(0, Math.min(topN, filteredData.length))  // Ensure we do not exceed the filtered data length
    .map(item => item.index);

  //console.log(topIndices);
  //console.log(filteredData);

  //const predictedDesigns = filteredData.slice(0, topN);//topIndices.map(index => filteredData[index]);
  const predictedDesigns = filteredData;

  //console.log("Predicted designs:", predictedDesigns);

  if (!generate) {
    hideLoader();
  }

  itemData = [];
  predictedDesigns.forEach(item => {

    itemData.push({
      id: item.design,
      domain: item.domain,
      img: `https://${item.domain}/design/${item.preview}`,
      title: item.style + ' ' + item.type,
      //author: item.motif + ' - ' + item.design
    });
  });

  updateData(itemData, generate, filename);
};

let totalFiles = types.length * styles.length * motifs.length;
let currentType = 0;
let currentStyle = 0;
let currentMotif = 0;

export const generateFiles = () => {

    //console.log(types);
    //console.log(styles);
    //console.log(motifs);  

    //console.log("[tensor] generateFiles: " + totalFiles);

    totalFiles --;

    if (currentMotif == motifs.length) {
      currentMotif = 0;
      currentStyle ++;
    }

    if (currentStyle == styles.length) {
        currentStyle = 0;
        currentType ++;
    }

    if (currentType == types.length) {
      currentType = 0;
    }

    //console.log("[tensor] currentFile: " + currentType + " / " + currentStyle + " / " + currentMotif);
    
    setTitle("Generating Files: " + currentType + " / " + currentStyle + " / " + currentMotif);

    if (totalFiles > 0) {
      if (types[currentType]) {
        if (styles[currentStyle]) {
          if (motifs[currentMotif]) {
            predictDesign(types[currentType].name, styles[currentStyle].name, motifs[currentMotif].name, 15, true);
            currentMotif ++;
          }
        }
      }
    } else {
      hideLoader();
    }

}

export const updateParams = () => {
  showLoader();
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
