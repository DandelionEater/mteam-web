// src/config.ts
export const JWT_SECRET =
  process.env.JWT_SECRET ?? '⚠️  never commit this default to git';
export const ACCESS_TOKEN_TTL = '1h';          // or "900s", "24h", etc.
export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
};