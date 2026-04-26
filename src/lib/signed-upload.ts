import { createHash, createHmac } from 'node:crypto';

// minimal aws sigv4 presign for s3-compatible PUT (works against r2 + s3)
// avoids pulling the full @aws-sdk/* tree; we only need single-object PUT presign.

interface PresignInput {
  bucket: string;
  key: string;
  contentType: string;
  expiresInSeconds?: number;
  contentLength?: number;
}

interface PresignedUpload {
  url: string;
  method: 'PUT';
  headers: Record<string, string>;
  expiresAt: string;
}

function s3Config() {
  const endpoint = process.env.S3_ENDPOINT;
  const accessKey = process.env.S3_ACCESS_KEY;
  const secretKey = process.env.S3_SECRET_KEY;
  const region = process.env.S3_REGION ?? 'auto';
  if (!endpoint || !accessKey || !secretKey) {
    throw new Error('S3 credentials not configured (S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY)');
  }
  return { endpoint, accessKey, secretKey, region };
}

function hmac(key: Buffer | string, msg: string): Buffer {
  return createHmac('sha256', key).update(msg).digest();
}

function sha256Hex(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

// rfc3986 percent-encode for path segments (preserves '/')
function encodePath(path: string): string {
  return path
    .split('/')
    .map((seg) =>
      encodeURIComponent(seg).replace(
        /[!'()*]/g,
        (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase(),
      ),
    )
    .join('/');
}

// presign a PUT url for direct browser upload to r2/s3
export function presignUploadUrl(input: PresignInput): PresignedUpload {
  const { endpoint, accessKey, secretKey, region } = s3Config();
  const expires = Math.min(Math.max(input.expiresInSeconds ?? 900, 60), 3600);
  const url = new URL(endpoint.replace(/\/+$/, '') + '/' + input.bucket + '/' + input.key);
  const host = url.host;
  const canonicalUri = encodePath(url.pathname);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;

  const signedHeaders = 'host';
  const params: Record<string, string> = {
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${accessKey}/${credentialScope}`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': String(expires),
    'X-Amz-SignedHeaders': signedHeaders,
  };

  const canonicalQuery = Object.entries(params)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  const canonicalHeaders = `host:${host}\n`;
  const payloadHash = 'UNSIGNED-PAYLOAD';
  const canonicalRequest = [
    'PUT',
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n');

  const kDate = hmac('AWS4' + secretKey, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, 's3');
  const kSigning = hmac(kService, 'aws4_request');
  const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  const finalUrl = `${url.origin}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
  const expiresAt = new Date(now.getTime() + expires * 1000).toISOString();

  return {
    url: finalUrl,
    method: 'PUT',
    headers: {
      // browser must echo content-type so the object content type stays consistent
      'Content-Type': input.contentType,
      ...(input.contentLength !== undefined
        ? { 'Content-Length': String(input.contentLength) }
        : {}),
    },
    expiresAt,
  };
}

// build a stable key for a given user + scope
export function buildUploadKey(scope: string, userId: string, ext: string): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 10);
  const safeExt = /^[a-zA-Z0-9]{1,8}$/.test(ext) ? ext : 'bin';
  return `${scope}/${userId}/${ts}-${rand}.${safeExt}`;
}
