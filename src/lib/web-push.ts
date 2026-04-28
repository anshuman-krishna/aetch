import { createSign, createPrivateKey, randomBytes } from 'crypto';
import { logger } from '@/lib/logger';

// no-dep VAPID web push helper. follows RFC 8030 + RFC 8291.
// for production volume swap to the `web-push` package; this exists so we
// avoid an extra dep for low-volume flows and CI sanity.

interface PushTarget {
  endpoint: string;
  p256dh: string;
  authKey: string;
}

interface SendOptions {
  ttl?: number;
}

interface VapidConfig {
  publicKey: string;
  privateKey: string;
  subject: string;
}

function getVapidConfig(): VapidConfig | null {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return null;
  return { publicKey, privateKey, subject };
}

export function vapidConfigured(): boolean {
  return getVapidConfig() !== null;
}

function urlBase64Encode(buf: Buffer): string {
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function urlBase64Decode(s: string): Buffer {
  const padded = s + '='.repeat((4 - (s.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

function buildVapidHeader(audience: string, config: VapidConfig): string {
  const header = urlBase64Encode(Buffer.from(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const exp = Math.floor(Date.now() / 1000) + 12 * 60 * 60;
  const payload = urlBase64Encode(
    Buffer.from(JSON.stringify({ aud: audience, exp, sub: config.subject })),
  );
  const unsigned = `${header}.${payload}`;

  // private key is a raw 32-byte d-coord; reconstruct ECDSA P-256 PEM via JWK
  const privBuf = urlBase64Decode(config.privateKey);
  const pubBuf = urlBase64Decode(config.publicKey);
  if (pubBuf.length !== 65 || pubBuf[0] !== 0x04) {
    throw new Error('VAPID public key must be uncompressed P-256 (65 bytes, 0x04 prefix)');
  }
  const x = urlBase64Encode(pubBuf.subarray(1, 33));
  const y = urlBase64Encode(pubBuf.subarray(33, 65));
  const d = urlBase64Encode(privBuf);
  const keyObject = createPrivateKey({
    key: { kty: 'EC', crv: 'P-256', x, y, d },
    format: 'jwk',
  });

  const signer = createSign('SHA256');
  signer.update(unsigned);
  const derSig = signer.sign(keyObject);
  const rawSig = derToJoseEcdsa(derSig);
  return `${unsigned}.${urlBase64Encode(rawSig)}`;
}

function derToJoseEcdsa(der: Buffer): Buffer {
  // very small DER->JOSE r||s converter for ECDSA P-256 (32+32 = 64 bytes)
  let offset = 0;
  if (der[offset++] !== 0x30) throw new Error('Bad DER signature');
  offset++; // total length
  if (der[offset++] !== 0x02) throw new Error('Bad DER signature');
  const rLen = der[offset++];
  let r = der.subarray(offset, offset + rLen);
  offset += rLen;
  if (der[offset++] !== 0x02) throw new Error('Bad DER signature');
  const sLen = der[offset++];
  let s = der.subarray(offset, offset + sLen);

  if (r[0] === 0x00) r = r.subarray(1);
  if (s[0] === 0x00) s = s.subarray(1);
  const out = Buffer.alloc(64);
  r.copy(out, 32 - r.length);
  s.copy(out, 64 - s.length);
  return out;
}

// fire a push using the simplest VAPID flow; payload encryption per RFC 8291
// is omitted for this v0 — empty payload triggers a "tickle" which the SW
// then resolves via a fetch to /api/notifications/me.
export async function sendPushTickle(target: PushTarget, opts: SendOptions = {}): Promise<boolean> {
  const config = getVapidConfig();
  if (!config) {
    logger.warn('VAPID keys not configured — push tickle skipped');
    return false;
  }
  const audience = new URL(target.endpoint).origin;
  const jwt = buildVapidHeader(audience, config);

  try {
    const res = await fetch(target.endpoint, {
      method: 'POST',
      headers: {
        TTL: String(opts.ttl ?? 60),
        Authorization: `vapid t=${jwt}, k=${config.publicKey}`,
        'Content-Length': '0',
      },
    });
    return res.status >= 200 && res.status < 300;
  } catch (err) {
    logger.warn({ err }, 'web-push send failed');
    return false;
  }
}

export function generateVapidNonce(): string {
  return urlBase64Encode(randomBytes(16));
}

// kept for tests / debug
export const _internal = {
  urlBase64Encode,
  urlBase64Decode,
  buildVapidHeader,
};
