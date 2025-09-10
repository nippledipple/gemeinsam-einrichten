import { HEALTH_URL } from '@/constants/config';

let inFlight = false;

export async function pingOnce(timeoutMs = 5000): Promise<boolean> {
  if (inFlight) return false; // Prevent overlapping pings
  inFlight = true;
  
  try {
    const result = await pingEndpoint(HEALTH_URL, timeoutMs);
    return result;
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
    
    return res.ok;
  } catch (error) {
    console.log(`[PING] Failed to reach ${url}:`, error);
    return false;
  } finally {
    clearTimeout(timeout);
  }
}