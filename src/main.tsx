import React from 'react';
import ReactDOM from 'react-dom/client';
import HabitTracker from './artifacts/default';
import './index.css';

// Initialize theme from localStorage or system preference
const initializeTheme = () => {
  const saved = localStorage.getItem('theme');
  if (saved && (saved === 'dark' || saved === 'dark-mono')) {
    document.documentElement.setAttribute('data-theme', saved);
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
};

initializeTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HabitTracker />
  </React.StrictMode>,
);