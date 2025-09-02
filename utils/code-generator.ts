export function generateSpaceCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function isCodeExpired(expiry?: number): boolean {
  if (!expiry) return true;
  return Date.now() > expiry;
}