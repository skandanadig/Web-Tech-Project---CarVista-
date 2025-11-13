import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios';

// Configure a single Axios base URL for all API calls.
// In development set REACT_APP_API_URL=http://localhost:5000
// In production (Vercel) you can leave it blank if using rewrites so relative /api/* hits backend.
axios.defaults.baseURL = process.env.REACT_APP_API_URL || '';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
