import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios';
import './index.css'
import App from './App.jsx'

// Global Axios Interceptor to dynamically swap API base URL during deployment
axios.interceptors.request.use((config) => {
  const apiBase = import.meta.env.VITE_API_BASE_URL;
  if (apiBase && config.url && config.url.includes('localhost:5005/api')) {
    config.url = config.url.replace(/^https?:\/\/localhost:5005\/api/, apiBase);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
