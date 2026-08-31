// Central API URL configuration
// Automatically connects to live Cloud Run Backend in production if VITE_API_URL is not explicitly injected.
export const API_URL: string =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
    ? 'https://petapp-837846168269.europe-west1.run.app'
    : 'http://localhost:3000');

export const SOCKET_URL: string =
  import.meta.env.VITE_SOCKET_URL ||
  (typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
    ? 'https://petapp-837846168269.europe-west1.run.app'
    : 'http://localhost:3000');
