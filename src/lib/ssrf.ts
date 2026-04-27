// SSRF guard for any user-supplied URL we may fetch server-side.
// rejects: non-http(s), private/loopback/link-local/multicast addresses,
// invalid hostnames, and unresolved hosts (when DNS lookup is enabled).

import { lookup as dnsLookup } from 'dns/promises';

const PRIVATE_IPV4_RANGES: Array<[number, number]> = [
  [ip4(10, 0, 0, 0), ip4(10, 255, 255, 255)],
  [ip4(127, 0, 0, 0), ip4(127, 255, 255, 255)],
  [ip4(169, 254, 0, 0), ip4(169, 254, 255, 255)],
  [ip4(172, 16, 0, 0), ip4(172, 31, 255, 255)],
  [ip4(192, 168, 0, 0), ip4(192, 168, 255, 255)],
  [ip4(0, 0, 0, 0), ip4(0, 255, 255, 255)],
  [ip4(100, 64, 0, 0), ip4(100, 127, 255, 255)],
  [ip4(192, 0, 0, 0), ip4(192, 0, 0, 255)],
  [ip4(192, 0, 2, 0), ip4(192, 0, 2, 255)],
  [ip4(198, 18, 0, 0), ip4(198, 19, 255, 255)],
  [ip4(198, 51, 100, 0), ip4(198, 51, 100, 255)],
  [ip4(203, 0, 113, 0), ip4(203, 0, 113, 255)],
  [ip4(224, 0, 0, 0), ip4(255, 255, 255, 255)],
];

function ip4(a: number, b: number, c: number, d: number): number {
  return ((a << 24) | (b << 16) | (c << 8) | d) >>> 0;
}

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split('.').map((p) => Number(p));
  if (parts.length !== 4) return null;
  if (parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) return null;
  return ip4(parts[0], parts[1], parts[2], parts[3]);
}

function isPrivateIpv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  if (n === null) return false;
  return PRIVATE_IPV4_RANGES.some(([lo, hi]) => n >= lo && n <= hi);
}

function isPrivateIpv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === '::' || lower === '::1') return true;
  if (lower.startsWith('fe80:') || lower.startsWith('fc') || lower.startsWith('fd')) return true;
  if (lower.startsWith('ff')) return true;
  if (lower.startsWith('::ffff:')) {
    const v4 = lower.slice(7);
    return isPrivateIpv4(v4);
  }
  return false;
}

interface SsrfOptions {
  resolveDns?: boolean;
  allowedHosts?: readonly string[];
}

export async function assertSafeUrl(rawUrl: string, opts: SsrfOptions = {}): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error('Invalid URL');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only http/https URLs are allowed');
  }

  const host = url.hostname.toLowerCase();
  if (!host) throw new Error('Missing hostname');

  if (opts.allowedHosts && opts.allowedHosts.length) {
    const ok = opts.allowedHosts.some((h) => host === h || host.endsWith(`.${h}`));
    if (!ok) throw new Error('Host not on allow list');
  }

  if (host === 'localhost' || host === 'localhost.localdomain') {
    throw new Error('localhost is not allowed');
  }
  if (host.endsWith('.local') || host.endsWith('.internal')) {
    throw new Error('internal hostnames are not allowed');
  }

  // direct ip literal
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    if (isPrivateIpv4(host)) throw new Error('Private IPv4 address blocked');
  } else if (host.includes(':') || (host.startsWith('[') && host.endsWith(']'))) {
    const stripped = host.replace(/^\[/, '').replace(/\]$/, '');
    if (isPrivateIpv6(stripped)) throw new Error('Private IPv6 address blocked');
  } else if (opts.resolveDns !== false) {
    // resolve hostname so a public DNS name pointing at a private ip can't bypass us
    try {
      const all = await dnsLookup(host, { all: true });
      for (const { address, family } of all) {
        if (family === 4 && isPrivateIpv4(address)) {
          throw new Error('DNS resolves to private IPv4');
        }
        if (family === 6 && isPrivateIpv6(address)) {
          throw new Error('DNS resolves to private IPv6');
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.startsWith('DNS resolves')) throw err;
      throw new Error('Hostname does not resolve');
    }
  }

  return url;
}

// safe fetch wrapper — applies SSRF guard, timeout, redirect follow guard, byte cap.
interface SafeFetchOptions extends RequestInit {
  timeoutMs?: number;
  maxBytes?: number;
  allowedHosts?: readonly string[];
}

export async function safeFetch(rawUrl: string, opts: SafeFetchOptions = {}): Promise<Response> {
  const { timeoutMs = 5000, maxBytes = 1_000_000, allowedHosts, ...init } = opts;
  await assertSafeUrl(rawUrl, { allowedHosts });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(rawUrl, {
      ...init,
      signal: controller.signal,
      redirect: 'manual',
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location');
      if (loc) {
        // re-validate redirect target before following
        const next = new URL(loc, rawUrl).toString();
        return safeFetch(next, { ...opts, timeoutMs });
      }
    }
    const len = Number(res.headers.get('content-length') ?? '0');
    if (len > maxBytes) {
      throw new Error(`Response exceeds ${maxBytes} bytes`);
    }
    return res;
  } finally {
    clearTimeout(timer);
  }
}
