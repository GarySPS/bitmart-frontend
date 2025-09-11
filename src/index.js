// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './globals.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration'; // This line is important

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// This line correctly calls the function to register the service worker
serviceWorkerRegistration.register();