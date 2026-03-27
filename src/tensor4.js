import React, { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';

const App = () => {
    const [data, setData] = useState([]);
    const [model, setModel] = useState(null);

    useEffect(() => {
        fetch('data.json')
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
        const designs = [...new Set(data.map(item => item.design))];

        const inputs = data.map(item => [
            types.indexOf(item.type),
            styles.indexOf(item.style),
            motifs.indexOf(item.motif)
        ]);

        const labels = data.map(item => designs.indexOf(item.design));

        // Normalize inputs
        const inputTensor = tf.tensor2d(inputs);
        const labelTensor = tf.tensor1d(labels, 'int32');

        const inputMax = inputTensor.max();
        const inputMin = inputTensor.min();
        const labelMax = labelTensor.max();
        const labelMin = labelTensor.min();

        const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
        const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));

        buildModel();
        trainModel(normalizedInputs, normalizedLabels);
    };

    const buildModel = () => {
        const model = tf.sequential();
        model.add(tf.layers.dense({ inputShape: [3], units: 10, activation: 'relu' }));
        model.add(tf.layers.dense({ units: 10, activation: 'relu' }));
        model.add(tf.layers.dense({ units: 1, activation: 'linear' }));
        model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
        setModel(model);
    };

    const trainModel = (inputs, labels) => {
        model.fit(inputs, labels, {
            epochs: 100,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
                }
            }
        }).then(() => {
            console.log('Training complete');
        });
    };

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

        const inputMax = input.max();
        const inputMin = input.min();

        const normalizedInput = input.sub(inputMin).div(inputMax.sub(inputMin));

        const prediction = model.predict(normalizedInput).dataSync()[0];
        console.log('Predicted Design:', prediction);
        // Display the prediction in your UI
    };

    return (
        <div>
            <h1>Design Prediction</h1>
            <button onClick={() => predictDesign('type1', 'style1', 'motif1')}>Predict</button>
        </div>
    );
};

export default App;
