// Temporary demo configuration until backend is ready
export const API_CONFIG = {
  BASE_URL: 'https://api.rork.com', // Future production URL
  HEALTH_ENDPOINT: '/healthz',
  TIMEOUT: 3000,
} as const;

// Demo WebSocket Configuration
export const WS_CONFIG = {
  URL: 'wss://echo.websocket.events', // Demo WebSocket server
  RECONNECTION_DELAY: 500,
  RECONNECTION_DELAY_MAX: 5000,
  MAX_RECONNECTION_ATTEMPTS: 10,
  HEARTBEAT_INTERVAL: 20000, // 20 seconds
  PRESENCE_TIMEOUT: 45000, // 45 seconds
} as const;

// Temporary ping endpoints (dual check)
export const PING_ENDPOINTS = [
  'https://www.apple.com/library/test/success.html',
  'https://clients3.google.com/generate_204'
] as const;

// Full health check URL (future)
export const HEALTH_CHECK_URL = `${API_CONFIG.BASE_URL}${API_CONFIG.HEALTH_ENDPOINT}`;

// Demo WebSocket URL
export const WSS_URL = WS_CONFIG.URL;