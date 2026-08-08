// src/config.js

// Vite automatically sets PROD to true when building for production, 
// and DEV to true during local development (npm run dev)
const isProduction = import.meta.env.PROD;

export const API_BASE_URL = isProduction
  ? 'https://medcare-app-qyao.onrender.com'
  : 'http://localhost:5000';