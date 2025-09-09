let inFlight = false;

export async function pingOnce(timeoutMs = 3000): Promise<boolean> {
  if (inFlight) return false; // blocke Überlappung
  inFlight = true;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch('https://clients3.google.com/generate_204', {
      method: 'GET',
      cache: 'no-store',
      signal: ctrl.signal,
    });
    return res.ok || res.status === 204;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
    inFlight = false;
  }
}