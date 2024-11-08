import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

// Ensure configuration check runs on startup
console.log('App starting - configuration check will run');

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 