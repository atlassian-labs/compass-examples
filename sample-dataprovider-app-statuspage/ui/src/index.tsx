import { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import App from './App';

import '@atlaskit/css-reset/dist/bundle.css';

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById('root'),
);
