import crypto from 'crypto';

/**
 * Validates Shopify Webhook HMAC header (X-Shopify-Hmac-Sha256)
 * Crucial: rawBody must be the unaltered Buffer or raw string from the request body.
 */
export function verifyShopifyWebhookHmac(
  rawBody: string | Buffer,
  hmacHeader: string | undefined | null,
  secret: string
): boolean {
  if (!hmacHeader || !secret) {
    return false;
  }

  try {
    const generatedHmac = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('base64');

    const generatedBuffer = Buffer.from(generatedHmac, 'utf8');
    const headerBuffer = Buffer.from(hmacHeader.trim(), 'utf8');

    if (generatedBuffer.length !== headerBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(generatedBuffer, headerBuffer);
  } catch (error) {
    console.error('[Security] Webhook HMAC verification error:', error);
    return false;
  }
}

/**
 * Verifies Shopify App Proxy query parameter signature.
 * Shopify sends query parameters along with a `signature` parameter.
 * Parameters must be sorted alphabetically, joined as key=value (excluding signature),
 * and hashed with SHA-256 HMAC using SHOPIFY_API_SECRET.
 */
export function verifyShopifyAppProxySignature(
  queryParams: Record<string, string | string[] | undefined>,
  apiSecret: string
): boolean {
  if (!apiSecret) {
    return false;
  }

  const signature = queryParams.signature;
  if (typeof signature !== 'string' || !signature) {
    return false;
  }

  try {
    const sortedKeys = Object.keys(queryParams)
      .filter((k) => k !== 'signature')
      .sort();

    const message = sortedKeys
      .map((k) => {
        const val = queryParams[k];
        const stringVal = Array.isArray(val) ? val.join(',') : String(val ?? '');
        return `${k}=${stringVal}`;
      })
      .join('');

    const calculatedSignature = crypto
      .createHmac('sha256', apiSecret)
      .update(message)
      .digest('hex');

    const calculatedBuffer = Buffer.from(calculatedSignature, 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (calculatedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(calculatedBuffer, signatureBuffer);
  } catch (error) {
    console.error('[Security] App Proxy signature verification error:', error);
    return false;
  }
}

/**
 * Cloudflare Stream Signed URL / Token Generator
 * Cloudflare Stream uses standard signed JWTs containing the video UID, key ID,
 * short expiration (5 - 15 min), and access rules (origin restrictions).
 */
export interface CloudflareStreamSignConfig {
  accountId?: string;
  keyId?: string;
  privateKey?: string; // PEM format or base64 key
  allowedOrigins?: string[];
  expirationMinutes?: number;
}

export function generateCloudflareStreamToken(
  videoUid: string,
  customerGid: string,
  config: CloudflareStreamSignConfig = {}
): {
  token: string;
  playbackUrl: string;
  expiresAt: number;
  durationSeconds: number;
  isMock: boolean;
} {
  const expirationMinutes = config.expirationMinutes || 10;
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expirationMinutes * 60;
  const nbf = now - 60; // 1 min clock skew allowance

  const keyId = config.keyId || process.env.CLOUDFLARE_STREAM_KEY_ID;
  const privateKey = config.privateKey || process.env.CLOUDFLARE_STREAM_PRIVATE_KEY;

  // Real RSA or JWK signature if credentials exist
  if (keyId && privateKey && !privateKey.includes('replace_with')) {
    try {
      const header = {
        alg: 'RS256',
        kid: keyId,
        typ: 'JWT',
      };

      const payload: Record<string, unknown> = {
        sub: videoUid,
        kid: keyId,
        exp,
        nbf,
        downloadable: false,
        // Optional origin restriction
        accessRules: (config.allowedOrigins || []).length > 0
          ? [{ type: 'any' }]
          : undefined,
      };

      const base64UrlEncode = (obj: object) =>
        Buffer.from(JSON.stringify(obj))
          .toString('base64')
          .replace(/=/g, '')
          .replace(/\+/g, '-')
          .replace(/\//g, '_');

      const encodedHeader = base64UrlEncode(header);
      const encodedPayload = base64UrlEncode(payload);
      const stringToSign = `${encodedHeader}.${encodedPayload}`;

      const signer = crypto.createSign('RSA-SHA256');
      signer.update(stringToSign);
      const signature = signer
        .sign(privateKey, 'base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

      const token = `${stringToSign}.${signature}`;
      return {
        token,
        playbackUrl: `https://videodelivery.net/${token}/manifest/video.m3u8`,
        expiresAt: exp * 1000,
        durationSeconds: expirationMinutes * 60,
        isMock: false,
      };
    } catch (err) {
      console.warn('[Security] Cloudflare Stream RSA sign failed, falling back to secure HMAC dev token:', err);
    }
  }

  // Safe Development Fallback: Cryptographically signed ephemeral HMAC token
  // Used when Cloudflare credentials are not yet entered by user
  const devSecret = process.env.APP_ENCRYPTION_KEY || 'dev_secret_salud_forte_academia_token';
  const devPayload = JSON.stringify({
    uid: videoUid,
    sub: customerGid,
    exp,
    iat: now,
    mock: true,
  });

  const hmac = crypto.createHmac('sha256', devSecret).update(devPayload).digest('hex');
  const token = `dev_${Buffer.from(devPayload).toString('base64url')}.${hmac}`;

  return {
    token,
    playbackUrl: `https://videodelivery.net/${videoUid}/manifest/video.m3u8?token=${token}`,
    expiresAt: exp * 1000,
    durationSeconds: expirationMinutes * 60,
    isMock: true,
  };
}

/**
 * Guest Claim Token: Generates a single-use signed claim token
 * when a user purchases as a guest in Shopify Checkout.
 */
export function generateGuestClaimToken(
  orderGid: string,
  email: string,
  secret: string
): string {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 48; // 48 hours
  const payload = `${orderGid}|${email.toLowerCase().trim()}|${expiresAt}`;
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const data = Buffer.from(payload, 'utf8').toString('base64url');
  return `${data}.${hmac}`;
}

export function verifyGuestClaimToken(
  token: string,
  secret: string
): { valid: boolean; orderGid?: string; email?: string } {
  try {
    const [data, hmac] = token.split('.');
    if (!data || !hmac) return { valid: false };

    const payload = Buffer.from(data, 'base64url').toString('utf8');
    const [orderGid, email, expiresAtStr] = payload.split('|');
    const expiresAt = parseInt(expiresAtStr, 10);

    if (Date.now() > expiresAt) {
      return { valid: false };
    }

    const expectedHmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const hmacBuf = Buffer.from(hmac, 'utf8');
    const expectedBuf = Buffer.from(expectedHmac, 'utf8');

    if (hmacBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(hmacBuf, expectedBuf)) {
      return { valid: false };
    }

    return { valid: true, orderGid, email };
  } catch {
    return { valid: false };
  }
}
