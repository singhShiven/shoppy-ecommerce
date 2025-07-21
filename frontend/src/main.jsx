// frontend/src/main.jsx (or main.tsx)

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // <-- CHANGE THIS LINE to App.jsx
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);