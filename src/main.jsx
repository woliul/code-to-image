
// In src/index.js or src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    // <React.StrictMode>  <-- COMMENT OUT OR REMOVE THIS LINE DURING DEVELOPMENT
    <App />
    // </React.StrictMode> <-- COMMENT OUT OR REMOVE THIS LINE DURING DEVELOPMENT
);