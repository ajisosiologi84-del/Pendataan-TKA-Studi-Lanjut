/**
 * Utility for input sanitization and XSS protection
 */

export function sanitizeText(input: string | undefined | null): string {
  if (!input) return '';
  return String(input)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript pseudo protocol
    .replace(/on\w+=/gi, '') // Remove inline event handlers like onload=, onerror=
    .trim();
}

export function sanitizeNis(nis: string | undefined | null): string {
  if (!nis) return '';
  // Only allow alphanumeric, numbers, dashes, and dots for NIS/NISN
  return String(nis).replace(/[^a-zA-Z0-9.-]/g, '').trim();
}

export function isValidNisFormat(nis: string): boolean {
  if (!nis || nis.trim().length === 0) return false;
  // NIS usually 3-15 characters alphanumeric
  return /^[a-zA-Z0-9.-]{3,20}$/.test(nis.trim());
}
