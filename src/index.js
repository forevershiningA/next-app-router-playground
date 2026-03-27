import { createRoot } from 'react-dom/client';
import { Dyo } from './dyo.js';

const App = () => {

  return (
    <Dyo />
  );

};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);