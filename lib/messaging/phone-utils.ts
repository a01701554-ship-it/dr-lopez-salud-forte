/**
 * Phone Number Normalization Utility
 * Specifically validates and formats Mexican and international telephone numbers to E.164.
 * Examples:
 *  - "4421234567" -> "+524421234567"
 *  - "+524421234567" -> "+524421234567"
 *  - "52 442 123 4567" -> "+524421234567"
 *  - "+52 442 123 4567" -> "+524421234567"
 *  - "5214421234567" -> "+524421234567" (stripping obsolete WhatsApp mobile '1' prefix)
 */

export function normalizeWhatsAppNumber(phone: string): string {
  if (!phone) return '';

  // Strip all non-digit characters except leading plus
  const cleaned = phone.trim().replace(/[^\d+]/g, '');

  // Strip leading plus to analyze pure numeric string
  let digits = cleaned.replace(/^\+/, '');

  // Safeguard against accidental double country code (e.g. +5252442... or 5252442...)
  while (digits.startsWith('5252') && digits.length >= 14) {
    digits = digits.slice(2);
  }

  // Handle legacy Mexican long-distance/mobile carrier prefixes: 044, 045, 01
  if ((digits.startsWith('044') || digits.startsWith('045')) && digits.length === 13) {
    digits = `52${digits.slice(3)}`;
  } else if (digits.startsWith('01') && digits.length === 12) {
    digits = `52${digits.slice(2)}`;
  }

  // Case 1: Standard 10-digit Mexican local number (e.g. 4421234567) -> prefix with 52
  if (digits.length === 10) {
    digits = `52${digits}`;
  }

  // Case 2: 13-digit legacy format with mobile '1' (e.g. 5214421234567) -> remove the '1'
  if (digits.length === 13 && digits.startsWith('521')) {
    digits = `52${digits.slice(3)}`;
  }

  // Case 3: 12-digit standard Mexican number starting with 52
  if (digits.length === 12 && digits.startsWith('52')) {
    // Already in correct 52XXXXXXXXXX format
  }

  return `+${digits}`;
}

export function maskPhoneNumber(phone: string): string {
  const normalized = normalizeWhatsAppNumber(phone);
  if (normalized.length <= 4) return normalized;
  const lastFour = normalized.slice(-4);
  return `•••• ${lastFour}`;
}
