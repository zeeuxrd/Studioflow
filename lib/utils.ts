export function generateDownloadToken(): string {
  const chars = 'abcdef0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

export function generateTxRef(prefix: string, userId: string): string {
  return `${prefix}_${userId.slice(0, 8)}_${Date.now()}`;
}
