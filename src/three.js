import { useState, useTransition, useEffect } from 'react'
import * as tf from '@tensorflow/tfjs';
import { useControls } from 'leva'
import { Canvas } from '@react-three/fiber'
import { AccumulativeShadows, RandomizedLight, Center, Environment, OrbitControls } from '@react-three/drei'

export function Three() {
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

    return () => {
      // Clean up resources
      if (model) {
        model.dispose();
      }
    };
  }, []);

  console.log("prediction: " + predict(5));
  
  return (
    <Canvas shadows camera={{ position: [0, 0, 4.5], fov: 50 }}>
      <group position={[0, -0.65, 0]}>
        <Sphere size={[0.75, 64, 64]}/>
        <AccumulativeShadows temporal frames={200} color="purple" colorBlend={0.5} opacity={1} scale={10} alphaTest={0.85}>
          <RandomizedLight amount={8} radius={5} ambient={0.5} position={[5, 3, 2]} bias={0.001} />
        </AccumulativeShadows>
      </group>
      <group position={[2, -0.65, 0]}>
        <Sphere size={[0.5, 64, 64]} />
        <AccumulativeShadows temporal frames={200} color="purple" colorBlend={0.5} opacity={1} scale={10} alphaTest={0.85}>
          <RandomizedLight amount={8} radius={5} ambient={0.5} position={[5, 3, 2]} bias={0.001} />
        </AccumulativeShadows>
      </group>
      <Env />
      <OrbitControls autoRotate autoRotateSpeed={0} enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 2.1} maxPolarAngle={Math.PI / 2.1} />
    </Canvas>
  )
}

function Sphere({size}) {
  const { roughness } = useControls({ roughness: { value: 1, min: 0, max: 1 } })
  return (
    <Center top>
      <mesh castShadow>
        <sphereGeometry args={size} />
        <meshStandardMaterial metalness={1} roughness={roughness} />
      </mesh>
    </Center>
  )
}

function Env() {
  const [preset, setPreset] = useState('sunset')
  // You can use the "inTransition" boolean to react to the loading in-between state,
  // For instance by showing a message
  const [inTransition, startTransition] = useTransition()
  const { blur } = useControls({
    blur: { value: 0.65, min: 0, max: 1 },
    preset: {
      value: preset,
      options: ['sunset', 'dawn', 'night', 'warehouse', 'forest', 'apartment', 'studio', 'city', 'park', 'lobby'],
      // If onChange is present the value will not be reactive, see https://github.com/pmndrs/leva/blob/main/docs/advanced/controlled-inputs.md#onchange
      // Instead we transition the preset value, which will prevents the suspense bound from triggering its fallback
      // That way we can hang onto the current environment until the new one has finished loading ...
      onChange: (value) => startTransition(() => setPreset(value))
    }
  })
  return <Environment preset={preset} background blur={blur} />
}
