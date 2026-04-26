import { buildUploadKey, presignUploadUrl } from '@/lib/signed-upload';

describe('buildUploadKey', () => {
  it('produces scope/userId/timestamp-rand.ext shape', () => {
    const k = buildUploadKey('tattoos', 'u1', 'webp');
    expect(k).toMatch(/^tattoos\/u1\/\d+-[a-z0-9]+\.webp$/);
  });

  it('falls back to bin for unsafe ext', () => {
    const k = buildUploadKey('avatars', 'u1', '../etc/passwd');
    expect(k.endsWith('.bin')).toBe(true);
  });
});

describe('presignUploadUrl', () => {
  beforeEach(() => {
    process.env.S3_ENDPOINT = 'https://s3.example.com';
    process.env.S3_ACCESS_KEY = 'AKIAEXAMPLE';
    process.env.S3_SECRET_KEY = 'SECRETKEY';
    process.env.S3_REGION = 'auto';
  });

  it('throws when credentials missing', () => {
    delete process.env.S3_ACCESS_KEY;
    expect(() =>
      presignUploadUrl({ bucket: 'b', key: 'k.webp', contentType: 'image/webp' }),
    ).toThrow(/S3 credentials/);
  });

  it('returns a PUT url with sigv4 query params', () => {
    const out = presignUploadUrl({
      bucket: 'mybucket',
      key: 'tattoos/u1/file.webp',
      contentType: 'image/webp',
    });
    expect(out.method).toBe('PUT');
    expect(out.url).toContain('mybucket/tattoos/u1/file.webp');
    expect(out.url).toContain('X-Amz-Algorithm=AWS4-HMAC-SHA256');
    expect(out.url).toContain('X-Amz-Signature=');
    expect(out.url).toContain('X-Amz-Expires=');
    expect(out.headers['Content-Type']).toBe('image/webp');
    expect(new Date(out.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('clamps expiresIn to [60, 3600]', () => {
    const short = presignUploadUrl({
      bucket: 'b',
      key: 'k.webp',
      contentType: 'image/webp',
      expiresInSeconds: 5,
    });
    const long = presignUploadUrl({
      bucket: 'b',
      key: 'k.webp',
      contentType: 'image/webp',
      expiresInSeconds: 100_000,
    });
    expect(short.url).toContain('X-Amz-Expires=60');
    expect(long.url).toContain('X-Amz-Expires=3600');
  });
});
