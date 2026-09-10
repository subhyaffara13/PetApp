// Central API & WebSocket configuration
// Cleanly resolves from environment variables without exposing backend infrastructure endpoints in source code
export const API_URL: string =
  import.meta.env.VITE_API_URL || '';

export const SOCKET_URL: string =
  import.meta.env.VITE_SOCKET_URL || '';

