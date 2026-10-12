/**
 * Isolated Axios API client instance.
 *
 * All frontend API calls should import `apiClient` from this module
 * instead of importing the global `axios` default. This prevents
 * interceptor pollution between unrelated modules (portals, contexts).
 *
 * Bearer token is attached dynamically via `setAuthToken()` — called
 * from AuthContext whenever the stored token changes.
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Sets (or clears) the Authorization bearer token for all subsequent requests.
 * Call with `null` on logout.
 */
export function setAuthToken(token: string | null): void {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
}

export default apiClient;
