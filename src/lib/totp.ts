import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// rfc6238 totp with rfc4648 base32 secrets (no external dep)

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const STEP_SECONDS = 30;
const DIGITS = 6;

function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

function base32Decode(str: string): Buffer {
  const cleaned = str.replace(/=+$/, '').toUpperCase().replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of cleaned) {
    const idx = BASE32_ALPHABET.indexOf(ch);
    if (idx < 0) throw new Error('invalid base32 character');
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

function counterBuffer(counter: number): Buffer {
  const buf = Buffer.alloc(8);
  // js bitwise on numbers is 32-bit, write as two halves
  const high = Math.floor(counter / 0x100000000);
  const low = counter >>> 0;
  buf.writeUInt32BE(high, 0);
  buf.writeUInt32BE(low, 4);
  return buf;
}

// generate a fresh secret as base32
export function generateSecret(byteLength = 20): string {
  return base32Encode(randomBytes(byteLength));
}

// build otpauth uri for qr code rendering
export function otpauthUri({
  secret,
  account,
  issuer = 'AETCH',
}: {
  secret: string;
  account: string;
  issuer?: string;
}): string {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: String(DIGITS),
    period: String(STEP_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

function totpForCounter(secret: string, counter: number): string {
  const key = base32Decode(secret);
  const hmac = createHmac('sha1', key).update(counterBuffer(counter)).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (code % 10 ** DIGITS).toString().padStart(DIGITS, '0');
}

// verify with +/- 1 step drift window
export function verifyToken(secret: string, token: string, window = 1): boolean {
  if (!/^\d{6}$/.test(token)) return false;
  const now = Math.floor(Date.now() / 1000 / STEP_SECONDS);
  const expected = Buffer.from(token);
  for (let i = -window; i <= window; i++) {
    const candidate = Buffer.from(totpForCounter(secret, now + i));
    if (candidate.length === expected.length && timingSafeEqual(candidate, expected)) {
      return true;
    }
  }
  return false;
}

// 8-char recovery codes
export function generateRecoveryCodes(count = 10): string[] {
  return Array.from({ length: count }, () =>
    randomBytes(5).toString('hex').slice(0, 8).toUpperCase(),
  );
}

export function consumeRecoveryCode(codes: string[], submitted: string): string[] | null {
  const normalized = submitted.trim().toUpperCase();
  const idx = codes.findIndex((c) => c === normalized);
  if (idx === -1) return null;
  return codes.filter((_, i) => i !== idx);
}
