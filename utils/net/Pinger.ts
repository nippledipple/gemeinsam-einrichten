import { HEALTH_URL, FALLBACK_PING_ENDPOINTS } from '@/constants/config';

let inFlight = false;

export async function pingOnce(timeoutMs = 3000): Promise<boolean> {
  if (inFlight) return false; // Prevent overlapping pings
  inFlight = true;
  
  try {
    // First try the health endpoint
    const healthResult = await pingEndpoint(HEALTH_URL, timeoutMs);
    if (healthResult) {
      return true;
    }
    
    // If health check fails, try fallback endpoints
    console.log('[PING] Health check failed, trying fallback endpoints');
    const fallbackPromises = FALLBACK_PING_ENDPOINTS.map(url => 
      pingEndpoint(url, timeoutMs)
    );
    
    const fallbackResults = await Promise.all(fallbackPromises);
    // Both fallback endpoints must succeed
    return fallbackResults.every(result => result === true);
    
  } catch (error) {
    console.error('[PING] Ping failed:', error);
    return false;
  } finally {
    inFlight = false;
  }
}

async function pingEndpoint(url: string, timeoutMs: number): Promise<boolean> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), timeoutMs);
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      signal: ctrl.signal,
    });
    
    // Health endpoint should return 200, others may return 200 or 204
    return res.ok || res.status === 204;
  } catch (error) {
    console.log(`[PING] Failed to reach ${url}:`, error);
    return false;
  } finally {
    clearTimeout(timeout);
  }
}