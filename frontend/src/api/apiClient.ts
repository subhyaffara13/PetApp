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
 * 
 * Synchronizes with both `apiClient` instance and global `axios.defaults` so
 * that all components using either client carry the authenticated JWT.
 */
export function setAuthToken(token: string | null): void {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['Authorization'];
  }
}

// Bootstrap token on initial module load from localStorage if available
try {
  if (typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem('petsos_auth_v2');
    if (raw) {
      let jsonStr = raw;
      if (!raw.trim().startsWith('{')) {
        const key = 0x5a;
        let dec = '';
        const decoded = atob(raw);
        for (let i = 0; i < decoded.length; i++) {
          dec += String.fromCharCode(decoded.charCodeAt(i) ^ key);
        }
        jsonStr = dec;
      }
      const parsed = JSON.parse(jsonStr);
      if (parsed?.accessToken) {
        setAuthToken(parsed.accessToken);
      }
    }
  }
} catch {
  // Ignore fallback bootstrap errors
}

export default apiClient;
