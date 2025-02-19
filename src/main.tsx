import React from 'react';
import ReactDOM from 'react-dom/client';
import HabitTracker from './artifacts/default';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HabitTracker />
  </React.StrictMode>,
);