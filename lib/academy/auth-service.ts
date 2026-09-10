import crypto from 'crypto';
import argon2 from 'argon2';

/**
 * Enhanced Security & Authentication Service for Salud Forte
 * Compliant with Argon2id, single-use hashed verification tokens,
 * RFC 6238 TOTP Multi-Factor Authentication, and YouTube video processing.
 */

// 1. Password Hashing with Argon2id
export async function hashPassword(plainPassword: string): Promise<string> {
  if (!plainPassword || plainPassword.length < 10) {
    throw new Error('La contraseña debe contener al menos 10 caracteres.');
  }
  if (plainPassword.length > 128) {
    throw new Error('La contraseña no debe exceder 128 caracteres.');
  }

  return await argon2.hash(plainPassword, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 1,
  });
}

export async function verifyPassword(passwordHash: string, candidatePassword: string): Promise<boolean> {
  if (!passwordHash || !candidatePassword) return false;
  try {
    return await argon2.verify(passwordHash, candidatePassword);
  } catch (err) {
    console.error('[AuthService] Error verifying Argon2id password:', err);
    return false;
  }
}

// 2. Single-use Cryptographic Tokens (Email verification & Password Reset)
export function generateSecureToken(ttlHours = 24): { token: string; hash: string; expiresAt: number } {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = hashToken(token);
  const expiresAt = Date.now() + ttlHours * 60 * 60 * 1000;
  return { token, hash, expiresAt };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

// 3. YouTube Video ID & Embed URL Processing
export function extractYouTubeVideoId(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  // Reject arbitrary HTML / iframes pasted
  if (trimmed.includes('<') || trimmed.includes('>')) {
    return null;
  }

  // Pure 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      if (url.pathname === '/watch') {
        const v = url.searchParams.get('v');
        if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      }
      if (url.pathname.startsWith('/embed/')) {
        const parts = url.pathname.split('/');
        const id = parts[2];
        if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
      }
      if (url.pathname.startsWith('/v/')) {
        const parts = url.pathname.split('/');
        const id = parts[2];
        if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
      }
    } else if (host === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0].split('?')[0];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }
  } catch {
    // Regex fallback
    const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function buildYouTubeEmbedUrl(
  videoId: string,
  originOrOptions?: string | { unlistedNotice?: boolean; origin?: string }
): string {
  const params = new URLSearchParams({
    enablejsapi: '1',
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
    autoplay: '0',
  });
  if (typeof originOrOptions === 'string') {
    params.set('origin', originOrOptions);
  } else if (originOrOptions?.origin) {
    params.set('origin', originOrOptions.origin);
  }
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;
}

// 4. RFC 6238 TOTP Implementation for Doctor Administrator MFA
export function generateTotpSecret(): { secret: string; otpauthUrl: string } {
  // 20 bytes Base32 secret
  const buffer = crypto.randomBytes(20);
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < buffer.length; i++) {
    secret += base32Chars[buffer[i] % 32];
  }
  const email = 'dr.mauricio.galindo@saludforte.com';
  const issuer = 'Salud Forte Medical';
  const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
  return { secret, otpauthUrl };
}

function base32ToBuffer(base32: string): Buffer {
  const clean = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const val = base32Chars.indexOf(clean[i]);
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(output);
}

export function generateTotpCode(secret: string, timestamp = Date.now()): string {
  const counter = Math.floor(timestamp / 1000 / 30);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter));

  const key = base32ToBuffer(secret);
  const hmac = crypto.createHmac('sha1', key).update(counterBuffer).digest();

  const offset = hmac[hmac.length - 1] & 0xf;
  const codeInt =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = (codeInt % 1000000).toString().padStart(6, '0');
  return otp;
}

export function verifyTotpCode(secret: string, candidateCode: string, window = 1): boolean {
  if (!secret || !candidateCode) return false;
  const normalizedCode = candidateCode.trim().replace(/\s+/g, '');
  if (normalizedCode.length !== 6) return false;

  const now = Date.now();
  for (let step = -window; step <= window; step++) {
    const expected = generateTotpCode(secret, now + step * 30 * 1000);
    if (expected === normalizedCode) {
      return true;
    }
  }
  return false;
}
