// API Configuration
// TODO: Update BASE_URL to match your actual backend domain
export const API_CONFIG = {
  // Replace with your actual backend URL (e.g., 'https://your-api.example.com')
  BASE_URL: 'https://api.rork.com',
  
  // Health check endpoint - should return HTTP 200 OK
  HEALTH_ENDPOINT: '/healthz',
  
  // Request timeout in milliseconds
  TIMEOUT: 3000,
} as const;

// Full health check URL
export const HEALTH_CHECK_URL = `${API_CONFIG.BASE_URL}${API_CONFIG.HEALTH_ENDPOINT}`;

// Example backend health endpoint implementation:
// GET /healthz
// Response: { "status": "ok" } with HTTP 200 status