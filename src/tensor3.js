import * as React from 'react';
import { useState, useEffect } from 'react';
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


export async function stop() {
  //tfvis.visor().close();
}

export function run() {

    showLoader();

    //const [data, setData] = React.useState([]);
    const [model, setModel] = React.useState(null);

    /*
    React.useEffect(() => {
        fetch('https://headstonesdesigner.com/design/saved-designs/json/ml/ml.json')
            .then(response => response.json())
            .then(data => {
                setData(data);
                preprocessData(data);
            });
    }, []);
    

    const preprocessData = (data) => {
      const types = [...new Set(data.map(item => item.type))];
      const styles = [...new Set(data.map(item => item.style))];
      const motifs = [...new Set(data.map(item => item.motif))];
  
      const inputs = data.map(item => [
          types.indexOf(item.type),
          styles.indexOf(item.style),
          motifs.indexOf(item.motif)
      ]);
  
      const labels = data.map(item => item.design);
  
      // Assuming 'design' is already numerical; otherwise, convert it to numerical as well
  
      buildModel();
      trainModel(inputs, labels);
    }

    const buildModel = () => {
        const model = tf.sequential();
        model.add(tf.layers.dense({ inputShape: [3], units: 10, activation: 'relu' }));
        model.add(tf.layers.dense({ units: 1, activation: 'linear' }));
        model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
        setModel(model);
    };

    const trainModel = (inputs, labels) => {
      const inputTensor = tf.tensor2d(inputs);
      const labelTensor = tf.tensor2d(labels, [labels.length, 1]);
    
      model.fit(inputTensor, labelTensor, {
          epochs: 100,
          callbacks: {
              onEpochEnd: (epoch, logs) => {
                  console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
              }
          }
      }).then(() => {
          console.log('Training complete');
      });
    }
    
    const predictDesign = (type, style, motif) => {
      const types = [...new Set(data.map(item => item.type))];
      const styles = [...new Set(data.map(item => item.style))];
      const motifs = [...new Set(data.map(item => item.motif))];
    
      const input = tf.tensor2d([
          [
              types.indexOf(type),
              styles.indexOf(style),
              motifs.indexOf(motif)
          ]
      ]);
    }
  
    //const prediction = model.predict(input).dataSync()[0];
    //console.log('Predicted Design:', prediction);
    
    return (
      <div>
          <h1>Design Prediction</h1>
          <button onClick={() => predictDesign('type1', 'style1', 'motif1')}>Predict</button>
      </div>
    );

    */

}