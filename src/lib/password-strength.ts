/**
 * Client-safe strength estimate for the sign-up meter. Kept in its own module
 * so the browser bundle does not have to pull in the validation schemas.
 * The authoritative rules still live server-side in `validation.ts`.
 */
const COMMON = new Set([
  "password",
  "password1",
  "password123",
  "passw0rd",
  "12345678",
  "123456789",
  "1234567890",
  "qwertyuiop",
  "letmein123",
  "iloveyou1",
  "welcome123",
  "admin12345",
  "softsystem",
]);

export const STRENGTH_LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"] as const;

export function passwordStrength(password: string): number {
  if (!password) return 0;
  if (COMMON.has(password.toLowerCase())) return 0;
  if (/^(.)\1+$/.test(password)) return 0;
  let score = 0;
  if (password.length >= 10) score++;
  if (password.length >= 14) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) && /[^\w\s]/.test(password)) score++;
  return Math.min(4, score);
}
