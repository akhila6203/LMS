/**
 * Single source for API base URL.
 * Set VITE_API_URL in .env (e.g. http://localhost:5000/api)
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default API_BASE_URL;
