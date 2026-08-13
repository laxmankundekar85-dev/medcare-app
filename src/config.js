// src/config.js

// Vite automatically sets PROD to true when building for production, 
// and DEV to true during local development (npm run dev)
const isProduction = import.meta.env.PROD;

// Prioritize explicit VITE_API_BASE_URL environment variable if present,
// otherwise dynamically toggle between Render production backend and local development server.
export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL ||
  (isProduction
    ? 'https://medcare-app-qyao.onrender.com'
    : 'http://localhost:5000');