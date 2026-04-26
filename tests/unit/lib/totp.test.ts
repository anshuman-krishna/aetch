import {
  consumeRecoveryCode,
  generateRecoveryCodes,
  generateSecret,
  otpauthUri,
  verifyToken,
} from '@/lib/totp';
import { createHmac } from 'node:crypto';

beforeEach(() => jest.useRealTimers());

function base32Decode(str: string): Buffer {
  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of str.toUpperCase().replace(/=+$/, '')) {
    const idx = ALPHA.indexOf(ch);
    if (idx < 0) throw new Error('bad b32');
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

function totpAt(secret: string, ts: number): string {
  const counter = Math.floor(ts / 1000 / 30);
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  const hmac = createHmac('sha1', base32Decode(secret)).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (code % 1_000_000).toString().padStart(6, '0');
}

describe('generateSecret', () => {
  it('returns base32 chars only', () => {
    const s = generateSecret();
    expect(s).toMatch(/^[A-Z2-7]+$/);
  });
  it('respects byte length (8 bits → ceil(8/5)=13 chars per 8 bytes)', () => {
    expect(generateSecret(10).length).toBeGreaterThanOrEqual(16);
  });
});

describe('otpauthUri', () => {
  it('formats label issuer:account + secret param', () => {
    const u = otpauthUri({ secret: 'JBSWY3DPEHPK3PXP', account: 'a@b.com', issuer: 'AETCH' });
    expect(u).toMatch(/^otpauth:\/\/totp\/AETCH%3Aa%40b\.com\?/);
    expect(u).toContain('secret=JBSWY3DPEHPK3PXP');
    expect(u).toContain('issuer=AETCH');
    expect(u).toContain('digits=6');
    expect(u).toContain('period=30');
  });
});

describe('verifyToken', () => {
  const secret = 'JBSWY3DPEHPK3PXP';
  const fixedNow = 1_700_000_000_000;

  it('accepts a freshly computed token', () => {
    jest.useFakeTimers().setSystemTime(fixedNow);
    const token = totpAt(secret, fixedNow);
    expect(verifyToken(secret, token)).toBe(true);
  });

  it('accepts +/- 1 step drift inside window', () => {
    jest.useFakeTimers().setSystemTime(fixedNow);
    const earlier = totpAt(secret, fixedNow - 30 * 1000);
    const later = totpAt(secret, fixedNow + 30 * 1000);
    expect(verifyToken(secret, earlier)).toBe(true);
    expect(verifyToken(secret, later)).toBe(true);
  });

  it('rejects 2-step drift with default window', () => {
    jest.useFakeTimers().setSystemTime(fixedNow);
    const tooOld = totpAt(secret, fixedNow - 90 * 1000);
    expect(verifyToken(secret, tooOld)).toBe(false);
  });

  it('rejects malformed input', () => {
    expect(verifyToken(secret, 'abcdef')).toBe(false);
    expect(verifyToken(secret, '123')).toBe(false);
    expect(verifyToken(secret, '12345')).toBe(false);
    expect(verifyToken(secret, '1234567')).toBe(false);
  });
});

describe('recovery codes', () => {
  it('generates n unique 8-char codes', () => {
    const codes = generateRecoveryCodes(5);
    expect(codes).toHaveLength(5);
    expect(new Set(codes).size).toBe(5);
    codes.forEach((c) => expect(c).toMatch(/^[A-F0-9]{8}$/));
  });

  it('consumeRecoveryCode removes used and is case-insensitive', () => {
    const codes = ['AAAAAAA1', 'BBBBBBB2'];
    const remaining = consumeRecoveryCode(codes, 'aaaaaaa1');
    expect(remaining).toEqual(['BBBBBBB2']);
  });

  it('consumeRecoveryCode returns null on miss', () => {
    expect(consumeRecoveryCode(['AAAA1111'], 'XXXX')).toBeNull();
  });
});
