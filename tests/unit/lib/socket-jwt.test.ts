import { mintSocketToken, verifySocketToken } from '@/lib/socket-jwt';

const ORIGINAL_SECRET = process.env.SOCKET_JWT_SECRET;

describe('socket-jwt', () => {
  beforeAll(() => {
    process.env.SOCKET_JWT_SECRET = 'test-secret-do-not-use-in-prod';
  });

  afterAll(() => {
    process.env.SOCKET_JWT_SECRET = ORIGINAL_SECRET;
  });

  it('mints a token that verifies back to the user id', () => {
    const token = mintSocketToken('user-123');
    const payload = verifySocketToken(token);
    expect(payload?.sub).toBe('user-123');
    expect(payload?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('rejects tampered tokens', () => {
    const token = mintSocketToken('user-123');
    const tampered = token.slice(0, -2) + 'xx';
    expect(verifySocketToken(tampered)).toBeNull();
  });

  it('rejects expired tokens', () => {
    const token = mintSocketToken('user-123', -10);
    expect(verifySocketToken(token)).toBeNull();
  });

  it('returns null for malformed tokens', () => {
    expect(verifySocketToken('not.a.token')).toBeNull();
    expect(verifySocketToken('only-one-segment')).toBeNull();
  });
});
