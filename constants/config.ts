export const HEALTH_URL = 'https://y485kjs73qlaycog44fhb.rork.app/healthz';
export const WSS_URL = 'wss://y485kjs73qlaycog44fhb.rork.app/realtime';

// Backend Configuration
export const API_CONFIG = {
  BASE_URL: 'https://y485kjs73qlaycog44fhb.rork.app',
  HEALTH_ENDPOINT: '/healthz',
  TIMEOUT: 5000,
} as const;

// WebSocket Configuration
export const WS_CONFIG = {
  URL: 'wss://y485kjs73qlaycog44fhb.rork.app',
  PATH: '/realtime',
  RECONNECTION_DELAY: 500,
  RECONNECTION_DELAY_MAX: 5000,
  MAX_RECONNECTION_ATTEMPTS: 10,
  HEARTBEAT_INTERVAL: 20000, // 20 seconds
  PRESENCE_TIMEOUT: 45000, // 45 seconds
} as const;