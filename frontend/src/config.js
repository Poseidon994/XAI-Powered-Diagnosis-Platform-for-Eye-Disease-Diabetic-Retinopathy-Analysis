/**
 * src/config.js
 * ─────────────
 * Single source of truth for the backend API URL.
 *
 * Local dev  : set nothing — defaults to http://localhost:5000
 * Docker     : docker-compose passes REACT_APP_API_URL at build time
 * Production : set REACT_APP_API_URL in your CI/CD or .env before building
 */
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default API_URL;