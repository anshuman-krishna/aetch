import { createHmac, timingSafeEqual } from 'crypto';

// short-lived hs256 jwt for socket.io auth — replaces direct cookie/userId
// pickup so we can scale across multiple socket nodes.
//
// keep payload tiny: { sub: userId, exp: unix-seconds, iat }.
// tokens live 60s by default — clients refetch on reconnect.

const DEFAULT_TTL_SECONDS = 60;

interface SocketTokenPayload {
  sub: string;
  iat: number;
  exp: number;
}

function getSecret(): Buffer {
  const secret = process.env.SOCKET_JWT_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('SOCKET_JWT_SECRET (or NEXTAUTH_SECRET) must be set for socket auth');
  }
  return Buffer.from(secret);
}

function urlBase64Encode(buf: Buffer): string {
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function urlBase64Decode(s: string): Buffer {
  const padded = s + '='.repeat((4 - (s.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

export function mintSocketToken(userId: string, ttlSeconds = DEFAULT_TTL_SECONDS): string {
  const now = Math.floor(Date.now() / 1000);
  const header = urlBase64Encode(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = urlBase64Encode(
    Buffer.from(JSON.stringify({ sub: userId, iat: now, exp: now + ttlSeconds })),
  );
  const unsigned = `${header}.${body}`;
  const sig = urlBase64Encode(createHmac('sha256', getSecret()).update(unsigned).digest());
  return `${unsigned}.${sig}`;
}

export function verifySocketToken(token: string): SocketTokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expectedRaw = createHmac('sha256', getSecret()).update(`${header}.${body}`).digest();
  let received: Buffer;
  try {
    received = urlBase64Decode(sig);
  } catch {
    return null;
  }
  if (received.length !== expectedRaw.length) return null;
  if (!timingSafeEqual(received, expectedRaw)) return null;
  let payload: SocketTokenPayload;
  try {
    payload = JSON.parse(urlBase64Decode(body).toString());
  } catch {
    return null;
  }
  if (typeof payload.sub !== 'string' || typeof payload.exp !== 'number') return null;
  if (Math.floor(Date.now() / 1000) >= payload.exp) return null;
  return payload;
}
