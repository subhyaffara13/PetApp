// Central API & WebSocket configuration
// Cleanly resolves from environment variables, with Cloud Run production fallback
const isCloudRun = typeof window !== 'undefined' && window.location.hostname.includes('.run.app');
const CLOUD_RUN_BACKEND = 'https://petapp-837846168269.europe-west1.run.app';

export const API_URL: string =
  import.meta.env.VITE_API_URL || (isCloudRun ? CLOUD_RUN_BACKEND : '');

export const SOCKET_URL: string =
  import.meta.env.VITE_SOCKET_URL || (isCloudRun ? CLOUD_RUN_BACKEND : '');

export const GOOGLE_CLIENT_ID: string =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '837846168269-2vcne5mpb3rgilrrmaqj2cgivucp94ps.apps.googleusercontent.com';

