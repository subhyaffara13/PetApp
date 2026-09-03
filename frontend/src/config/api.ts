// Central API URL configuration
// Automatically connects to live Cloud Run Backend
export const API_URL: string =
  import.meta.env.VITE_API_URL || 'https://petapp-837846168269.europe-west1.run.app';

export const SOCKET_URL: string =
  import.meta.env.VITE_SOCKET_URL || 'https://petapp-837846168269.europe-west1.run.app';

