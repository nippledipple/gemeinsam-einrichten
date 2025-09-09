let inFlight = false;

// TODO: In production, replace with single health check:
// - Use only https://api.rork.com/healthz
// - Remove dual endpoint checking
// Temporary dual ping check until backend is ready
const PING_ENDPOINTS = [
  'https://www.apple.com/library/test/success.html', // Should return 200
  'https://clients3.google.com/generate_204' // Should return 204
] as const;

export async function pingOnce(timeoutMs = 3000): Promise<boolean> {
  if (inFlight) return false; // blocke Überlappung
  inFlight = true;
  
  try {
    // Test both endpoints in parallel
    const promises = PING_ENDPOINTS.map(async (url) => {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), timeoutMs);
      
      try {
        const res = await fetch(url, {
          method: 'GET',
          cache: 'no-store',
          signal: ctrl.signal,
        });
        
        // Apple endpoint returns 200, Google returns 204
        const isSuccess = url.includes('apple.com') ? res.ok : (res.ok || res.status === 204);
        return isSuccess;
      } catch {
        return false;
      } finally {
        clearTimeout(t);
      }
    });
    
    const results = await Promise.all(promises);
    // Both endpoints must succeed for true result
    return results.every(result => result === true);
    
  } catch {
    return false;
  } finally {
    inFlight = false;
  }
}