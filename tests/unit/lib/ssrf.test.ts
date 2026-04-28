import { assertSafeUrl } from '@/lib/ssrf';

describe('assertSafeUrl', () => {
  it('rejects loopback ip literal', async () => {
    await expect(assertSafeUrl('http://127.0.0.1/foo')).rejects.toThrow(/Private/);
  });

  it('rejects rfc1918 ip literal', async () => {
    await expect(assertSafeUrl('http://192.168.1.10/x')).rejects.toThrow(/Private/);
    await expect(assertSafeUrl('http://10.1.2.3/')).rejects.toThrow(/Private/);
  });

  it('rejects link-local ipv6', async () => {
    await expect(
      assertSafeUrl('http://[fe80::1]/path', { resolveDns: false }),
    ).rejects.toThrow(/Private/);
  });

  it('rejects file/ftp schemes', async () => {
    await expect(assertSafeUrl('file:///etc/passwd')).rejects.toThrow(/http/);
    await expect(assertSafeUrl('ftp://example.com/')).rejects.toThrow(/http/);
  });

  it('rejects localhost name', async () => {
    await expect(assertSafeUrl('http://localhost/x', { resolveDns: false })).rejects.toThrow(
      /localhost/,
    );
  });

  it('accepts a public hostname when DNS resolution is skipped', async () => {
    const url = await assertSafeUrl('https://example.com/path', { resolveDns: false });
    expect(url.hostname).toBe('example.com');
  });

  it('honors host allow-list', async () => {
    await expect(
      assertSafeUrl('https://evil.com/x', {
        resolveDns: false,
        allowedHosts: ['example.com'],
      }),
    ).rejects.toThrow(/allow list/);
  });
});
