import { prisma } from '@/lib/prisma';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { safeFetch } from '@/lib/ssrf';
import { logger } from '@/lib/logger';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const FETCH_BYTE_CAP = 200_000;

interface PreviewData {
  url: string;
  canonicalUrl?: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

export async function getLinkPreview(rawUrl: string): Promise<PreviewData | null> {
  if (!isFeatureEnabled('LINK_PREVIEWS_ENABLED')) return null;

  const url = normalizeUrl(rawUrl);
  if (!url) return null;

  const cached = await prisma.linkPreview.findUnique({ where: { url } });
  if (cached && cached.expiresAt > new Date()) {
    return toPreviewData(cached);
  }

  let preview: PreviewData;
  try {
    preview = await fetchPreview(url);
  } catch (err) {
    logger.warn({ err, url }, 'link preview fetch failed');
    return null;
  }

  await prisma.linkPreview.upsert({
    where: { url },
    create: {
      url,
      canonicalUrl: preview.canonicalUrl,
      title: preview.title,
      description: preview.description,
      image: preview.image,
      siteName: preview.siteName,
      expiresAt: new Date(Date.now() + CACHE_TTL_MS),
    },
    update: {
      canonicalUrl: preview.canonicalUrl,
      title: preview.title,
      description: preview.description,
      image: preview.image,
      siteName: preview.siteName,
      fetchedAt: new Date(),
      expiresAt: new Date(Date.now() + CACHE_TTL_MS),
    },
  });

  return preview;
}

function normalizeUrl(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl);
    u.hash = '';
    return u.toString();
  } catch {
    return null;
  }
}

async function fetchPreview(url: string): Promise<PreviewData> {
  const res = await safeFetch(url, {
    maxBytes: FETCH_BYTE_CAP,
    headers: {
      accept: 'text/html,application/xhtml+xml',
      'user-agent': 'AetchBot/1.0 (link preview)',
    },
  });
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('html')) {
    return { url };
  }
  const text = (await res.text()).slice(0, FETCH_BYTE_CAP);
  return { url, ...parseMetadata(text, url) };
}

function parseMetadata(html: string, baseUrl: string): Omit<PreviewData, 'url'> {
  const get = (re: RegExp) => {
    const m = html.match(re);
    return m ? decodeHtml(m[1].trim()) : undefined;
  };

  const ogTitle = get(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  const ogDesc = get(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
  const ogImage = get(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  const ogSite = get(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i);
  const twImage = get(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
  const desc = get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  const title = get(/<title[^>]*>([^<]+)<\/title>/i);
  const canonical = get(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);

  const image = ogImage ?? twImage;
  const absoluteImage = image ? toAbsolute(image, baseUrl) : undefined;
  const absoluteCanonical = canonical ? toAbsolute(canonical, baseUrl) : undefined;

  return {
    canonicalUrl: absoluteCanonical,
    title: ogTitle ?? title,
    description: ogDesc ?? desc,
    image: absoluteImage,
    siteName: ogSite,
  };
}

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function toAbsolute(href: string, base: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

interface DbPreview {
  url: string;
  canonicalUrl: string | null;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
}

function toPreviewData(row: DbPreview): PreviewData {
  return {
    url: row.url,
    canonicalUrl: row.canonicalUrl ?? undefined,
    title: row.title ?? undefined,
    description: row.description ?? undefined,
    image: row.image ?? undefined,
    siteName: row.siteName ?? undefined,
  };
}
