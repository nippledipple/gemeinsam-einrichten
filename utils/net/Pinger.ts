import { HEALTH_CHECK_URL } from '@/constants/config';

let inFlight = false;

export async function pingOnce(timeoutMs = 3000): Promise<boolean> {
  if (inFlight) return false; // blocke Überlappung
  inFlight = true;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(HEALTH_CHECK_URL, {
      method: 'GET',
      cache: 'no-store',
      signal: ctrl.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
    inFlight = false;
  }
}