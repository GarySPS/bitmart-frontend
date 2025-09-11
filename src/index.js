// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './globals.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);

// Simple and direct service worker registration
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    const swUrl = '/service-worker.js';
    navigator.serviceWorker
      .register(swUrl)
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}