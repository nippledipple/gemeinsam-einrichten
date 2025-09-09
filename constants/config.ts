// Production Backend Configuration
export const API_CONFIG = {
  BASE_URL: 'https://api.rork.com',
  HEALTH_ENDPOINT: '/healthz',
  TIMEOUT: 3000,
} as const;

// Production WebSocket Configuration
export const WS_CONFIG = {
  URL: 'wss://api.rork.com/realtime', // Production WebSocket server
  RECONNECTION_DELAY: 500,
  RECONNECTION_DELAY_MAX: 5000,
  MAX_RECONNECTION_ATTEMPTS: 10,
  HEARTBEAT_INTERVAL: 20000, // 20 seconds
  PRESENCE_TIMEOUT: 45000, // 45 seconds
} as const;

// Production URLs
export const HEALTH_URL = `${API_CONFIG.BASE_URL}${API_CONFIG.HEALTH_ENDPOINT}`;
export const WSS_URL = WS_CONFIG.URL;

// Fallback ping endpoints (if health check fails)
export const FALLBACK_PING_ENDPOINTS = [
  'https://www.apple.com/library/test/success.html',
  'https://clients3.google.com/generate_204'
] as const;