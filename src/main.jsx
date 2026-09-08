// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from './App.jsx'
import './index.css'

// ── Suppress Third-Party Browser Extension Injections ──────────────────────
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('M_ID')) {
      event.preventDefault();
    }
  });

  window.addEventListener('error', (event) => {
    if (event.message?.includes('M_ID') || event.filename?.includes('200.js')) {
      event.preventDefault();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <SpeedInsights />
    </BrowserRouter>
  </React.StrictMode>,
)